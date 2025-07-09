"use client";

interface StatusTotalsProps {
  totals: {
    success: number;
    failure: number;
    in_progress: number;
    no_runs: number;
    total: number;
  };
  activeFilter: string | null;
  onFilterToggle: (filterType: string) => void;
  filteredCount: number;
}

export default function StatusTotals({
  totals,
  activeFilter,
  onFilterToggle,
  filteredCount,
}: StatusTotalsProps) {
  return (
    <>
      {/* Clickable Status Totals */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={() => onFilterToggle('in_progress')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeFilter === 'in_progress'
              ? 'bg-yellow-200 dark:bg-yellow-900 ring-2 ring-yellow-400 dark:ring-yellow-600 shadow-md'
              : 'bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
          }`}
        >
          <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{totals.in_progress}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">Running</div>
        </button>
        <button
          onClick={() => onFilterToggle('failure')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeFilter === 'failure'
              ? 'bg-red-200 dark:bg-red-900 ring-2 ring-red-400 dark:ring-red-600 shadow-md'
              : 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
          }`}
        >
          <div className="text-lg font-bold text-red-700 dark:text-red-400">{totals.failure}</div>
          <div className="text-xs text-red-600 dark:text-red-400">Failed</div>
        </button>
        <button
          onClick={() => onFilterToggle('success')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeFilter === 'success'
              ? 'bg-green-200 dark:bg-green-900 ring-2 ring-green-400 dark:ring-green-600 shadow-md'
              : 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50'
          }`}
        >
          <div className="text-lg font-bold text-green-700 dark:text-green-400">{totals.success}</div>
          <div className="text-xs text-green-600 dark:text-green-400">Success</div>
        </button>
        <button
          onClick={() => onFilterToggle('no_runs')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeFilter === 'no_runs'
              ? 'bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-400 dark:ring-gray-500 shadow-md'
              : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
        >
          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{totals.no_runs}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">No Runs</div>
        </button>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activeFilter ? (
            <>
              Showing {filteredCount} of {totals.total} workflow{totals.total !== 1 ? 's' : ''}
              <button
                onClick={() => onFilterToggle('')}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                Clear filter
              </button>
            </>
          ) : (
            <>Total: {totals.total} workflow{totals.total !== 1 ? 's' : ''}</>
          )}
        </span>
      </div>
    </>
  );
}
