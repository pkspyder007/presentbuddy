import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, statSync, chmodSync } from 'fs';
import { app, dialog } from 'electron';
import { logger } from '../logger';
import { hasAccessibilityPermissions } from './accessibility';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

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

// Get the macOS window helper path - works in both dev and production
function getWindowHelperPath(): string | null {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // Development: Try multiple possible locations
    // 1. From project root (process.cwd())
    const devPath1 = join(process.cwd(), 'native/window-helper/bin/MacWindowHelper');
    if (existsSync(devPath1)) {
      logger.debug('Found MacWindowHelper at dev path 1', { path: devPath1 });
      return devPath1;
    }

    // 2. From __dirname (relative to compiled main process)
    const devPath2 = join(__dirname, '../../native/window-helper/bin/MacWindowHelper');
    if (existsSync(devPath2)) {
      logger.debug('Found MacWindowHelper at dev path 2', { path: devPath2 });
      return devPath2;
    }

    // 3. From app path if available
    if (app && app.isReady()) {
      const devPath3 = join(app.getAppPath(), 'native/window-helper/bin/MacWindowHelper');
      if (existsSync(devPath3)) {
        logger.debug('Found MacWindowHelper at dev path 3', { path: devPath3 });
        return devPath3;
      }
    }
  } else {
    // Production: Try multiple possible locations
    const pathsToTry = [];
    
    // 1. Primary location: resources/MacWindowHelper (from extraResources)
    if (process.resourcesPath) {
      pathsToTry.push(join(process.resourcesPath, 'MacWindowHelper'));
    }
    
    // 2. Alternative: Check in app bundle Resources
    if (app && app.isPackaged) {
      const appPath = app.getAppPath();
      // For .app bundles, resources might be in Contents/Resources
      pathsToTry.push(join(appPath, '../Resources/MacWindowHelper'));
      pathsToTry.push(join(appPath, '../../Resources/MacWindowHelper'));
    }
    
    // 3. Check in app.asar.unpacked if it exists
    if (process.resourcesPath) {
      pathsToTry.push(join(process.resourcesPath, 'app.asar.unpacked', 'MacWindowHelper'));
    }

    for (const prodPath of pathsToTry) {
      if (existsSync(prodPath)) {
        logger.info('Found MacWindowHelper in production', { path: prodPath });
        
        // Ensure the binary is executable
        try {
          const stats = statSync(prodPath);
          // Check if executable (on Unix: any execute bit set)
          if (process.platform === 'darwin' || process.platform === 'linux') {
            const mode = stats.mode;
            const isExecutable = (mode & parseInt('111', 8)) !== 0;
            if (!isExecutable) {
              logger.warn('MacWindowHelper is not executable, fixing permissions', { path: prodPath });
              chmodSync(prodPath, '755');
            }
          }
        } catch (err) {
          logger.warn('Could not check/fix MacWindowHelper permissions', { 
            path: prodPath, 
            error: err instanceof Error ? err.message : String(err) 
          });
        }
        
        return prodPath;
      }
    }
    
    // Log all paths we tried for debugging
    const error = new Error('MacWindowHelper not found in any production location');
    logger.error('MacWindowHelper not found in any production location', error, {
      pathsTried: pathsToTry,
      resourcesPath: process.resourcesPath,
      appPath: app?.getAppPath(),
      isPackaged: app?.isPackaged,
    });
  }

  return null;
}

