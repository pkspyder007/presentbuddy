interface FeatureToggleProps {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function FeatureToggle({
  id,
  label,
  description,
  enabled,
  onToggle,
  disabled,
}: FeatureToggleProps) {
  return (
    <div className="px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors"
          >
            {label}
          </label>
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <button
          id={id}
          onClick={onToggle}
          disabled={disabled}
          className={`
            relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-out flex-shrink-0
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
            ${enabled 
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
    </div>
  );
}

