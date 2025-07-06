"use client";

interface RefreshControlsProps {
  isRefreshing: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  countdown: number;
  onManualRefresh: () => void;
  onToggleAutoRefresh: () => void;
  onIntervalChange: (interval: number) => void;
}

export default function RefreshControls({
  isRefreshing,
  autoRefresh,
  refreshInterval,
  countdown,
  onManualRefresh,
  onToggleAutoRefresh,
  onIntervalChange,
}: RefreshControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Manual Refresh Button */}
      <button
        onClick={onManualRefresh}
        disabled={isRefreshing}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          isRefreshing
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
        }`}
      >
        <svg 
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>

      {/* Auto Refresh Toggle */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={onToggleAutoRefresh}
            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Refresh</span>
        </label>
        
        {/* Interval Selector */}
        <select
          value={refreshInterval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          className="text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
          disabled={autoRefresh}
        >
          <option value={10}>10s</option>
          <option value={30}>30s</option>
          <option value={60}>1min</option>
          <option value={120}>2min</option>
          <option value={300}>5min</option>
        </select>

        {/* Countdown Display */}
        {autoRefresh && countdown > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{countdown}s</span>
          </div>
        )}
      </div>
    </div>
  );
}
