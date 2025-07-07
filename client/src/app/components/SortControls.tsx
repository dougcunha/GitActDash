"use client";

interface SortControlsProps {
  sortBy?: 'name' | 'full_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  onSortByChange?: (sortBy: 'name' | 'full_name' | 'updated_at') => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  showSortBySelector?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export default function SortControls({
  sortBy = 'name',
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  showSortBySelector = true,
  label = 'Sort by:',
  size = 'md'
}: SortControlsProps) {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sizeClasses = {
    sm: {
      label: 'text-xs font-medium',
      select: 'px-2 py-1 text-xs',
      button: 'p-1',
      icon: 'w-3 h-3',
      indicator: 'text-xs'
    },
    md: {
      label: 'text-sm font-medium',
      select: 'px-3 py-2 text-sm',
      button: 'p-2',
      icon: 'w-4 h-4',
      indicator: 'text-xs'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      {showSortBySelector && onSortByChange && (
        <>
          <label className={`${classes.label} text-gray-700 dark:text-gray-300`}>
            {label}
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'name' | 'full_name' | 'updated_at')}
            className={`${classes.select} border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600`}
          >
            <option value="name">Name</option>
            <option value="full_name">Full Name</option>
            <option value="updated_at">Last Updated</option>
          </select>
        </>
      )}

      {!showSortBySelector && (
        <label className={`${classes.label} text-gray-700 dark:text-gray-300`}>
          {label}
        </label>
      )}

      <button
        onClick={toggleSortOrder}
        className={`${classes.button} border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600`}
        title={sortOrder === 'asc' ? 'Ascending order (A-Z)' : 'Descending order (Z-A)'}
      >
        {sortOrder === 'asc' ? (
          <svg className={classes.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className={classes.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>

      <span className={`${classes.indicator} text-gray-500 dark:text-gray-400`}>
        {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
      </span>
    </div>
  );
}
