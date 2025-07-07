"use client";

import React from 'react';

export type TabType = 'repos' | 'actions';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedCount: number;
}

export default function TabNavigation({ activeTab, onTabChange, selectedCount }: Props) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('repos')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === 'repos'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Select Repositories
          {selectedCount > 0 && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('actions')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === 'actions'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          disabled={selectedCount === 0}
        >
          Action Status
          {selectedCount === 0 && (
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(Select repos first)</span>
          )}
        </button>
      </nav>
    </div>
  );
}
