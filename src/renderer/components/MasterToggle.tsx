interface MasterToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  platform?: string | null;
}

export default function MasterToggle({ enabled, onToggle, disabled, platform }: MasterToggleProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
          ${enabled ? 'bg-gray-900' : 'bg-gray-300'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200
            ${enabled ? 'translate-x-6' : 'translate-x-0.5'}
          `}
        />
      </button>
      <p className="mt-4 text-sm font-light text-gray-600">
        {enabled ? 'All active' : 'All inactive'}
      </p>
      <p className="mt-1 text-xs text-gray-400 font-light">
        {platform === 'macos' ? '⌘⇧P' : 'Ctrl+Shift+P'}
      </p>
    </div>
  );
}

