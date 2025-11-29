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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-8 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4 pb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            PresentBuddy
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {platform && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Object.values(systemState).filter(Boolean).length}
              </span>
              {' '}of {Object.keys(systemState).length} active
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Master Toggle */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-slate-900/30 transition-all duration-300">
          <MasterToggle
            enabled={Object.values(systemState).every(Boolean)}
            onToggle={toggleAll}
            disabled={isLoading}
            platform={platform}
          />
        </div>

        {/* Feature Toggles */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-slate-900/20 overflow-hidden divide-y divide-slate-100/50 dark:divide-slate-700/50">
          <FeatureToggle
            id="desktopIcons"
            label="Hide Desktop Icons"
            description="Temporarily hide all desktop icons for a clean presentation view"
            enabled={systemState.desktopIconsHidden}
            onToggle={() => toggleFeature('desktopIconsHidden')}
            disabled={isLoading}
          />

          <FeatureToggle
            id="minimizeWindows"
            label="Minimize All Windows"
            description="Minimize all open application windows instantly"
            enabled={systemState.windowsMinimized}
            onToggle={() => toggleFeature('windowsMinimized')}
            disabled={isLoading}
          />

          <WallpaperToggle
            id="wallpaper"
            label="Change Wallpaper"
            enabled={systemState.wallpaperChanged}
            onToggle={() => toggleFeature('wallpaperChanged')}
            disabled={isLoading}
          />

          <FeatureToggle
            id="muteAudio"
            label="Mute System Audio"
            description="Silence all system sounds and audio output"
            enabled={systemState.audioMuted}
            onToggle={() => toggleFeature('audioMuted')}
            disabled={isLoading}
          />

          <FeatureToggle
            id="notifications"
            label="Disable Notifications"
            description="Suppress system notifications to avoid interruptions"
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

