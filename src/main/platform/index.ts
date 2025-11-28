import type { Platform } from '../../shared/types';
import * as windows from './windows';
import * as macos from './macos';
import * as linux from './linux';

export function initialize(platform: Platform) {
  // Platform-specific initialization if needed
  console.log(`Initializing platform handlers for: ${platform}`);
}

export async function hideDesktopIcons(platform: Platform): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.hideDesktopIcons();
    case 'macos':
      return macos.hideDesktopIcons();
    case 'linux':
      return linux.hideDesktopIcons();
  }
}

export async function showDesktopIcons(platform: Platform): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.showDesktopIcons();
    case 'macos':
      return macos.showDesktopIcons();
    case 'linux':
      return linux.showDesktopIcons();
  }
}

export async function minimizeAllWindows(platform: Platform): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.minimizeAllWindows();
    case 'macos':
      return macos.minimizeAllWindows();
    case 'linux':
      return linux.minimizeAllWindows();
  }
}

export async function restoreAllWindows(platform: Platform): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.restoreAllWindows();
    case 'macos':
      return macos.restoreAllWindows();
    case 'linux':
      return linux.restoreAllWindows();
  }
}

export async function changeWallpaper(platform: Platform, path?: string): Promise<string> {
  switch (platform) {
    case 'windows':
      return windows.changeWallpaper(path);
    case 'macos':
      return macos.changeWallpaper(path);
    case 'linux':
      return linux.changeWallpaper(path);
  }
}

export async function restoreWallpaper(platform: Platform, originalPath: string): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.restoreWallpaper(originalPath);
    case 'macos':
      return macos.restoreWallpaper(originalPath);
    case 'linux':
      return linux.restoreWallpaper(originalPath);
  }
}

export async function muteAudio(platform: Platform): Promise<number> {
  switch (platform) {
    case 'windows':
      return windows.muteAudio();
    case 'macos':
      return macos.muteAudio();
    case 'linux':
      return linux.muteAudio();
  }
}

export async function unmuteAudio(platform: Platform, volumeLevel: number): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.unmuteAudio(volumeLevel);
    case 'macos':
      return macos.unmuteAudio(volumeLevel);
    case 'linux':
      return linux.unmuteAudio(volumeLevel);
  }
}

export async function disableNotifications(platform: Platform): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.disableNotifications();
    case 'macos':
      return macos.disableNotifications();
    case 'linux':
      return linux.disableNotifications();
  }
}

export async function enableNotifications(platform: Platform): Promise<void> {
  switch (platform) {
    case 'windows':
      return windows.enableNotifications();
    case 'macos':
      return macos.enableNotifications();
    case 'linux':
      return linux.enableNotifications();
  }
}

