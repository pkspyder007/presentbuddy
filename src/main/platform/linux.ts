import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

const DEFAULT_WALLPAPER = join(__dirname, '../../../assets/wallpapers/default.jpg');

// Detect desktop environment
async function getDesktopEnvironment(): Promise<'gnome' | 'kde' | 'xfce' | 'other'> {
  try {
    const { stdout } = await execAsync('echo $XDG_CURRENT_DESKTOP');
    const de = stdout.trim().toLowerCase();
    if (de.includes('gnome')) return 'gnome';
    if (de.includes('kde')) return 'kde';
    if (de.includes('xfce')) return 'xfce';
    return 'other';
  } catch {
    return 'other';
  }
}

export async function hideDesktopIcons(): Promise<void> {
  try {
    const de = await getDesktopEnvironment();
    
    if (de === 'gnome') {
      await execAsync('gsettings set org.gnome.desktop.background show-desktop-icons false');
    } else if (de === 'kde') {
      await execAsync('kwriteconfig5 --file ~/.config/plasma-org.kde.plasma.desktop-appletsrc --group Containments --group 1 --group Applets --group 1 --key plugin org.kde.desktopcontainment');
    } else {
      throw new Error('Desktop environment not supported for hiding icons');
    }
  } catch (error: any) {
    throw new Error(`Failed to hide desktop icons: ${error.message}`);
  }
}

export async function showDesktopIcons(): Promise<void> {
  try {
    const de = await getDesktopEnvironment();
    
    if (de === 'gnome') {
      await execAsync('gsettings set org.gnome.desktop.background show-desktop-icons true');
    } else if (de === 'kde') {
      // KDE icons are usually always visible, just refresh
      await execAsync('qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "var allDesktops = desktops();"');
    } else {
      throw new Error('Desktop environment not supported for showing icons');
    }
  } catch (error: any) {
    throw new Error(`Failed to show desktop icons: ${error.message}`);
  }
}

export async function minimizeAllWindows(): Promise<void> {
  try {
    // Use wmctrl to minimize all windows
    await execAsync('wmctrl -k off');
    // Alternative: xdotool
    try {
      await execAsync('xdotool key super+d');
    } catch {
      // wmctrl should work
    }
  } catch (error: any) {
    throw new Error(`Failed to minimize windows: ${error.message}`);
  }
}

export async function restoreAllWindows(): Promise<void> {
  try {
    await execAsync('wmctrl -k on');
    try {
      await execAsync('xdotool key super+d');
    } catch {
      // wmctrl should work
    }
  } catch (error: any) {
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
    
    const de = await getDesktopEnvironment();
    let currentWallpaper = '';
    
    if (de === 'gnome') {
      // Get current wallpaper
      const { stdout } = await execAsync('gsettings get org.gnome.desktop.background picture-uri');
      currentWallpaper = stdout.trim().replace(/^'file:\/\//, '').replace(/'$/, '');
      
      // Set new wallpaper
      await execAsync(`gsettings set org.gnome.desktop.background picture-uri "file://${wallpaperPath!}"`);
    } else if (de === 'kde') {
      await execAsync(`qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "var allDesktops = desktops();for (i=0;i<allDesktops.length;i++) {d = allDesktops[i];d.wallpaperPlugin = 'org.kde.image';d.currentConfigGroup = Array('Wallpaper', 'org.kde.image', 'General');d.writeConfig('Image', 'file://${wallpaperPath!}')}"`);
    } else if (de === 'xfce') {
      await execAsync(`xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/last-image -s "${wallpaperPath!}"`);
    } else {
      // Try feh as fallback
      await execAsync(`feh --bg-scale "${wallpaperPath!}"`);
    }
    
    return currentWallpaper;
  } catch (error: any) {
    throw new Error(`Failed to change wallpaper: ${error.message}`);
  }
}

export async function restoreWallpaper(originalPath: string): Promise<void> {
  try {
    const de = await getDesktopEnvironment();
    
    if (de === 'gnome') {
      await execAsync(`gsettings set org.gnome.desktop.background picture-uri "file://${originalPath}"`);
    } else if (de === 'kde') {
      await execAsync(`qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "var allDesktops = desktops();for (i=0;i<allDesktops.length;i++) {d = allDesktops[i];d.wallpaperPlugin = 'org.kde.image';d.currentConfigGroup = Array('Wallpaper', 'org.kde.image', 'General');d.writeConfig('Image', 'file://${originalPath}')}"`);
    } else if (de === 'xfce') {
      await execAsync(`xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/last-image -s "${originalPath}"`);
    } else {
      await execAsync(`feh --bg-scale "${originalPath}"`);
    }
  } catch (error: any) {
    throw new Error(`Failed to restore wallpaper: ${error.message}`);
  }
}

export async function muteAudio(): Promise<number> {
  try {
    // Try PulseAudio first
    try {
      const { stdout } = await execAsync('pactl get-sink-volume @DEFAULT_SINK@ | grep -oP "\\d+%" | head -1 | sed "s/%//"');
      const volume = parseInt(stdout.trim()) || 50;
      await execAsync('pactl set-sink-mute @DEFAULT_SINK@ 1');
      return volume;
    } catch {
      // Fallback to ALSA
      const { stdout } = await execAsync("amixer get Master | grep -oP '\\[\\d+%\\]' | head -1 | sed 's/[\\[\\]%]//g'");
      const volume = parseInt(stdout.trim()) || 50;
      await execAsync('amixer set Master mute');
      return volume;
    }
  } catch (error: any) {
    throw new Error(`Failed to mute audio: ${error.message}`);
  }
}

export async function unmuteAudio(volumeLevel: number): Promise<void> {
  try {
    try {
      await execAsync('pactl set-sink-mute @DEFAULT_SINK@ 0');
      await execAsync(`pactl set-sink-volume @DEFAULT_SINK@ ${volumeLevel}%`);
    } catch {
      await execAsync('amixer set Master unmute');
      await execAsync(`amixer set Master ${volumeLevel}%`);
    }
  } catch (error: any) {
    throw new Error(`Failed to unmute audio: ${error.message}`);
  }
}

export async function disableNotifications(): Promise<void> {
  try {
    // Try different notification daemons
    try {
      // For GNOME
      await execAsync('gsettings set org.gnome.desktop.notifications show-banners false');
    } catch {
      try {
        // For dunst
        await execAsync('killall -SIGUSR1 dunst');
      } catch {
        // For other daemons, try to pause
        await execAsync('notify-send --expire-time=0 "Notifications paused"');
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to disable notifications: ${error.message}`);
  }
}

export async function enableNotifications(): Promise<void> {
  try {
    try {
      await execAsync('gsettings set org.gnome.desktop.notifications show-banners true');
    } catch {
      try {
        await execAsync('killall -SIGUSR2 dunst');
      } catch {
        // Notifications should resume
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to enable notifications: ${error.message}`);
  }
}

