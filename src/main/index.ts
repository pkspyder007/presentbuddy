import { app, ipcMain, BrowserWindow, globalShortcut, dialog } from 'electron';
import { createWindow } from './window';
import { getPlatform } from './utils';
import { IPC_CHANNELS } from '../shared/constants';
import type { SystemState, OriginalState, AppSettings } from '../shared/types';
import * as platformHandlers from './platform';
import * as storage from './storage';
import { checkAndPromptAccessibilityPermissions } from './platform/accessibility';
import { createTray, updateTray, destroyTray } from './tray';
import { logger } from './logger';

let mainWindow: BrowserWindow | null = null;
let originalState: OriginalState = {};
const systemState: SystemState = {
  desktopIconsHidden: false,
  windowsMinimized: false,
  wallpaperChanged: false,
  audioMuted: false,
  notificationsDisabled: false,
};

const platform = getPlatform();

// Helper function to update system state and notify both tray and renderer
function updateSystemState(newState?: Partial<SystemState>): void {
  if (newState) {
    Object.assign(systemState, newState);
  }
  // Update tray
  updateTray(mainWindow, systemState);
  // Notify renderer
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SYSTEM_STATE_UPDATED, systemState);
  }
}

// Set up global error handlers for runtime error logging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error, {
    platform,
    isPackaged: app.isPackaged,
  });
  // Don't exit in production, just log
  if (!app.isPackaged) {
    throw error;
  }
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error('Unhandled Promise Rejection', error, {
    platform,
    isPackaged: app.isPackaged,
    promise: String(promise),
  });
});

// Log app startup
logger.info('Application starting', {
  platform,
  version: app.getVersion(),
  isPackaged: app.isPackaged,
  logDir: logger.getLogDir(),
});

