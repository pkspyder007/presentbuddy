export const APP_NAME = 'PresentBuddy';
export const APP_VERSION = '0.0.1';

export const IPC_CHANNELS = {
  // System operations
  HIDE_DESKTOP_ICONS: 'system:hide-desktop-icons',
  SHOW_DESKTOP_ICONS: 'system:show-desktop-icons',
  MINIMIZE_ALL_WINDOWS: 'system:minimize-all-windows',
  RESTORE_ALL_WINDOWS: 'system:restore-all-windows',
  CHANGE_WALLPAPER: 'system:change-wallpaper',
  RESTORE_WALLPAPER: 'system:restore-wallpaper',
  MUTE_AUDIO: 'system:mute-audio',
  UNMUTE_AUDIO: 'system:unmute-audio',
  DISABLE_NOTIFICATIONS: 'system:disable-notifications',
  ENABLE_NOTIFICATIONS: 'system:enable-notifications',

  // State management
  GET_SYSTEM_STATE: 'state:get-system-state',
  GET_PLATFORM: 'state:get-platform',
  SAVE_ORIGINAL_STATE: 'state:save-original-state',
  GET_ORIGINAL_STATE: 'state:get-original-state',
  CLEAR_ORIGINAL_STATE: 'state:clear-original-state',

  // Settings
  GET_SETTINGS: 'settings:get',
  SAVE_SETTINGS: 'settings:save',

  // Wallpaper
  SELECT_WALLPAPER_FILE: 'wallpaper:select-file',

  // Hotkey
  TOGGLE_ALL: 'hotkey:toggle-all',

  // State updates
  SYSTEM_STATE_UPDATED: 'state:system-state-updated',
} as const;
