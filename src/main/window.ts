import { BrowserWindow, screen, app } from 'electron';
import { join } from 'path';
import { existsSync } from 'fs';
import { isDev } from './utils';
import { logger } from './logger';

// Get the icon path - works in both dev and production
function getIconPath(): string | undefined {
  const isDevMode = isDev();
  
  if (isDevMode) {
    const devPath = join(process.cwd(), 'assets/icons/icon.png');
    if (existsSync(devPath)) {
      return devPath;
    }
  } else {
    // Production: assets are in extraResources
    const prodPath = join(process.resourcesPath || '', 'assets/icons/icon.png');
    if (existsSync(prodPath)) {
      return prodPath;
    }
  }
  
  // Fallback to relative path (for development)
  const fallbackPath = join(__dirname, '../../assets/icons/icon.png');
  return existsSync(fallbackPath) ? fallbackPath : undefined;
}

export function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  logger.info('Creating main window', { width, height });

  const mainWindow = new BrowserWindow({
    width: Math.min(600, width * 0.8),
    // height: Math.max(780, height * 0.8),
    height: 710,
    minWidth: 400,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    icon: getIconPath(),
    show: false,
  });

  // Log renderer process errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logger.error('Renderer failed to load', new Error(errorDescription), {
      errorCode,
      validatedURL,
    });
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logger.error('Renderer process crashed', new Error(details.reason || 'Unknown'), {
      exitCode: details.exitCode,
      reason: details.reason,
    });
  });

  mainWindow.webContents.on('unresponsive', () => {
    logger.warn('Renderer process became unresponsive');
  });

  mainWindow.webContents.on('responsive', () => {
    logger.info('Renderer process became responsive again');
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file from dist directory
    // The dist folder is bundled into the app, so we use app.getAppPath()
    // which points to the app.asar or unpacked app directory
    const htmlPath = join(app.getAppPath(), 'dist', 'index.html');
    logger.info('Loading HTML file', { htmlPath, appPath: app.getAppPath() });
    
    mainWindow.loadFile(htmlPath).catch((error) => {
      logger.error('Failed to load HTML file', error, { htmlPath });
    });
  }

  mainWindow.once('ready-to-show', () => {
    logger.info('Main window ready to show');
    mainWindow.show();
  });

  return mainWindow;
}
