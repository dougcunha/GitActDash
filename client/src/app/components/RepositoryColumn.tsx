"use client";

import StatusTotals from './StatusTotals';
import WorkflowCard from './WorkflowCard';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  private?: boolean;
  owner?: {
    login: string;
    type: 'User' | 'Organization';
  };
  updated_at?: string;
}

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowWithLatestRun {
  workflow_id: number;
  workflow_name: string;
  workflow_path: string;
  workflow_state: string;
  workflow_url: string;
  latest_run: WorkflowRun | null;
}

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
}

export default function RepositoryColumn({
  repo,
  workflows,
  filteredWorkflows,
  activeFilter,
  onFilterToggle,
  getStatusTotals,
}: RepositoryColumnProps) {
  const statusTotals = getStatusTotals(workflows);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
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
      <div className="p-4 flex-1">
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">
              {activeFilter ? 'No workflows match this filter' : 'No workflows found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.workflow_id} workflow={workflow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
