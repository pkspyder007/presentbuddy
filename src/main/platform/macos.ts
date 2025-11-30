import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';
import { app, dialog } from 'electron';
import { logger } from '../logger';
import { hasAccessibilityPermissions } from './accessibility';
import { windowHelper } from './window-helper';

const execAsync = promisify(exec);

// Get the default wallpaper path - works in both dev and production
function getDefaultWallpaperPath(): string {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    return join(process.cwd(), 'assets/wallpapers/default.jpg');
  } else {
    // Production: assets are in extraResources
    return join(process.resourcesPath || '', 'assets/wallpapers/default.jpg');
  }
}

const DEFAULT_WALLPAPER = getDefaultWallpaperPath();


export async function hideDesktopIcons(): Promise<void> {
  try {
    // macOS: Hide desktop icons using defaults
    await execAsync('defaults write com.apple.finder CreateDesktop false');
    await execAsync('killall Finder');
  } catch (error: any) {
    throw new Error(`Failed to hide desktop icons: ${error.message}`);
  }
}

export async function showDesktopIcons(): Promise<void> {
  try {
    await execAsync('defaults write com.apple.finder CreateDesktop true');
    await execAsync('killall Finder');
  } catch (error: any) {
    throw new Error(`Failed to show desktop icons: ${error.message}`);
  }
}

// Helper function to show permission dialog and open System Settings
async function showPermissionDialogAndOpenSettings(windowCount?: number): Promise<void> {
  const message = windowCount 
    ? `PresentBuddy Mac Window Manager needs Accessibility permissions to minimize windows.

Found ${windowCount} windows but couldn't minimize any.

We'll trigger the permission request and open System Settings.

Please toggle the switch ON in System Settings → Privacy & Security → Accessibility.

After enabling, please try again.`
    : `PresentBuddy Mac Window Manager needs Accessibility permissions to minimize windows.

We'll trigger the permission request and open System Settings.

Please toggle the switch ON in System Settings → Privacy & Security → Accessibility.

After enabling, please try again.`;

  const result = await dialog.showMessageBox({
    type: windowCount ? 'error' : 'warning',
    title: 'Accessibility Permissions Required',
    message,
    buttons: ['Open System Settings', 'OK'],
    defaultId: 0,
  });

  if (result.response === 0) {
    // Trigger permission request using the addon
    try {
      windowHelper.requestPermission();
    } catch {
      // Expected to fail - we just want to trigger the permission request
    }

    // Wait for system to process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Open System Settings
    try {
      await execAsync('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"');
    } catch {
      await execAsync('open "x-apple.systempreferences:com.apple.preference.security"').catch(() => {});
    }
  }
}

export async function minimizeAllWindows(): Promise<void> {
  try {
    // Check accessibility permissions first
    const hasPermissions = await hasAccessibilityPermissions();
    if (!hasPermissions) {
      logger.warn('Accessibility permissions not granted, operation will fail');
      // Don't show dialog here - it was already shown on first start
      // Just throw an error with a clear message
      throw new Error(
        'Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility, then try again.'
      );
    }
    
    logger.info('Calling window helper addon to minimize all windows', { hasPermissions });

    // Use the native addon
    const result = windowHelper.minimizeAllWindows();
    
    logger.info('Window helper addon result', { 
      success: result.success,
      minimized: result.minimized,
      total: result.total,
      error: result.error,
      errorCode: result.errorCode,
    });
    
    if (!result.success) {
      // Check for accessibility permission errors
      if (result.errorCode === 'ACCESSIBILITY_PERMISSION_DENIED' || 
          result.error.includes('accessibility') || 
          result.error.includes('permission')) {
        
        await showPermissionDialogAndOpenSettings(result.total);
        
        throw new Error(
          'Failed to minimize windows: Accessibility permissions required for PresentBuddy Mac Window Manager. Please enable in System Settings → Privacy & Security → Accessibility.'
        );
      }
      
      // Check if windows were found but none were minimized
      if (result.total && result.total > 0 && result.minimized === 0) {
        await showPermissionDialogAndOpenSettings(result.total);
        
        throw new Error(
          `Failed to minimize windows: Found ${result.total} windows but none were minimized. Please grant Accessibility permissions to PresentBuddy Mac Window Manager in System Settings.`
        );
      }
      
      throw new Error(`Failed to minimize windows: ${result.error}`);
    }
    
    if (result.minimized !== undefined && result.total !== undefined) {
      if (result.minimized < result.total) {
        logger.warn('Window helper partially succeeded', {
          minimized: result.minimized,
          total: result.total,
          failed: result.total - result.minimized,
        });
      }
    }
    
    logger.info('Successfully minimized windows', { 
      minimized: result.minimized,
      total: result.total,
    });
  } catch (error: any) {
    logger.error('Failed to minimize windows', error instanceof Error ? error : new Error(error.message), {
      errorCode: error.code,
      errorMessage: error.message,
    });
    
    // Check if it's a permission error
    if ((error.message && error.message.includes('permission')) || error.code === 'EACCES') {
      throw new Error(
        'Failed to minimize windows: Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility.'
      );
    }

    throw error;
  }
}

