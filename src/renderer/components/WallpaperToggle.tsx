import { useState, useEffect } from 'react';

interface WallpaperToggleProps {
  id: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function WallpaperToggle({
  id,
  label,
  enabled,
  onToggle,
  disabled,
}: WallpaperToggleProps) {
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadCustomWallpaper() {
      try {
        const settings = await window.electronAPI.getSettings();
        if (settings.defaultWallpaper) {
          // Extract just the filename for display
          const filename = settings.defaultWallpaper.split(/[/\\]/).pop() || '';
          setCustomWallpaper(filename);
        }
      } catch (error) {
        console.error('Failed to load custom wallpaper:', error);
      }
    }
    loadCustomWallpaper();
  }, []);

  const handleSelectWallpaper = async () => {
    setIsSelecting(true);
    try {
      const result = await window.electronAPI.selectWallpaperFile();
      if (result.success && result.path) {
        const filename = result.path.split(/[/\\]/).pop() || '';
        setCustomWallpaper(filename);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('Failed to select wallpaper:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors"
          >
            {label}
          </label>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {customWallpaper
              ? `Using custom wallpaper. Toggle to apply it to all desktops.`
              : enabled
                ? `Currently using default wallpaper. Select a custom one below.`
                : `Choose a professional wallpaper to use during presentations.`}
          </p>
        </div>
        <button
          id={id}
          onClick={onToggle}
          disabled={disabled}
          className={`
            relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-out flex-shrink-0
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
            ${
              enabled
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20'
                : 'bg-slate-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
            ${enabled ? 'focus:ring-blue-500' : 'focus:ring-slate-400'}
          `}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
        >
          <span
            className={`
              inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-300 ease-out
              ${enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex-1 min-w-0">
          {customWallpaper ? (
            <div
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                showSuccess
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  showSuccess
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate font-medium">{customWallpaper}</span>
              {showSuccess && (
                <span className="ml-1 text-green-500 dark:text-green-400 animate-fade-in">
                  ✓ Saved
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No custom wallpaper selected
            </p>
          )}
        </div>
        <button
          onClick={handleSelectWallpaper}
          disabled={disabled || isSelecting}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
            ${
              disabled || isSelecting
                ? 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed'
                : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer'
            }
          `}
        >
          {isSelecting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Selecting...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{customWallpaper ? 'Change' : 'Choose'} wallpaper</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
