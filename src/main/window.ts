import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { isDev } from './utils';

export function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  console.log("🚀 ~ createWindow ~ width, height:", width, height)
  
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
    icon: join(__dirname, '../../assets/icons/icon.png'),
    show: false,
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