export async function restoreAllWindows(): Promise<void> {
  try {
    logger.info('Calling window helper addon to restore all windows');

    // Use the native addon
    const result = windowHelper.restoreAllWindows();
    
    logger.info('Window helper addon result', { 
      success: result.success,
      restored: result.restored,
      total: result.total,
      error: result.error,
      errorCode: result.errorCode,
    });
    
    if (!result.success) {
      // Check for accessibility permission errors
      if (result.errorCode === 'ACCESSIBILITY_PERMISSION_DENIED' || 
          result.error.includes('accessibility') || 
          result.error.includes('permission')) {
        throw new Error(
          'Failed to restore windows: Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility.'
        );
      }
      
      throw new Error(`Failed to restore windows: ${result.error}`);
    }
    
    logger.info('Successfully restored all windows', { 
      restored: result.restored,
      total: result.total,
    });
  } catch (error: any) {
    logger.error('Failed to restore windows', error instanceof Error ? error : new Error(error.message), {
      errorCode: error.code,
      errorMessage: error.message,
    });
    
    // Check if it's a permission error
    if ((error.message && error.message.includes('permission')) || error.code === 'EACCES') {
      throw new Error(
        'Failed to restore windows: Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility.'
      );
    }

    throw error;
  }
}

export async function changeWallpaper(path?: string): Promise<string> {
  try {
    let wallpaperPath = path;

    if (!wallpaperPath) {
      if (existsSync(DEFAULT_WALLPAPER)) {
        wallpaperPath = DEFAULT_WALLPAPER;
      } else {
        throw new Error(
          'Please provide a wallpaper path or add a default wallpaper to assets/wallpapers/'
        );
      }
    }

    // Get current wallpaper
    const { stdout } = await execAsync(
      `osascript -e 'tell application "System Events" to get picture of current desktop'`
    );
    const currentWallpaper = stdout.trim().replace(/'/g, '');

    // Set new wallpaper
    await execAsync(
      `osascript -e 'tell application "System Events" to set picture of current desktop to "${wallpaperPath!}"'`
    );

    return currentWallpaper;
  } catch (error: any) {
    throw new Error(`Failed to change wallpaper: ${error.message}`);
  }
}

export async function restoreWallpaper(originalPath: string): Promise<void> {
  try {
    await execAsync(
      `osascript -e 'tell application "System Events" to set picture of current desktop to "${originalPath}"'`
    );
  } catch (error: any) {
    throw new Error(`Failed to restore wallpaper: ${error.message}`);
  }
}

export async function muteAudio(): Promise<number> {
  try {
    // Get current volume
    const { stdout } = await execAsync(`osascript -e 'output volume of (get volume settings)'`);
    const volume = parseInt(stdout.trim()) || 50;

    // Mute audio
    await execAsync(`osascript -e 'set volume output muted true'`);

    return volume;
  } catch (error: any) {
    throw new Error(`Failed to mute audio: ${error.message}`);
  }
}

export async function unmuteAudio(volumeLevel: number): Promise<void> {
  try {
    // Unmute and set volume
    await execAsync(`osascript -e 'set volume output muted false'`);
    await execAsync(`osascript -e 'set volume output volume ${volumeLevel}'`);
  } catch (error: any) {
    throw new Error(`Failed to unmute audio: ${error.message}`);
  }
}

export async function disableNotifications(): Promise<void> {
  try {
    // macOS: Enable Do Not Disturb
    await execAsync(
      `defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb -bool true`
    );
    // Get current date and set it
    const { stdout: dateOutput } = await execAsync('date');
    const dateValue = dateOutput.trim();
    await execAsync(
      `defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturbDate -date "${dateValue}"`
    );
    await execAsync(`killall NotificationCenter`);
  } catch (error: any) {
    throw new Error(`Failed to disable notifications: ${error.message}`);
  }
}

export async function enableNotifications(): Promise<void> {
  try {
    await execAsync(
      `defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb -bool false`
    );
    await execAsync(`killall NotificationCenter`);
  } catch (error: any) {
    throw new Error(`Failed to enable notifications: ${error.message}`);
  }
}
