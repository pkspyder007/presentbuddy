import type { SystemState } from '../../shared/types';

interface StatusIndicatorProps {
  systemState: SystemState;
}

export default function StatusIndicator({ systemState }: StatusIndicatorProps) {
  const activeCount = Object.values(systemState).filter(Boolean).length;
  const totalCount = Object.keys(systemState).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Active Features</p>
          <p className="text-2xl font-bold text-indigo-600">
            {activeCount} / {totalCount}
          </p>
        </div>
        <div className="flex space-x-2">
          {Object.entries(systemState).map(([key, value]) => (
            <div
              key={key}
              className={`
                w-3 h-3 rounded-full
                ${value ? 'bg-green-500' : 'bg-gray-300'}
              `}
              title={key}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

