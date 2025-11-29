interface MasterToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  platform?: string | null;
}

export default function MasterToggle({ enabled, onToggle, disabled, platform }: MasterToggleProps) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Master Control
      </h2>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-16 w-32 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform
            ${enabled ? 'translate-x-16' : 'translate-x-1'}
          `}
        />
      </button>
      <p className="mt-4 text-gray-600 font-medium">
        {enabled ? 'All Features Active' : 'All Features Inactive'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        {enabled
          ? 'Click to disable all features'
          : 'Click to enable all features'}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {platform === 'macos' ? '⌘⇧P' : 'Ctrl+Shift+P'} to toggle
      </p>
    </div>
  );
}

