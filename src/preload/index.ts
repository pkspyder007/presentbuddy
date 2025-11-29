import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { SystemState, OriginalState, AppSettings, Platform } from '../shared/types';

const electronAPI = {
  // System operations
  hideDesktopIcons: () => ipcRenderer.invoke(IPC_CHANNELS.HIDE_DESKTOP_ICONS),
  showDesktopIcons: () => ipcRenderer.invoke(IPC_CHANNELS.SHOW_DESKTOP_ICONS),
  minimizeAllWindows: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_ALL_WINDOWS),
  restoreAllWindows: () => ipcRenderer.invoke(IPC_CHANNELS.RESTORE_ALL_WINDOWS),
  changeWallpaper: (path?: string) => ipcRenderer.invoke(IPC_CHANNELS.CHANGE_WALLPAPER, path),
  restoreWallpaper: () => ipcRenderer.invoke(IPC_CHANNELS.RESTORE_WALLPAPER),
  muteAudio: () => ipcRenderer.invoke(IPC_CHANNELS.MUTE_AUDIO),
  unmuteAudio: () => ipcRenderer.invoke(IPC_CHANNELS.UNMUTE_AUDIO),
  disableNotifications: () => ipcRenderer.invoke(IPC_CHANNELS.DISABLE_NOTIFICATIONS),
  enableNotifications: () => ipcRenderer.invoke(IPC_CHANNELS.ENABLE_NOTIFICATIONS),
  
  // State management
  getSystemState: (): Promise<SystemState> => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_STATE),
  getPlatform: (): Promise<Platform> => ipcRenderer.invoke(IPC_CHANNELS.GET_PLATFORM),
  saveOriginalState: (state: OriginalState) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_ORIGINAL_STATE, state),
  getOriginalState: (): Promise<OriginalState> => ipcRenderer.invoke(IPC_CHANNELS.GET_ORIGINAL_STATE),
  clearOriginalState: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_ORIGINAL_STATE),
  
  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  
  // Wallpaper
  selectWallpaperFile: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_WALLPAPER_FILE),
  
  // Hotkey listener
  onToggleAllHotkey: (callback: () => void) => {
    ipcRenderer.on(IPC_CHANNELS.TOGGLE_ALL, callback);
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TOGGLE_ALL, callback);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

