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
      }
    } catch (error: any) {
      console.error('Failed to select wallpaper:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="flex-1 text-sm font-light text-gray-700 cursor-pointer"
        >
          {label}
        </label>
        <button
          id={id}
          onClick={onToggle}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
            ${enabled ? 'bg-gray-900' : 'bg-gray-300'}
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
              ${enabled ? 'translate-x-6' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={handleSelectWallpaper}
          disabled={disabled || isSelecting}
          className={`
            text-xs font-light text-gray-500 hover:text-gray-700 transition-colors
            ${disabled || isSelecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isSelecting ? 'Selecting...' : customWallpaper ? `Using: ${customWallpaper}` : 'Select wallpaper'}
        </button>
      </div>
    </div>
  );
}

