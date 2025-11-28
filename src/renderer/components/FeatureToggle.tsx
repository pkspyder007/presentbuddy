interface FeatureToggleProps {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  icon?: string;
}

export default function FeatureToggle({
  id,
  label,
  description,
  enabled,
  onToggle,
  disabled,
  icon,
}: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{label}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform
            ${enabled ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}

