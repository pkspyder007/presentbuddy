import { join } from 'path';
import { app } from 'electron';
import { logger } from '../logger';

let addonInstance: any = null;

// Lazy load the addon
function getWindowHelper() {
  if (addonInstance) {
    return addonInstance;
  }

  try {
    // Try to load the addon
    // In development, it's in native/window-helper-addon
    // In production, it should be bundled with the app
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    
    if (isDev) {
      // In development, require from the addon directory
      const addonPath = join(process.cwd(), 'native/window-helper-addon');
      addonInstance = require(addonPath);
      logger.info('Loaded window helper addon from development path', { path: addonPath });
    } else {
      // In production, the addon should be in the app bundle
      // Try multiple possible locations
      const possiblePaths = [
        join(process.resourcesPath || '', 'native/window-helper-addon'),
        join(app.getAppPath(), 'native/window-helper-addon'),
        join(__dirname, '../../native/window-helper-addon'),
        join(__dirname, '../../../native/window-helper-addon'),
      ];

      let loaded = false;
      for (const path of possiblePaths) {
        try {
          addonInstance = require(path);
          logger.info('Loaded window helper addon from production path', { path });
          loaded = true;
          break;
        } catch (err) {
          // Try next path
          logger.debug('Failed to load addon from path', { path, error: err instanceof Error ? err.message : String(err) });
        }
      }

      if (!loaded) {
        throw new Error('Window helper addon not found in any expected location');
      }
    }

    logger.info('Window helper addon loaded successfully');
    return addonInstance;
  } catch (error) {
    logger.error('Failed to load window helper addon', error instanceof Error ? error : new Error(String(error)), {
      isDev: process.env.NODE_ENV === 'development' || !app.isPackaged,
      resourcesPath: process.resourcesPath,
      appPath: app?.getAppPath(),
      cwd: process.cwd(),
      __dirname,
    });
    throw error;
  }
}

export interface WindowHelperResult {
  success: boolean;
  minimized?: number;
  restored?: number;
  total?: number;
  error: string;
  errorCode: string;
}

export const windowHelper = {
  requestPermission(): boolean {
    try {
      return getWindowHelper().requestPermission();
    } catch (error) {
      logger.error('Failed to request accessibility permission', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  },

  minimizeAllWindows(): WindowHelperResult {
    try {
      return getWindowHelper().minimizeAllWindows();
    } catch (error: any) {
      logger.error('Failed to minimize all windows', error instanceof Error ? error : new Error(error.message));
      return {
        success: false,
        minimized: 0,
        total: 0,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  },

  restoreAllWindows(): WindowHelperResult {
    try {
      return getWindowHelper().restoreAllWindows();
    } catch (error: any) {
      logger.error('Failed to restore all windows', error instanceof Error ? error : new Error(error.message));
      return {
        success: false,
        restored: 0,
        total: 0,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  },

  hideAllApps(): WindowHelperResult {
    try {
      return getWindowHelper().hideAllApps();
    } catch (error: any) {
      logger.error('Failed to hide all apps', error instanceof Error ? error : new Error(error.message));
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  },

  minimizeApp(appName: string): WindowHelperResult {
    try {
      return getWindowHelper().minimizeApp(appName);
    } catch (error: any) {
      logger.error('Failed to minimize app', error instanceof Error ? error : new Error(error.message), { appName });
      return {
        success: false,
        minimized: 0,
        total: 0,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  },

  minimizeAllWindowsExcluding(excludeAppName: string): WindowHelperResult {
    try {
      return getWindowHelper().minimizeAllWindowsExcluding(excludeAppName);
    } catch (error: any) {
      logger.error('Failed to minimize all windows excluding app', error instanceof Error ? error : new Error(error.message), { excludeAppName });
      return {
        success: false,
        minimized: 0,
        total: 0,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  },

  checkAccessibilityPermissions(): boolean {
    try {
      return getWindowHelper().checkAccessibilityPermissions();
    } catch (error) {
      logger.error('Failed to check accessibility permissions', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  },
};

