export type Platform = 'windows' | 'macos' | 'linux';

export interface SystemState {
  desktopIconsHidden: boolean;
  windowsMinimized: boolean;
  wallpaperChanged: boolean;
  audioMuted: boolean;
  notificationsDisabled: boolean;
}

export interface OriginalState {
  wallpaperPath?: string;
  volumeLevel?: number;
  notificationState?: boolean;
}

export interface FeatureStatus {
  enabled: boolean;
  error?: string;
}

export interface SystemFeatures {
  hideDesktopIcons: FeatureStatus;
  minimizeWindows: FeatureStatus;
  changeWallpaper: FeatureStatus;
  muteAudio: FeatureStatus;
  disableNotifications: FeatureStatus;
}

export interface AppSettings {
  autoRestore: boolean;
  defaultWallpaper?: string;
  startMinimized: boolean;
  darkMode?: boolean;
}

