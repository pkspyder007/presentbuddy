import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import { join } from 'path';
import type { SystemState } from '../shared/types';

let tray: Tray | null = null;
let currentSystemState: SystemState;
let mainWindowRef: BrowserWindow | null = null;
let ipcHandlers: {
  hideDesktopIcons: () => Promise<any>;
  showDesktopIcons: () => Promise<any>;
  minimizeAllWindows: () => Promise<any>;
  restoreAllWindows: () => Promise<any>;
  changeWallpaper: (path?: string) => Promise<any>;
  restoreWallpaper: () => Promise<any>;
  muteAudio: () => Promise<any>;
  unmuteAudio: () => Promise<any>;
  disableNotifications: () => Promise<any>;
  enableNotifications: () => Promise<any>;
  getSystemState: () => SystemState;
} | null = null;

// Get the appropriate icon path for the current platform
function getTrayIconPath(): string {
  const { existsSync } = require('fs');
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const basePath = isDev 
    ? join(process.cwd(), 'assets/icons')
    : join(process.resourcesPath || '', 'assets/icons');

  // Try platform-specific icons first, fallback to PNG
  if (process.platform === 'darwin') {
    // macOS prefers template images (monochrome)
    const trayTemplate = join(basePath, 'trayTemplate.png');
    if (existsSync(trayTemplate)) {
      return trayTemplate;
    }
    // Fallback to regular icon
    return join(basePath, 'icon.png');
  } else if (process.platform === 'win32') {
    // Windows: try 16x16 tray icon first, then ICO
    const trayIcon = join(basePath, 'trayIcon16.png');
    if (existsSync(trayIcon)) {
      return trayIcon;
    }
    return join(basePath, 'icon.ico');
  } else {
    // Linux uses PNG
    const trayIcon = join(basePath, 'trayIcon16.png');
    if (existsSync(trayIcon)) {
      return trayIcon;
    }
    return join(basePath, 'icon.png');
  }
}

// Create a simple tray icon if the file doesn't exist
function createTrayIcon() {
  const iconPath = getTrayIconPath();
  const { existsSync } = require('fs');
  
  if (existsSync(iconPath)) {
    const icon = nativeImage.createFromPath(iconPath);
    if (!icon.isEmpty()) {
      // macOS needs template images for proper theming (only for trayTemplate.png)
      if (process.platform === 'darwin' && iconPath.includes('trayTemplate')) {
        icon.setTemplateImage(true);
      }
      return icon;
    }
  }
  
  // Fallback: Try common icon locations
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const basePath = isDev 
    ? join(process.cwd(), 'assets/icons')
    : join(process.resourcesPath || '', 'assets/icons');
  
  const fallbackPaths = [
    join(basePath, 'icon.png'),
    join(basePath, 'icon.ico'),
    join(basePath, 'icon.icns'),
    join(__dirname, '../../assets/icons/icon.png'),
    join(__dirname, '../../assets/icons/icon.ico'),
  ];
  
  for (const path of fallbackPaths) {
    if (existsSync(path)) {
      const icon = nativeImage.createFromPath(path);
      if (!icon.isEmpty()) {
        // Resize to appropriate tray size
        const resized = icon.resize({ width: 16, height: 16 });
        if (process.platform === 'darwin') {
          resized.setTemplateImage(true);
        }
        return resized;
      }
    }
  }
  
  // Ultimate fallback: create a simple 16x16 colored icon using Buffer
  // Create a simple PNG-like buffer (minimal valid PNG)
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  // Fill with indigo color (RGBA)
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = 99;     // R
    buffer[i + 1] = 102; // G
    buffer[i + 2] = 241; // B
    buffer[i + 3] = 255; // A
  }
  
  const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }
  return icon;
}

