import { useState, useEffect, useCallback } from 'react';
import type { SystemState, Platform } from '../../shared/types';

export function useSystemState() {
  const [systemState, setSystemState] = useState<SystemState>({
    desktopIconsHidden: false,
    windowsMinimized: false,
    wallpaperChanged: false,
    audioMuted: false,
    notificationsDisabled: false,
  });
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    async function loadState() {
      try {
        const currentPlatform = await window.electronAPI.getPlatform();
        setPlatform(currentPlatform);
        const state = await window.electronAPI.getSystemState();
        setSystemState(state);
      } catch (err: any) {
        setError(err.message || 'Failed to load system state');
      }
    }
    loadState();

    // Listen for state updates from main process (e.g., from system tray)
    const cleanup = window.electronAPI.onSystemStateUpdated((newState) => {
      setSystemState(newState);
    });

    return cleanup;
  }, []);

  const toggleFeature = useCallback(
    async (feature: keyof SystemState) => {
      setIsLoading(true);
      setError(null);

      try {
        const currentValue = systemState[feature];
        let result;

        switch (feature) {
          case 'desktopIconsHidden':
            result = currentValue
              ? await window.electronAPI.showDesktopIcons()
              : await window.electronAPI.hideDesktopIcons();
            break;
          case 'windowsMinimized':
            result = currentValue
              ? await window.electronAPI.restoreAllWindows()
              : await window.electronAPI.minimizeAllWindows();
            break;
          case 'wallpaperChanged':
            result = currentValue
              ? await window.electronAPI.restoreWallpaper()
              : await window.electronAPI.changeWallpaper();
            break;
          case 'audioMuted':
            result = currentValue
              ? await window.electronAPI.unmuteAudio()
              : await window.electronAPI.muteAudio();
            break;
          case 'notificationsDisabled':
            result = currentValue
              ? await window.electronAPI.enableNotifications()
              : await window.electronAPI.disableNotifications();
            break;
          default:
            throw new Error('Unknown feature');
        }

        if (!result.success) {
          throw new Error(result.error || 'Operation failed');
        }

        // Update state
        const newState = await window.electronAPI.getSystemState();
        setSystemState(newState);
      } catch (err: any) {
        setError(err.message || 'Failed to toggle feature');
      } finally {
        setIsLoading(false);
      }
    },
    [systemState]
  );

  const toggleAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allEnabled = Object.values(systemState).every(Boolean);

      if (allEnabled) {
        // Disable all
        await Promise.all([
          systemState.desktopIconsHidden && window.electronAPI.showDesktopIcons(),
          systemState.windowsMinimized && window.electronAPI.restoreAllWindows(),
          systemState.wallpaperChanged && window.electronAPI.restoreWallpaper(),
          systemState.audioMuted && window.electronAPI.unmuteAudio(),
          systemState.notificationsDisabled && window.electronAPI.enableNotifications(),
        ]);
      } else {
        // Enable all
        await Promise.all([
          !systemState.desktopIconsHidden && window.electronAPI.hideDesktopIcons(),
          !systemState.windowsMinimized && window.electronAPI.minimizeAllWindows(),
          !systemState.wallpaperChanged && window.electronAPI.changeWallpaper(),
          !systemState.audioMuted && window.electronAPI.muteAudio(),
          !systemState.notificationsDisabled && window.electronAPI.disableNotifications(),
        ]);
      }

      // Update state
      const newState = await window.electronAPI.getSystemState();
      setSystemState(newState);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle all features');
    } finally {
      setIsLoading(false);
    }
  }, [systemState]);

  return {
    systemState,
    platform,
    toggleFeature,
    toggleAll,
    isLoading,
    error,
  };
}
