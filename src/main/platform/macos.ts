import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';
import { app, dialog } from 'electron';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

const DEFAULT_WALLPAPER = join(__dirname, '../../assets/wallpapers/default.jpg');

// Get the macOS window helper path - works in both dev and production
function getWindowHelperPath(): string | null {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // Development: Try multiple possible locations
    // 1. From project root (process.cwd())
    const devPath1 = join(process.cwd(), 'native/window-helper/bin/MacWindowHelper');
    if (existsSync(devPath1)) {
      return devPath1;
    }
    
    // 2. From __dirname (relative to compiled main process)
    const devPath2 = join(__dirname, '../../native/window-helper/bin/MacWindowHelper');
    if (existsSync(devPath2)) {
      return devPath2;
    }
    
    // 3. From app path if available
    if (app && app.isReady()) {
      const devPath3 = join(app.getAppPath(), 'native/window-helper/bin/MacWindowHelper');
      if (existsSync(devPath3)) {
        return devPath3;
      }
    }
  } else {
    // Production: Binary is in resources/MacWindowHelper (from extraResources)
    if (process.resourcesPath) {
      const prodPath = join(process.resourcesPath, 'MacWindowHelper');
      if (existsSync(prodPath)) {
        return prodPath;
      }
    }
  }
  
  return null;
}

// Check if window helper binary exists and show error if not
async function ensureWindowHelperExists(): Promise<string> {
  const helperPath = getWindowHelperPath();
  
  if (!helperPath || !existsSync(helperPath)) {
    const errorMessage = 'Window Helper is missing or not signed properly.';
    console.error(errorMessage);
    
    // Show error dialog if app is ready
    if (app && app.isReady()) {
      await dialog.showErrorBox(
        'Window Helper Missing',
        errorMessage + '\n\nPlease rebuild the application or contact support.'
      );
    }
    
    throw new Error(errorMessage);
  }
  
  return helperPath;
}

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

export async function minimizeAllWindows(): Promise<void> {
  try {
    // macOS: Minimize all windows using the Swift helper
    const helperPath = await ensureWindowHelperExists();
    
    // Use execFile for better security (no shell injection)
    const { stdout, stderr } = await execFileAsync(helperPath, ['minimize-all']);
    
    if (stderr && stderr.trim()) {
      console.warn('MacWindowHelper stderr:', stderr);
    }
    
    if (stdout && stdout.trim()) {
      console.log('MacWindowHelper output:', stdout);
    }
  } catch (error: any) {
    // Check if it's a permission error
    if (error.message && error.message.includes('permission') || error.code === 'EACCES') {
      throw new Error('Failed to minimize windows: Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility.');
    }
    
    // Check for non-zero exit code
    if (error.code && error.code !== 0) {
      console.warn(`MacWindowHelper exited with code ${error.code}:`, error.message);
    }
    
    throw new Error(`Failed to minimize windows: ${error.message}`);
  }
}

export async function restoreAllWindows(): Promise<void> {
  try {
    // macOS: Restore all minimized windows using the Swift helper
    const helperPath = await ensureWindowHelperExists();
    
    // Use execFile for better security (no shell injection)
    const { stdout, stderr } = await execFileAsync(helperPath, ['restore-all']);
    
    if (stderr && stderr.trim()) {
      console.warn('MacWindowHelper stderr:', stderr);
    }
    
    if (stdout && stdout.trim()) {
      console.log('MacWindowHelper output:', stdout);
    }
  } catch (error: any) {
    // Check if it's a permission error
    if (error.message && error.message.includes('permission') || error.code === 'EACCES') {
      throw new Error('Failed to restore windows: Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility.');
    }
    
    // Check for non-zero exit code
    if (error.code && error.code !== 0) {
      console.warn(`MacWindowHelper exited with code ${error.code}:`, error.message);
    }
    
    throw new Error(`Failed to restore windows: ${error.message}`);
  }
}

export async function changeWallpaper(path?: string): Promise<string> {
  try {
    let wallpaperPath = path;
    
    if (!wallpaperPath) {
      if (existsSync(DEFAULT_WALLPAPER)) {
        wallpaperPath = DEFAULT_WALLPAPER;
      } else {
        throw new Error('Please provide a wallpaper path or add a default wallpaper to assets/wallpapers/');
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
    const { stdout } = await execAsync(
      `osascript -e 'output volume of (get volume settings)'`
    );
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