// Check if window helper binary exists and show error if not
async function ensureWindowHelperExists(): Promise<string> {
  const helperPath = getWindowHelperPath();

  if (!helperPath || !existsSync(helperPath)) {
    const errorMessage = 'Window Helper is missing or not signed properly.';
    logger.error('MacWindowHelper not found', new Error(errorMessage), {
      helperPath,
      resourcesPath: process.resourcesPath,
      appPath: app?.getAppPath(),
      isPackaged: app?.isPackaged,
      isDev: process.env.NODE_ENV === 'development' || !app.isPackaged,
    });

    // Show error dialog if app is ready
    if (app && app.isReady()) {
      await dialog.showErrorBox(
        'Window Helper Missing',
        errorMessage + '\n\nPlease rebuild the application or contact support.\n\nLogs are available in: ' + logger.getLogDir()
      );
    }

    throw new Error(errorMessage);
  }

  logger.debug('MacWindowHelper verified', { path: helperPath });
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

// Check if MacWindowHelper binary has accessibility permissions
// Helper function to show permission dialog and open System Settings
async function showPermissionDialogAndOpenSettings(helperPath: string, windowCount?: number): Promise<void> {
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
    // Trigger permission request
    try {
      await execFileAsync(helperPath, ['request-permission'], {
        env: { ...process.env, NO_DIALOG: '1' },
        timeout: 3000,
      });
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
    
    // macOS: Minimize all windows using the Swift helper
    const helperPath = await ensureWindowHelperExists();
    
    logger.info('Executing MacWindowHelper minimize-all', { 
      helperPath, 
      hasPermissions,
    });

    // Use execFile for better security (no shell injection)
    // Capture both stdout and stderr, and check exit code
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    
    try {
      // Set NO_DIALOG=1 to suppress native helper dialogs (Electron will show its own)
      const result = await execFileAsync(helperPath, ['minimize-all'], {
        timeout: 5000, // 5 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
        env: { ...process.env, NO_DIALOG: '1' },
      });
      stdout = result.stdout || '';
      stderr = result.stderr || '';
      exitCode = 0;
    } catch (error: any) {
      // execFile throws on non-zero exit codes, but we want to capture the output
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      exitCode = error.code || -1;
      
      logger.warn('MacWindowHelper execution completed with error', {
        exitCode,
        stdout,
        stderr,
        errorMessage: error.message,
      });
    }

    // Log all output for debugging
    if (stderr && stderr.trim()) {
      logger.warn('MacWindowHelper stderr', { stderr, exitCode });
    }

    if (stdout && stdout.trim()) {
      logger.info('MacWindowHelper stdout', { stdout, exitCode });
    }
    
    // Check exit code - non-zero means failure
    if (exitCode !== 0) {
      const errorMsg = stderr || stdout || 'Unknown error';
      logger.error('MacWindowHelper failed with non-zero exit code', new Error(errorMsg), {
        exitCode,
        stdout,
        stderr,
      });
      
      // Check for accessibility permission errors
      if (stderr.includes('accessibility') || stderr.includes('permission') || 
          stdout.includes('accessibility') || stdout.includes('permission') ||
          stderr.includes('Failed to minimize') || stderr.includes('Failed to restore')) {
        
        await showPermissionDialogAndOpenSettings(helperPath);
        
        throw new Error(
          'Failed to minimize windows: Accessibility permissions required for PresentBuddy Mac Window Manager. Please enable in System Settings → Privacy & Security → Accessibility.'
        );
      }
      
      throw new Error(`Failed to minimize windows: ${errorMsg}`);
    }
    
    // Parse the output to see how many windows were actually minimized
    if (stdout && stdout.includes('Minimized')) {
      // Output format: "Minimized X/Y windows"
      const match = stdout.match(/Minimized (\d+)\/(\d+) windows/);
      if (match) {
        const minimized = parseInt(match[1]);
        const total = parseInt(match[2]);
        
        logger.info('MacWindowHelper result', { minimized, total, stdout, stderr });
        
        if (minimized === 0 && total > 0) {
          // Windows were found but none were minimized - likely a permissions issue
          const error = new Error(`Found ${total} windows but failed to minimize any`);
          logger.error('MacWindowHelper found windows but failed to minimize any', error, {
            total,
            stdout,
            stderr,
            helperPath,
          });
          
          await showPermissionDialogAndOpenSettings(helperPath, total);
          
          throw new Error(
            `Failed to minimize windows: Found ${total} windows but none were minimized. Please grant Accessibility permissions to PresentBuddy Mac Window Manager in System Settings.`
          );
        } else if (minimized < total) {
          logger.warn('MacWindowHelper partially succeeded', {
            minimized,
            total,
            failed: total - minimized,
          });
        }
      }
    } else if (stdout.trim() === '' && stderr.trim() === '') {
      // No output at all - this shouldn't happen with the updated Swift code
      logger.warn('MacWindowHelper returned no output', {
        exitCode,
        helperPath,
      });
    }
    
    logger.info('MacWindowHelper executed successfully', { exitCode, stdout, stderr });
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
    // macOS: Restore all minimized windows using the Swift helper
    const helperPath = await ensureWindowHelperExists();
    
    logger.info('Executing MacWindowHelper restore-all', { helperPath });

    // Use execFile for better security (no shell injection)
    // Capture both stdout and stderr, and check exit code
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    
    try {
      // Set NO_DIALOG=1 to suppress native helper dialogs (Electron will show its own)
      const result = await execFileAsync(helperPath, ['restore-all'], {
        env: { ...process.env, NO_DIALOG: '1' },
      });
      stdout = result.stdout || '';
      stderr = result.stderr || '';
      exitCode = 0;
    } catch (error: any) {
      // execFile throws on non-zero exit codes, but we want to capture the output
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      exitCode = error.code || -1;
      
      logger.warn('MacWindowHelper execution completed with error', {
        exitCode,
        stdout,
        stderr,
        errorMessage: error.message,
      });
    }

    // Log all output for debugging
    if (stderr && stderr.trim()) {
      logger.warn('MacWindowHelper stderr', { stderr, exitCode });
    }

    if (stdout && stdout.trim()) {
      logger.info('MacWindowHelper stdout', { stdout, exitCode });
    }
    
    // Check exit code - non-zero means failure
    if (exitCode !== 0) {
      const errorMsg = stderr || stdout || 'Unknown error';
      logger.error('MacWindowHelper failed with non-zero exit code', new Error(errorMsg), {
        exitCode,
        stdout,
        stderr,
      });
      
      // Check for accessibility permission errors
      if (stderr.includes('accessibility') || stderr.includes('permission') || 
          stdout.includes('accessibility') || stdout.includes('permission')) {
        throw new Error(
          'Failed to restore windows: Accessibility permissions required. Please enable in System Settings → Privacy & Security → Accessibility.'
        );
      }
      
      throw new Error(`Failed to restore windows: ${errorMsg}`);
    }
    
    logger.info('Successfully restored all windows', { exitCode });
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
