interface FeatureToggleProps {
  id: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function FeatureToggle({
  id,
  label,
  enabled,
  onToggle,
  disabled,
}: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
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
  );
}