app.whenReady().then(async () => {
  logger.info('Application ready');
  // Load saved state
  originalState = await storage.getOriginalState();

  mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  // Check Accessibility permissions on macOS (required for window management)
  // Only prompt on first start/install
  if (platform === 'macos') {
    const hasRequestedBefore = await storage.hasRequestedAccessibilityPermissions();
    if (!hasRequestedBefore) {
      logger.info('First start detected, checking accessibility permissions');
      const hasPermissions = await checkAndPromptAccessibilityPermissions(true);
      if (hasPermissions) {
        await storage.setAccessibilityPermissionsRequested();
        logger.info('Accessibility permissions granted on first start');
      } else {
        await storage.setAccessibilityPermissionsRequested();
        logger.info('Accessibility permissions requested (user may need to enable manually)');
      }
    } else {
      logger.debug('Accessibility permissions already requested, skipping prompt');
    }
  }

  // Initialize platform handlers
  platformHandlers.initialize(platform);

  // Register global hotkey for toggling all features
  // Use Cmd+Shift+P on macOS, Ctrl+Shift+P on Windows/Linux
  const hotkey = process.platform === 'darwin' ? 'Command+Shift+P' : 'Control+Shift+P';
  const registered = globalShortcut.register(hotkey, () => {
    if (mainWindow) {
      mainWindow.webContents.send(IPC_CHANNELS.TOGGLE_ALL);
    }
  });

  if (!registered) {
    logger.warn('Failed to register global hotkey', { hotkey });
  } else {
    logger.info('Global hotkey registered', { hotkey });
  }

  // Create system tray with handler functions
  const trayHandlers = {
    hideDesktopIcons: async () => {
      try {
        await platformHandlers.hideDesktopIcons(platform);
        updateSystemState({ desktopIconsHidden: true });
        return { success: true };
      } catch (error: any) {
        logger.error('hideDesktopIcons failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    showDesktopIcons: async () => {
      try {
        await platformHandlers.showDesktopIcons(platform);
        updateSystemState({ desktopIconsHidden: false });
        return { success: true };
      } catch (error: any) {
        logger.error('showDesktopIcons failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    minimizeAllWindows: async () => {
      try {
        await platformHandlers.minimizeAllWindows(platform);
        updateSystemState({ windowsMinimized: true });
        return { success: true };
      } catch (error: any) {
        logger.error('minimizeAllWindows failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    restoreAllWindows: async () => {
      try {
        await platformHandlers.restoreAllWindows(platform);
        updateSystemState({ windowsMinimized: false });
        return { success: true };
      } catch (error: any) {
        logger.error('restoreAllWindows failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    changeWallpaper: async (path?: string) => {
      try {
        // If no path provided, check for custom wallpaper in settings
        let wallpaperPath = path;
        if (!wallpaperPath) {
          const settings = await storage.getSettings();
          if (settings.defaultWallpaper) {
            wallpaperPath = settings.defaultWallpaper;
          }
        }

        const originalWallpaperPath = await platformHandlers.changeWallpaper(
          platform,
          wallpaperPath
        );
        if (!originalState.wallpaperPath) {
          originalState.wallpaperPath = originalWallpaperPath;
        }
        updateSystemState({ wallpaperChanged: true });
        return { success: true, wallpaperPath: originalWallpaperPath };
      } catch (error: any) {
        logger.error('changeWallpaper failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    restoreWallpaper: async () => {
      try {
        if (originalState.wallpaperPath) {
          await platformHandlers.restoreWallpaper(platform, originalState.wallpaperPath);
          originalState.wallpaperPath = undefined;
        }
        updateSystemState({ wallpaperChanged: false });
        return { success: true };
      } catch (error: any) {
        logger.error('restoreWallpaper failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    muteAudio: async () => {
      try {
        const volumeLevel = await platformHandlers.muteAudio(platform);
        if (originalState.volumeLevel === undefined) {
          originalState.volumeLevel = volumeLevel;
        }
        updateSystemState({ audioMuted: true });
        return { success: true };
      } catch (error: any) {
        logger.error('muteAudio failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    unmuteAudio: async () => {
      try {
        if (originalState.volumeLevel !== undefined) {
          await platformHandlers.unmuteAudio(platform, originalState.volumeLevel);
          originalState.volumeLevel = undefined;
        }
        updateSystemState({ audioMuted: false });
        return { success: true };
      } catch (error: any) {
        logger.error('unmuteAudio failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    disableNotifications: async () => {
      try {
        await platformHandlers.disableNotifications(platform);
        updateSystemState({ notificationsDisabled: true });
        return { success: true };
      } catch (error: any) {
        logger.error('disableNotifications failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    enableNotifications: async () => {
      try {
        await platformHandlers.enableNotifications(platform);
        updateSystemState({ notificationsDisabled: false });
        return { success: true };
      } catch (error: any) {
        logger.error('enableNotifications failed', error instanceof Error ? error : new Error(error.message), {
          platform,
        });
        return { success: false, error: error.message };
      }
    },
    getSystemState: () => systemState,
  };

  // Create system tray
  createTray(mainWindow, systemState, trayHandlers);
  logger.info('System tray created');
});

app.on('window-all-closed', async () => {
  // Restore all settings before quitting if auto-restore is enabled
  await restoreAllSettings();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
  await restoreAllSettings();
});

app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
  // Destroy system tray
  destroyTray();
  logger.info('Application quitting');
});

async function restoreAllSettings() {
  try {
    if (systemState.desktopIconsHidden) {
      await platformHandlers.showDesktopIcons(platform);
    }
    if (systemState.wallpaperChanged && originalState.wallpaperPath) {
      await platformHandlers.restoreWallpaper(platform, originalState.wallpaperPath);
    }
    if (systemState.audioMuted && originalState.volumeLevel !== undefined) {
      await platformHandlers.unmuteAudio(platform, originalState.volumeLevel);
    }
    if (systemState.notificationsDisabled) {
      await platformHandlers.enableNotifications(platform);
    }
  } catch (error) {
    logger.error('Error restoring settings', error instanceof Error ? error : new Error(String(error)), {
      platform,
      systemState,
    });
  }
}

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.GET_PLATFORM, () => platform);

ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_STATE, () => {
  // Update tray when state is requested
  updateTray(mainWindow, systemState);
  return systemState;
});

ipcMain.handle(IPC_CHANNELS.HIDE_DESKTOP_ICONS, async () => {
  try {
    await platformHandlers.hideDesktopIcons(platform);
    updateSystemState({ desktopIconsHidden: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.SHOW_DESKTOP_ICONS, async () => {
  try {
    await platformHandlers.showDesktopIcons(platform);
    updateSystemState({ desktopIconsHidden: false });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.MINIMIZE_ALL_WINDOWS, async () => {
  try {
    await platformHandlers.minimizeAllWindows(platform);
    updateSystemState({ windowsMinimized: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.RESTORE_ALL_WINDOWS, async () => {
  try {
    await platformHandlers.restoreAllWindows(platform);
    updateSystemState({ windowsMinimized: false });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.CHANGE_WALLPAPER, async (_, path?: string) => {
  try {
    // If no path provided, check for custom wallpaper in settings
    let wallpaperPath = path;
    if (!wallpaperPath) {
      const settings = await storage.getSettings();
      if (settings.defaultWallpaper) {
        wallpaperPath = settings.defaultWallpaper;
      }
    }

    const originalWallpaperPath = await platformHandlers.changeWallpaper(platform, wallpaperPath);
    if (!originalState.wallpaperPath) {
      originalState.wallpaperPath = originalWallpaperPath;
    }
    updateSystemState({ wallpaperChanged: true });
    return { success: true, wallpaperPath: originalWallpaperPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.RESTORE_WALLPAPER, async () => {
  try {
    if (originalState.wallpaperPath) {
      await platformHandlers.restoreWallpaper(platform, originalState.wallpaperPath);
      originalState.wallpaperPath = undefined;
    }
    updateSystemState({ wallpaperChanged: false });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.MUTE_AUDIO, async () => {
  try {
    const volumeLevel = await platformHandlers.muteAudio(platform);
    if (originalState.volumeLevel === undefined) {
      originalState.volumeLevel = volumeLevel;
    }
    updateSystemState({ audioMuted: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.UNMUTE_AUDIO, async () => {
  try {
    if (originalState.volumeLevel !== undefined) {
      await platformHandlers.unmuteAudio(platform, originalState.volumeLevel);
      originalState.volumeLevel = undefined;
    }
    updateSystemState({ audioMuted: false });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.DISABLE_NOTIFICATIONS, async () => {
  try {
    await platformHandlers.disableNotifications(platform);
    updateSystemState({ notificationsDisabled: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.ENABLE_NOTIFICATIONS, async () => {
  try {
    await platformHandlers.enableNotifications(platform);
    updateSystemState({ notificationsDisabled: false });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.SAVE_ORIGINAL_STATE, async (_, state: OriginalState) => {
  originalState = { ...originalState, ...state };
  await storage.saveOriginalState(originalState);
});

ipcMain.handle(IPC_CHANNELS.GET_ORIGINAL_STATE, async () => {
  return await storage.getOriginalState();
});

ipcMain.handle(IPC_CHANNELS.CLEAR_ORIGINAL_STATE, async () => {
  originalState = {};
  await storage.clearOriginalState();
});

// Settings handlers
ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
  return await storage.getSettings();
});

ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, async (_, settings: AppSettings) => {
  await storage.saveSettings(settings);
  return { success: true };
});

// Wallpaper file selection
ipcMain.handle(IPC_CHANNELS.SELECT_WALLPAPER_FILE, async () => {
  try {
    if (!mainWindow) {
      return { success: false, error: 'Main window not available' };
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Wallpaper',
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const selectedPath = result.filePaths[0];

    // Save to settings
    const settings = await storage.getSettings();
    settings.defaultWallpaper = selectedPath;
    await storage.saveSettings(settings);

    return { success: true, path: selectedPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
