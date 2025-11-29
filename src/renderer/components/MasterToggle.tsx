interface MasterToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  platform?: string | null;
}

export default function MasterToggle({ enabled, onToggle, disabled, platform }: MasterToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Master Control</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {enabled 
            ? 'All presentation features are active. Toggle off to restore everything.'
            : 'Enable all features at once to prepare your screen for presentations.'
          }
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">Quick toggle</div>
          <kbd className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md">
            {platform === 'macos' ? '⌘⇧P' : 'Ctrl+Shift+P'}
          </kbd>
        </div>
        
        <div className="relative">
          <button
            onClick={onToggle}
            disabled={disabled}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
              ${enabled 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30' 
                : 'bg-slate-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
              ${enabled ? 'focus:ring-blue-500' : 'focus:ring-slate-400'}
            `}
            aria-label={enabled ? 'Disable all features' : 'Enable all features'}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-out
                ${enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

