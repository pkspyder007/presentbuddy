import { app, ipcMain, BrowserWindow, globalShortcut } from 'electron';
import { createWindow } from './window';
import { getPlatform } from './utils';
import { IPC_CHANNELS } from '../shared/constants';
import type { SystemState, OriginalState, AppSettings } from '../shared/types';
import * as platformHandlers from './platform';
import * as storage from './storage';
import { checkAndPromptAccessibilityPermissions } from './platform/accessibility';

let mainWindow: BrowserWindow | null = null;
let originalState: OriginalState = {};
let systemState: SystemState = {
  desktopIconsHidden: false,
  windowsMinimized: false,
  wallpaperChanged: false,
  audioMuted: false,
  notificationsDisabled: false,
};

const platform = getPlatform();

app.whenReady().then(async () => {
  // Load saved state
  originalState = await storage.getOriginalState();
  
  mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  // Check Accessibility permissions on macOS (required for window management)
  if (platform === 'macos') {
    // Check permissions but don't block app startup if missing
    // The actual operations will show error messages if permissions are needed
    checkAndPromptAccessibilityPermissions(true).catch((error) => {
      console.warn('Error checking accessibility permissions:', error);
    });
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
    console.error('Failed to register global hotkey:', hotkey);
  } else {
    console.log('Global hotkey registered:', hotkey);
  }
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
    console.error('Error restoring settings:', error);
  }
}

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.GET_PLATFORM, () => platform);

ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_STATE, () => systemState);

ipcMain.handle(IPC_CHANNELS.HIDE_DESKTOP_ICONS, async () => {
  try {
    await platformHandlers.hideDesktopIcons(platform);
    systemState.desktopIconsHidden = true;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.SHOW_DESKTOP_ICONS, async () => {
  try {
    await platformHandlers.showDesktopIcons(platform);
    systemState.desktopIconsHidden = false;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.MINIMIZE_ALL_WINDOWS, async () => {
  try {
    await platformHandlers.minimizeAllWindows(platform);
    systemState.windowsMinimized = true;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.RESTORE_ALL_WINDOWS, async () => {
  try {
    await platformHandlers.restoreAllWindows(platform);
    systemState.windowsMinimized = false;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.CHANGE_WALLPAPER, async (_, path?: string) => {
  try {
    const wallpaperPath = await platformHandlers.changeWallpaper(platform, path);
    if (!originalState.wallpaperPath) {
      originalState.wallpaperPath = wallpaperPath;
    }
    systemState.wallpaperChanged = true;
    return { success: true, wallpaperPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.RESTORE_WALLPAPER, async () => {
  try {
    if (originalState.wallpaperPath) {
      await platformHandlers.restoreWallpaper(platform, originalState.wallpaperPath);
      systemState.wallpaperChanged = false;
      originalState.wallpaperPath = undefined;
    }
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
    systemState.audioMuted = true;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.UNMUTE_AUDIO, async () => {
  try {
    if (originalState.volumeLevel !== undefined) {
      await platformHandlers.unmuteAudio(platform, originalState.volumeLevel);
      systemState.audioMuted = false;
      originalState.volumeLevel = undefined;
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.DISABLE_NOTIFICATIONS, async () => {
  try {
    await platformHandlers.disableNotifications(platform);
    systemState.notificationsDisabled = true;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(IPC_CHANNELS.ENABLE_NOTIFICATIONS, async () => {
  try {
    await platformHandlers.enableNotifications(platform);
    systemState.notificationsDisabled = false;
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

