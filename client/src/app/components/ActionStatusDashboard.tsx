"use client";

import { useEffect, useState, useRef } from 'react';

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
}

export default function ActionStatusDashboard({ token, selectedRepos, repos }: Props) {
  const [workflows, setWorkflows] = useState<Record<number, WorkflowWithLatestRun[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<number, string | null>>({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [countdown, setCountdown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch workflows data
  const fetchWorkflows = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    
    const workflowsData: Record<number, WorkflowWithLatestRun[]> = {};
    for (const repoId of selectedRepos) {
      const repo = repos.find((r) => r.id === repoId);
      if (repo) {
        try {
          const response = await fetch(`http://localhost:3001/api/repos/${repo.full_name}/workflows`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          workflowsData[repoId] = data.workflows || [];
        } catch (error) {
          console.error(`Error fetching workflows for ${repo.full_name}:`, error);
          workflowsData[repoId] = [];
        }
      }
    }
    setWorkflows(workflowsData);
    setLoading(false);
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
          fetchWorkflows(false);
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
    fetchWorkflows(false);
    if (autoRefresh) {
      setCountdown(refreshInterval);
    }
  };

  useEffect(() => {
    if (token && selectedRepos.length > 0) {
      fetchWorkflows();
    } else {
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      stopAutoRefresh();
    };
  }, [token, selectedRepos, repos]);

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

  if (loading) {
    return (
      <div className="mt-12 flex justify-center items-center py-8">
        <div className="text-gray-600">Loading action statuses...</div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Action Status Dashboard</h2>
        
        {/* Auto Refresh Controls */}
        <div className="flex items-center gap-4">
          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
              isRefreshing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
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
          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={toggleAutoRefresh}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto Refresh</span>
            </label>
            
            {/* Interval Selector */}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
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
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{countdown}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Last Updated Indicator */}
      {lastUpdated && (
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {selectedRepos.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>Select repositories to view their action status</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {selectedRepos.map((repoId) => {
            const repo = repos.find((r) => r.id === repoId);
            if (!repo) return null;
            
            const repoWorkflows = workflows[repoId] || [];
            const statusTotals = getStatusTotals(repoWorkflows);
            const filteredWorkflows = getFilteredWorkflows(repoId, repoWorkflows);
            const activeFilter = activeFilters[repoId];
            
            return (
              <div key={repoId} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg shadow-sm">
                {/* Column Header with Repository Info and Status Totals */}
                <div className="bg-white rounded-t-lg p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{repo.name}</h3>
                      <p className="text-sm text-gray-500">{repo.full_name}</p>
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
                  
                  {/* Clickable Status Totals */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <button
                      onClick={() => toggleFilter(repoId, 'success')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        activeFilter === 'success'
                          ? 'bg-green-200 ring-2 ring-green-400 shadow-md'
                          : 'bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      <div className="text-lg font-bold text-green-700">{statusTotals.success}</div>
                      <div className="text-xs text-green-600">Success</div>
                    </button>
                    <button
                      onClick={() => toggleFilter(repoId, 'failure')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        activeFilter === 'failure'
                          ? 'bg-red-200 ring-2 ring-red-400 shadow-md'
                          : 'bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      <div className="text-lg font-bold text-red-700">{statusTotals.failure}</div>
                      <div className="text-xs text-red-600">Failed</div>
                    </button>
                    <button
                      onClick={() => toggleFilter(repoId, 'in_progress')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        activeFilter === 'in_progress'
                          ? 'bg-yellow-200 ring-2 ring-yellow-400 shadow-md'
                          : 'bg-yellow-50 hover:bg-yellow-100'
                      }`}
                    >
                      <div className="text-lg font-bold text-yellow-700">{statusTotals.in_progress}</div>
                      <div className="text-xs text-yellow-600">Running</div>
                    </button>
                    <button
                      onClick={() => toggleFilter(repoId, 'no_runs')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        activeFilter === 'no_runs'
                          ? 'bg-gray-200 ring-2 ring-gray-400 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-lg font-bold text-gray-700">{statusTotals.no_runs}</div>
                      <div className="text-xs text-gray-600">No Runs</div>
                    </button>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <span className="text-sm text-gray-500">
                      {activeFilter ? (
                        <>
                          Showing {filteredWorkflows.length} of {statusTotals.total} workflow{statusTotals.total !== 1 ? 's' : ''}
                          <button
                            onClick={() => toggleFilter(repoId, '')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline"
                          >
                            Clear filter
                          </button>
                        </>
                      ) : (
                        <>Total: {statusTotals.total} workflow{statusTotals.total !== 1 ? 's' : ''}</>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Workflows List */}
                <div className="p-4 max-h-96 overflow-y-auto">
                  {filteredWorkflows.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">
                        {activeFilter ? 'No workflows match this filter' : 'No workflows found'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredWorkflows.map((workflow) => (
                        <div
                          key={workflow.workflow_id}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open(workflow.workflow_url, '_blank')}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                workflow.latest_run?.status === 'completed'
                                  ? workflow.latest_run?.conclusion === 'success'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                  : workflow.latest_run?.status === 'in_progress'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            <h4 className="font-medium text-sm text-gray-900 truncate">{workflow.workflow_name}</h4>
                          </div>
                          {workflow.latest_run ? (
                            <div className="text-xs text-gray-600">
                              <p className="capitalize mb-1 flex items-center gap-1">
                                <span className="font-medium">Status:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  workflow.latest_run.status === 'completed'
                                    ? workflow.latest_run.conclusion === 'success'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    : workflow.latest_run.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {workflow.latest_run.status === 'completed' 
                                    ? workflow.latest_run.conclusion 
                                    : workflow.latest_run.status}
                                </span>
                              </p>
                              <p className="mb-1">
                                <span className="font-medium">Executed:</span> {new Date(workflow.latest_run.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-blue-600 font-medium">Click to view on GitHub →</p>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              <p className="italic">No executions found</p>
                              <p className="text-blue-600 font-medium mt-1">Click to view on GitHub →</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
