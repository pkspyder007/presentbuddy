import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

const DEFAULT_WALLPAPER = join(__dirname, '../../../assets/wallpapers/default.jpg');

export async function hideDesktopIcons(): Promise<void> {
  try {
    // Windows: Hide desktop icons using registry
    await execAsync(
      'reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideIcons /t REG_DWORD /d 1 /f'
    );
    // Refresh desktop
    await execAsync('taskkill /f /im explorer.exe && start explorer.exe');
  } catch (error: any) {
    throw new Error(`Failed to hide desktop icons: ${error.message}`);
  }
}

export async function showDesktopIcons(): Promise<void> {
  try {
    await execAsync(
      'reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideIcons /t REG_DWORD /d 0 /f'
    );
    await execAsync('taskkill /f /im explorer.exe && start explorer.exe');
  } catch (error: any) {
    throw new Error(`Failed to show desktop icons: ${error.message}`);
  }
}

export async function minimizeAllWindows(): Promise<void> {
  try {
    // Use PowerShell to minimize all windows
    await execAsync(
      'powershell -Command "Add-Type -TypeDefinition \'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport(\\"user32.dll\\")] public static extern int SendMessage(int hWnd, int Msg, int wParam, int lParam); public static void MinimizeAll() { SendMessage(0xFFFF, 0x0111, 0, 0); } }\'; [Win32]::MinimizeAll()"'
    );
  } catch (error: any) {
    throw new Error(`Failed to minimize windows: ${error.message}`);
  }
}

export async function restoreAllWindows(): Promise<void> {
  try {
    // Restore windows using Win+M (minimize) then Win+Shift+M (restore)
    await execAsync('powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]91+[char]77+[char]93+[char]91+[char]16+[char]77+[char]93)"');
  } catch (error: any) {
    throw new Error(`Failed to restore windows: ${error.message}`);
  }
}

export async function changeWallpaper(path?: string): Promise<string> {
  try {
    let wallpaperPath = path;
    
    if (!wallpaperPath) {
      // If no path provided and default doesn't exist, use a solid color approach
      if (existsSync(DEFAULT_WALLPAPER)) {
        wallpaperPath = DEFAULT_WALLPAPER;
      } else {
        // For now, we'll use the system's default or let the user provide one
        throw new Error('Please provide a wallpaper path or add a default wallpaper to assets/wallpapers/');
      }
    }
    
    // Get current wallpaper first
    const { stdout } = await execAsync(
      'reg query "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper'
    );
    const currentWallpaper = stdout.split(/\r?\n/).find((line: string) => line.includes('Wallpaper'));
    
    // Set new wallpaper
    await execAsync(
      `powershell -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Wallpaper { [DllImport(\\"user32.dll\\", CharSet=CharSet.Auto)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); public static void Set(string path) { SystemParametersInfo(20, 0, path, 3); } }'; [Wallpaper]::Set('${wallpaperPath!.replace(/\\/g, '\\\\')}')"`
    );
    
    // Extract current wallpaper path from registry output
    const originalPath = currentWallpaper ? currentWallpaper.split(/\s+/).pop()?.trim() : '';
    return originalPath || '';
  } catch (error: any) {
    throw new Error(`Failed to change wallpaper: ${error.message}`);
  }
}

export async function restoreWallpaper(originalPath: string): Promise<void> {
  try {
    await execAsync(
      `powershell -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Wallpaper { [DllImport(\\"user32.dll\\", CharSet=CharSet.Auto)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); public static void Set(string path) { SystemParametersInfo(20, 0, path, 3); } }'; [Wallpaper]::Set('${originalPath.replace(/\\/g, '\\\\')}')"`
    );
  } catch (error: any) {
    throw new Error(`Failed to restore wallpaper: ${error.message}`);
  }
}

export async function muteAudio(): Promise<number> {
  try {
    // Get current volume
    const { stdout } = await execAsync(
      'powershell -Command "(Get-AudioDevice -List).Volume"'
    );
    const volume = parseInt(stdout.trim()) || 50;
    
    // Mute audio
    await execAsync('powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]173)"');
    
    return volume;
  } catch (error: any) {
    // Fallback: use nircmd if available, or try alternative method
    try {
      await execAsync('nircmd.exe mutesysvolume 1');
      return 50; // Default volume if we can't detect
    } catch {
      throw new Error(`Failed to mute audio: ${error.message}`);
    }
  }
}

export async function unmuteAudio(volumeLevel: number): Promise<void> {
  try {
    // Unmute and set volume
    await execAsync('powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]174)"');
    await execAsync(
      `powershell -Command "(Get-AudioDevice -List).Volume = ${volumeLevel}"`
    );
  } catch (error: any) {
    try {
      await execAsync('nircmd.exe mutesysvolume 0');
      await execAsync(`nircmd.exe setsysvolume ${volumeLevel * 655} ${volumeLevel * 655}`);
    } catch {
      throw new Error(`Failed to unmute audio: ${error.message}`);
    }
  }
}

export async function disableNotifications(): Promise<void> {
  try {
    // Enable Focus Assist (Windows 10/11)
    await execAsync(
      'powershell -Command "Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" -Name "NOC_GLOBAL_SETTING_TOAST_SIZE" -Value 2"'
    );
    // Alternative: Use Focus Assist API
    await execAsync(
      'powershell -Command "Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore\\Store\\Cache\\DefaultAccount\\$windows.data.notifications.quiethourssettings\\Current" -Name "Data" -Value ([byte[]](2,0,0,0))"'
    );
  } catch (error: any) {
    throw new Error(`Failed to disable notifications: ${error.message}`);
  }
}

export async function enableNotifications(): Promise<void> {
  try {
    await execAsync(
      'powershell -Command "Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" -Name "NOC_GLOBAL_SETTING_TOAST_SIZE" -Value 0"'
    );
  } catch (error: any) {
    throw new Error(`Failed to enable notifications: ${error.message}`);
  }
}

