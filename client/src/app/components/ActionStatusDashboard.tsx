"use client";

import { useEffect, useState, useRef } from 'react';
import RefreshControls from './RefreshControls';
import RepositoryColumn from './RepositoryColumn';

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
  token: string;
  selectedRepos: number[];
  repos: Repo[];
  workflows: Record<number, WorkflowWithLatestRun[]>;
  workflowsLoading: boolean;
  onRefreshWorkflows: () => Promise<void>;
}

export default function ActionStatusDashboard({ 
  token, 
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

  // Refs for intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to refresh workflows data
  const refreshWorkflows = async (showLoading = true) => {
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
          refreshWorkflows(false);
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
    refreshWorkflows(false);
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

  if (workflowsLoading && Object.keys(workflows).length === 0) {
    return (
      <div className="mt-12 flex justify-center items-center py-8">
        <div className="text-gray-600 dark:text-gray-400">Loading action statuses...</div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Action Status Dashboard</h2>
        
        <div className="flex items-center gap-4">
          <RefreshControls
            isRefreshing={isRefreshing}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            countdown={countdown}
            onManualRefresh={handleManualRefresh}
            onToggleAutoRefresh={toggleAutoRefresh}
            onIntervalChange={setRefreshInterval}
          />
        </div>
      </div>

      {/* Last Updated Indicator */}
      {lastUpdated && (
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {selectedRepos.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p>Select repositories to view their action status</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {selectedRepos.map((repoId) => {
            const repo = repos.find((r) => r.id === repoId);
            if (!repo) return null;
            
            const repoWorkflows = workflows[repoId] || [];
            const filteredWorkflows = getFilteredWorkflows(repoId, repoWorkflows);
            const activeFilter = activeFilters[repoId];
            
            return (
              <RepositoryColumn
                key={repoId}
                repo={repo}
                workflows={repoWorkflows}
                filteredWorkflows={filteredWorkflows}
                activeFilter={activeFilter}
                onFilterToggle={(filterType) => toggleFilter(repoId, filterType)}
                getStatusTotals={getStatusTotals}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
