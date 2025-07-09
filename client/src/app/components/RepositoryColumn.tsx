"use client";

import StatusTotals from './StatusTotals';
import WorkflowCard from './WorkflowCard';
import type { Repo, WorkflowWithLatestRun } from '@/types/github';

interface RepositoryColumnProps {
  repo: Repo;
  workflows: WorkflowWithLatestRun[];
  filteredWorkflows: WorkflowWithLatestRun[];
  activeFilter: string | null;
  onFilterToggle: (filterType: string) => void;
  getStatusTotals: (workflows: WorkflowWithLatestRun[]) => {
    success: number;
    failure: number;
    in_progress: number;
    no_runs: number;
    total: number;
  };
  isLoading?: boolean;
}

export default function RepositoryColumn({
  repo,
  workflows,
  filteredWorkflows,
  activeFilter,
  onFilterToggle,
  getStatusTotals,
  isLoading = false,
}: RepositoryColumnProps) {
  const statusTotals = getStatusTotals(workflows);

  // Skeleton loader component for workflow cards
  const WorkflowCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </div>
  );

  // Loading overlay for when refreshing existing workflows
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center rounded-lg">
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm">Refreshing...</span>
      </div>
    </div>
  );

  // Show skeleton loaders when loading
  const renderWorkflowContent = () => {
    if (isLoading && workflows.length === 0) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <WorkflowCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (filteredWorkflows.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">
            {activeFilter ? 'No workflows match this filter' : 'No workflows found'}
          </p>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="space-y-3">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.workflow_id} workflow={workflow} />
          ))}
        </div>
        {/* Show loading overlay when refreshing existing workflows */}
        {isLoading && workflows.length > 0 && <LoadingOverlay />}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm w-full min-w-[320px] max-w-[360px]">
      {/* Column Header with Repository Info and Status Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{repo.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{repo.full_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {repo.owner?.type === 'Organization' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Org
              </span>
            )}
            {repo.private && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Private
              </span>
            )}
          </div>
        </div>

        <StatusTotals
          totals={statusTotals}
          activeFilter={activeFilter}
          onFilterToggle={onFilterToggle}
          filteredCount={filteredWorkflows.length}
        />
      </div>
      {/* Workflows List */}
      <div className="p-4">
        {renderWorkflowContent()}
      </div>
    </div>
  );
}
