import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

const DEFAULT_WALLPAPER = join(__dirname, '../../assets/wallpapers/default.jpg');

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
    // macOS: Minimize all windows using AppleScript
    await execAsync(
      `osascript -e 'tell application "System Events" to keystroke "m" using {command down, option down}'`
    );
  } catch (error: any) {
    throw new Error(`Failed to minimize windows: ${error.message}`);
  }
}

export async function restoreAllWindows(): Promise<void> {
  try {
    // macOS: Restore windows using Mission Control or Dock
    await execAsync(
      `osascript -e 'tell application "System Events" to keystroke "m" using {command down, option down, shift down}'`
    );
  } catch (error: any) {
    // Alternative: Use Dock to restore
    await execAsync(
      `osascript -e 'tell application "Dock" to activate'`
    );
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

