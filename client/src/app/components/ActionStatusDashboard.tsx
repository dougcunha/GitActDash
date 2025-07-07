"use client";

import { useEffect, useState, useRef } from 'react';
import RefreshControls from './RefreshControls';
import RepositoryColumn from './RepositoryColumn';
import SortControls from './SortControls';

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

interface Props {
  selectedRepos: number[];
  repos: Repo[];
  workflows: Record<number, WorkflowWithLatestRun[]>;
  workflowsLoading: boolean;
  onRefreshWorkflows: () => Promise<void>;
}

export default function ActionStatusDashboard({
  selectedRepos,
  repos,
  workflows,
  workflowsLoading,
  onRefreshWorkflows
}: Props) {
  const [activeFilters, setActiveFilters] = useState<Record<number, string | null>>({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [countdown, setCountdown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filtros de tipo e busca (iguais à aba de repositórios)
  const [repoFilter, setRepoFilter] = useState<'all' | 'personal' | 'organization'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Refs for intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to refresh workflows data
  const refreshWorkflows = async () => {
    setIsRefreshing(true);
    await onRefreshWorkflows();
    setIsRefreshing(false);
    setLastUpdated(new Date());
  };

  // Function to start auto refresh
  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) return;

    setCountdown(refreshInterval);

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshWorkflows();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function to stop auto refresh
  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(0);
  };

  // Function to toggle auto refresh
  const toggleAutoRefresh = () => {
    const newAutoRefresh = !autoRefresh;
    setAutoRefresh(newAutoRefresh);

    if (newAutoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // Function to manual refresh
  const handleManualRefresh = () => {
    refreshWorkflows();
    if (autoRefresh) {
      setCountdown(refreshInterval);
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Effect to handle auto refresh changes
  useEffect(() => {
    if (autoRefresh && selectedRepos.length > 0) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [autoRefresh, refreshInterval]);

  // Function to calculate status totals for a repository
  const getStatusTotals = (repoWorkflows: WorkflowWithLatestRun[]) => {
    const totals = {
      success: 0,
      failure: 0,
      in_progress: 0,
      no_runs: 0,
      total: repoWorkflows.length
    };

    repoWorkflows.forEach(workflow => {
      if (!workflow.latest_run) {
        totals.no_runs++;
      } else if (workflow.latest_run.status === 'completed') {
        if (workflow.latest_run.conclusion === 'success') {
          totals.success++;
        } else {
          totals.failure++;
        }
      } else if (workflow.latest_run.status === 'in_progress') {
        totals.in_progress++;
      } else {
        totals.no_runs++;
      }
    });

    return totals;
  };

  // Function to get workflow status for filtering
  const getWorkflowStatus = (workflow: WorkflowWithLatestRun): string => {
    if (!workflow.latest_run) {
      return 'no_runs';
    } else if (workflow.latest_run.status === 'completed') {
      return workflow.latest_run.conclusion === 'success' ? 'success' : 'failure';
    } else if (workflow.latest_run.status === 'in_progress') {
      return 'in_progress';
    } else {
      return 'no_runs';
    }
  };

  // Function to filter workflows based on active filter
  const getFilteredWorkflows = (repoId: number, repoWorkflows: WorkflowWithLatestRun[]) => {
    const activeFilter = activeFilters[repoId];
    if (!activeFilter) {
      return repoWorkflows;
    }
    return repoWorkflows.filter(workflow => getWorkflowStatus(workflow) === activeFilter);
  };

  // Function to handle filter toggle
  const toggleFilter = (repoId: number, filterType: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [repoId]: prev[repoId] === filterType ? null : filterType
    }));
  };

  // Function to get sorted repositories
  const getSortedRepos = (): Repo[] => {
    return selectedRepos
      .map(repoId => repos.find(r => r.id === repoId))
      .filter((repo): repo is Repo => repo !== undefined)
      .sort((a, b) => {
        const compareValue = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
  };

  const selectedReposDetails = selectedRepos
    .map(repoId => repos.find(r => r.id === repoId))
    .filter((repo): repo is Repo => repo !== undefined);

  const personalReposCount = selectedReposDetails.filter(r => r.owner?.type === 'User').length;
  const organizationReposCount = selectedReposDetails.filter(r => r.owner?.type === 'Organization').length;

  // Repositórios filtrados
  const filteredRepos = getSortedRepos().filter(repo => {
    const typeFilter =
      repoFilter === 'all' ||
      (repoFilter === 'personal' && repo.owner?.type === 'User') ||
      (repoFilter === 'organization' && repo.owner?.type === 'Organization');
    const searchFilter = searchTerm === '' ||
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.owner?.login && repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase()));
    return typeFilter && searchFilter;
  });

  if (workflowsLoading && Object.keys(workflows).length === 0) {
    return (
      <div className="mt-12 flex justify-center items-center py-8">
        <div className="text-gray-600 dark:text-gray-400">Loading action statuses...</div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600 z-10"
            title="Exit Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"/><path d="M9 19.8V15m0 0H4.2M9 15l-6 6"/><path d="M15 4.2V9m0 0h4.8M15 9l6-6"/><path d="M9 4.2V9m0 0H4.2M9 9 3 3"/>
            </svg>
            <span className="sr-only">Exit Fullscreen</span>
          </button>
          <div className="flex gap-6 overflow-x-auto pb-4 mt-12">
            {filteredRepos.map((repo) => {
              if (!repo) return null;
              const repoWorkflows = workflows[repo.id] || [];
              const filteredWorkflows = getFilteredWorkflows(repo.id, repoWorkflows);
              const activeFilter = activeFilters[repo.id];
              return (
                <RepositoryColumn
                  key={repo.id}
                  repo={repo}
                  workflows={repoWorkflows}
                  filteredWorkflows={filteredWorkflows}
                  activeFilter={activeFilter}
                  onFilterToggle={(filterType) => toggleFilter(repo.id, filterType)}
                  getStatusTotals={getStatusTotals}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Action Status</h2>
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Search Filter */}
          <div className="relative flex-1 min-w-[280px] max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Sort Controls */}
          <SortControls
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            showSortBySelector={false}
            label="Sort repositories:"
            size="md"
          />
          {/* Type Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRepoFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${repoFilter === 'all' ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              All ({selectedReposDetails.length})
            </button>
            <button
              onClick={() => setRepoFilter('personal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${repoFilter === 'personal' ? 'bg-green-600 dark:bg-green-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Personal ({personalReposCount})
            </button>
            <button
              onClick={() => setRepoFilter('organization')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${repoFilter === 'organization' ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Organizations ({organizationReposCount})
            </button>
          </div>
          {/* Refresh Controls */}
          <RefreshControls
            isRefreshing={isRefreshing}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            countdown={countdown}
            onManualRefresh={handleManualRefresh}
            onToggleAutoRefresh={toggleAutoRefresh}
            onIntervalChange={setRefreshInterval}
          />
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Enter Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/>
            </svg>
          </button>
        </div>
      </div>

      {selectedRepos.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p>Select repositories to view their action status</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {filteredRepos.map((repo) => {
            if (!repo) return null;
            const repoWorkflows = workflows[repo.id] || [];
            const filteredWorkflows = getFilteredWorkflows(repo.id, repoWorkflows);
            const activeFilter = activeFilters[repo.id];
            return (
              <RepositoryColumn
                key={repo.id}
                repo={repo}
                workflows={repoWorkflows}
                filteredWorkflows={filteredWorkflows}
                activeFilter={activeFilter}
                onFilterToggle={(filterType) => toggleFilter(repo.id, filterType)}
                getStatusTotals={getStatusTotals}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
