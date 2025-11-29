import { useEffect } from 'react';
import MasterToggle from './components/MasterToggle';
import FeatureToggle from './components/FeatureToggle';
import WallpaperToggle from './components/WallpaperToggle';
import { useSystemState } from './hooks/useSystemState';

function App() {
  const {
    systemState,
    platform,
    toggleFeature,
    toggleAll,
    isLoading,
    error,
  } = useSystemState();

  // Listen for global hotkey to toggle all features
  useEffect(() => {
    const cleanup = window.electronAPI.onToggleAllHotkey(() => {
      toggleAll();
    });

    return cleanup;
  }, [toggleAll]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-1 tracking-tight">
            PresentBuddy
          </h1>
          <p className="text-sm text-gray-500 font-light">
            {platform && `${platform.charAt(0).toUpperCase() + platform.slice(1)} • `}
            {Object.values(systemState).filter(Boolean).length} active
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Master Toggle */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <MasterToggle
            enabled={Object.values(systemState).every(Boolean)}
            onToggle={toggleAll}
            disabled={isLoading}
            platform={platform}
          />
        </div>

        {/* Feature Toggles */}
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          <FeatureToggle
            id="desktopIcons"
            label="Desktop Icons"
            enabled={systemState.desktopIconsHidden}
            onToggle={() => toggleFeature('desktopIconsHidden')}
            disabled={isLoading}
          />

          <FeatureToggle
            id="minimizeWindows"
            label="Minimize Windows"
            enabled={systemState.windowsMinimized}
            onToggle={() => toggleFeature('windowsMinimized')}
            disabled={isLoading}
          />

          <WallpaperToggle
            id="wallpaper"
            label="Wallpaper"
            enabled={systemState.wallpaperChanged}
            onToggle={() => toggleFeature('wallpaperChanged')}
            disabled={isLoading}
          />

          <FeatureToggle
            id="muteAudio"
            label="System Audio"
            enabled={systemState.audioMuted}
            onToggle={() => toggleFeature('audioMuted')}
            disabled={isLoading}
          />

          <FeatureToggle
            id="notifications"
            label="Notifications"
            enabled={systemState.notificationsDisabled}
            onToggle={() => toggleFeature('notificationsDisabled')}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

