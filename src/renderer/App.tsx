import { useEffect } from 'react';
import MasterToggle from './components/MasterToggle';
import FeatureToggle from './components/FeatureToggle';
import StatusIndicator from './components/StatusIndicator';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            PresentBuddy
          </h1>
          <p className="text-blue-100 text-lg">
            Prepare your screen for professional presentations
          </p>
          {platform && (
            <p className="text-blue-200 text-sm mt-2">
              Running on {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Master Toggle */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <MasterToggle
            enabled={Object.values(systemState).every(Boolean)}
            onToggle={toggleAll}
            disabled={isLoading}
            platform={platform}
          />
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-xl shadow-2xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Individual Controls
          </h2>

          <FeatureToggle
            id="desktopIcons"
            label="Hide Desktop Icons"
            description="Temporarily hide desktop icons"
            enabled={systemState.desktopIconsHidden}
            onToggle={() => toggleFeature('desktopIconsHidden')}
            disabled={isLoading}
            icon="🖥️"
          />

          <FeatureToggle
            id="minimizeWindows"
            label="Minimize All Windows"
            description="Minimize all open applications"
            enabled={systemState.windowsMinimized}
            onToggle={() => toggleFeature('windowsMinimized')}
            disabled={isLoading}
            icon="📱"
          />

          <FeatureToggle
            id="wallpaper"
            label="Change Wallpaper"
            description="Switch to professional wallpaper"
            enabled={systemState.wallpaperChanged}
            onToggle={() => toggleFeature('wallpaperChanged')}
            disabled={isLoading}
            icon="🖼️"
          />

          <FeatureToggle
            id="muteAudio"
            label="Mute System Audio"
            description="Turn off speakers"
            enabled={systemState.audioMuted}
            onToggle={() => toggleFeature('audioMuted')}
            disabled={isLoading}
            icon="🔇"
          />

          <FeatureToggle
            id="notifications"
            label="Disable Notifications"
            description="Suppress system notifications"
            enabled={systemState.notificationsDisabled}
            onToggle={() => toggleFeature('notificationsDisabled')}
            disabled={isLoading}
            icon="🔔"
          />
        </div>

        {/* Status Indicator */}
        <div className="mt-6">
          <StatusIndicator systemState={systemState} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-100 text-sm">
          <p>Free and Open Source • MIT License</p>
        </div>
      </div>
    </div>
  );
}

export default App;