// Create the context menu
function createTrayMenu(): Menu {
  const systemState = currentSystemState;
  const allEnabled = Object.values(systemState).every(Boolean);
  
  return Menu.buildFromTemplate([
    {
      label: 'PresentBuddy',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: allEnabled ? 'Disable All Features' : 'Enable All Features',
      click: async () => {
        if (ipcHandlers && mainWindowRef) {
          const allEnabled = Object.values(currentSystemState).every(Boolean);
          
          if (allEnabled) {
            // Disable all
            if (currentSystemState.desktopIconsHidden) await ipcHandlers.showDesktopIcons();
            if (currentSystemState.windowsMinimized) await ipcHandlers.restoreAllWindows();
            if (currentSystemState.wallpaperChanged) await ipcHandlers.restoreWallpaper();
            if (currentSystemState.audioMuted) await ipcHandlers.unmuteAudio();
            if (currentSystemState.notificationsDisabled) await ipcHandlers.enableNotifications();
          } else {
            // Enable all
            if (!currentSystemState.desktopIconsHidden) await ipcHandlers.hideDesktopIcons();
            if (!currentSystemState.windowsMinimized) await ipcHandlers.minimizeAllWindows();
            if (!currentSystemState.wallpaperChanged) await ipcHandlers.changeWallpaper();
            if (!currentSystemState.audioMuted) await ipcHandlers.muteAudio();
            if (!currentSystemState.notificationsDisabled) await ipcHandlers.disableNotifications();
          }
          
          // Get updated state and refresh menu
          if (ipcHandlers.getSystemState) {
            currentSystemState = ipcHandlers.getSystemState();
            updateTrayMenu();
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: systemState.desktopIconsHidden ? 'Show Desktop Icons' : 'Hide Desktop Icons',
      type: 'checkbox',
      checked: systemState.desktopIconsHidden,
      click: async () => {
        if (ipcHandlers) {
          if (systemState.desktopIconsHidden) {
            await ipcHandlers.showDesktopIcons();
          } else {
            await ipcHandlers.hideDesktopIcons();
          }
          // Get updated state
          if (ipcHandlers.getSystemState) {
            currentSystemState = ipcHandlers.getSystemState();
            updateTrayMenu();
          }
        }
      },
    },
    {
      label: systemState.windowsMinimized ? 'Restore All Windows' : 'Minimize All Windows',
      type: 'checkbox',
      checked: systemState.windowsMinimized,
      click: async () => {
        if (ipcHandlers) {
          if (systemState.windowsMinimized) {
            await ipcHandlers.restoreAllWindows();
          } else {
            await ipcHandlers.minimizeAllWindows();
          }
          if (ipcHandlers.getSystemState) {
            currentSystemState = ipcHandlers.getSystemState();
            updateTrayMenu();
          }
        }
      },
    },
    {
      label: systemState.wallpaperChanged ? 'Restore Wallpaper' : 'Change Wallpaper',
      type: 'checkbox',
      checked: systemState.wallpaperChanged,
      click: async () => {
        if (ipcHandlers) {
          if (systemState.wallpaperChanged) {
            await ipcHandlers.restoreWallpaper();
          } else {
            await ipcHandlers.changeWallpaper();
          }
          if (ipcHandlers.getSystemState) {
            currentSystemState = ipcHandlers.getSystemState();
            updateTrayMenu();
          }
        }
      },
    },
    {
      label: systemState.audioMuted ? 'Unmute Audio' : 'Mute Audio',
      type: 'checkbox',
      checked: systemState.audioMuted,
      click: async () => {
        if (ipcHandlers) {
          if (systemState.audioMuted) {
            await ipcHandlers.unmuteAudio();
          } else {
            await ipcHandlers.muteAudio();
          }
          if (ipcHandlers.getSystemState) {
            currentSystemState = ipcHandlers.getSystemState();
            updateTrayMenu();
          }
        }
      },
    },
    {
      label: systemState.notificationsDisabled ? 'Enable Notifications' : 'Disable Notifications',
      type: 'checkbox',
      checked: systemState.notificationsDisabled,
      click: async () => {
        if (ipcHandlers) {
          if (systemState.notificationsDisabled) {
            await ipcHandlers.enableNotifications();
          } else {
            await ipcHandlers.disableNotifications();
          }
          if (ipcHandlers.getSystemState) {
            currentSystemState = ipcHandlers.getSystemState();
            updateTrayMenu();
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: mainWindowRef?.isVisible() ? 'Hide Window' : 'Show Window',
      click: () => {
        if (mainWindowRef) {
          if (mainWindowRef.isVisible()) {
            mainWindowRef.hide();
          } else {
            mainWindowRef.show();
            mainWindowRef.focus();
          }
          updateTrayMenu();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
}

// Update the tray menu with current state
function updateTrayMenu(): void {
  if (!tray) return;
  
  const menu = createTrayMenu();
  tray.setContextMenu(menu);
  
  // Update tooltip
  const enabledCount = Object.values(currentSystemState).filter(Boolean).length;
  const totalCount = Object.keys(currentSystemState).length;
  tray.setToolTip(`PresentBuddy - ${enabledCount}/${totalCount} features active`);
}

// Initialize the system tray
export function createTray(
  mainWindow: BrowserWindow | null,
  systemState: SystemState,
  handlers: typeof ipcHandlers
): Tray {
  if (tray) {
    tray.destroy();
  }

  // Store references
  mainWindowRef = mainWindow;
  currentSystemState = systemState;
  ipcHandlers = handlers;

  const icon = createTrayIcon();
  tray = new Tray(icon);

  // Set tooltip
  const enabledCount = Object.values(systemState).filter(Boolean).length;
  const totalCount = Object.keys(systemState).length;
  tray.setToolTip(`PresentBuddy - ${enabledCount}/${totalCount} features active`);

  // On macOS, click should show the menu
  // On Windows/Linux, click should toggle window visibility
  if (process.platform === 'darwin') {
    tray.on('click', () => {
      tray?.popUpContextMenu();
    });
  } else {
    tray.on('click', () => {
      if (mainWindowRef) {
        if (mainWindowRef.isVisible()) {
          mainWindowRef.hide();
        } else {
          mainWindowRef.show();
          mainWindowRef.focus();
        }
        updateTrayMenu();
      }
    });
  }

  // Create initial menu
  updateTrayMenu();

  return tray;
}

// Update tray with new state
export function updateTray(mainWindow: BrowserWindow | null, systemState: SystemState): void {
  mainWindowRef = mainWindow;
  currentSystemState = systemState;
  updateTrayMenu();
}

// Destroy the tray
export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

