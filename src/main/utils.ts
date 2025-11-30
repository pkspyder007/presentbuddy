import { app } from 'electron';

export function isDev(): boolean {
  // app.isPackaged is the most reliable indicator - it's always true in packaged apps
  // If the app is packaged, it's definitely production mode, regardless of NODE_ENV
  if (app.isPackaged) {
    return false;
  }
  
  // If not packaged, check NODE_ENV
  // In development, NODE_ENV should be 'development'
  return process.env.NODE_ENV === 'development';
}

export function getPlatform(): 'windows' | 'macos' | 'linux' {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  return 'linux';
}
