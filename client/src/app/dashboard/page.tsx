"use client";

import { useEffect, useState, useCallback } from 'react';
import ActionStatusDashboard from '../components/ActionStatusDashboard';
import ClientOnly from '../components/ClientOnly';
import ThemeToggle from '../components/ThemeToggle';
import FilterPanel from '../components/FilterPanel';
import useAuth from '@/hooks/useAuth';
import { apiRequest } from '@/utils/api';
import Head from 'next/head';
import type { Repo, WorkflowRun, WorkflowWithLatestRun } from '@/types/github';

function DashboardContent() {
  const { authStatus, loading: authLoading } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'personal' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'full_name' | 'updated_at'>('name');

  // Workflow states moved from ActionStatusDashboard
  const [workflows, setWorkflows] = useState<Record<number, WorkflowWithLatestRun[]>>({});
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [lastSelectedRepos, setLastSelectedRepos] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSelectedRepos = localStorage.getItem('selected_repos');
      if (storedSelectedRepos) {
        setSelectedRepos(JSON.parse(storedSelectedRepos));
      }

      // Load sorting preferences
      const storedSortBy = localStorage.getItem('sort_by');
      const storedSortOrder = localStorage.getItem('sort_order');
      
      if (storedSortBy && ['name', 'full_name', 'updated_at'].includes(storedSortBy)) {
        setSortBy(storedSortBy as 'name' | 'full_name' | 'updated_at');
      }
      
      if (storedSortOrder && ['asc', 'desc'].includes(storedSortOrder)) {
        setSortOrder(storedSortOrder as 'asc' | 'desc');
      }
    }
  }, []);

  useEffect(() => {
    if (authStatus?.authenticated) {
      apiRequest('/api/repos')
      .then(data => {
        console.log('Received repos data:', data);
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          console.error('Invalid data format received:', data);
          setRepos([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching repos:', error);
        setRepos([]);
        setLoading(false);
      });
    }
  }, [authStatus]);

  const handleRepoSelection = (repoId: number) => {
    const newSelectedRepos = selectedRepos.includes(repoId)
      ? selectedRepos.filter((id) => id !== repoId)
      : [...selectedRepos, repoId];
    setSelectedRepos(newSelectedRepos);

    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_repos', JSON.stringify(newSelectedRepos));
    }
  };

  const handleSortByChange = (newSortBy: 'name' | 'full_name' | 'updated_at') => {
    setSortBy(newSortBy);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sort_by', newSortBy);
    }
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sort_order', newSortOrder);
    }
  };

  // Function to load workflows for selected repositories
  const loadWorkflows = useCallback(async (repoIds: number[]) => {
    if (!authStatus?.authenticated || repoIds.length === 0) return;

    setWorkflowsLoading(true);
    const newWorkflows: Record<number, WorkflowWithLatestRun[]> = {};

    try {
      await Promise.all(
        repoIds.map(async (repoId) => {
          try {
            const repo = repos.find(r => r.id === repoId);
            if (!repo) {
              newWorkflows[repoId] = [];
              return;
            }

            const data = await apiRequest(`/api/repos/${repo.full_name}/workflows`);
            newWorkflows[repoId] = Array.isArray(data.workflows) ? data.workflows : [];
          } catch (error) {
            console.error(`Error fetching workflows for repo ${repoId}:`, error);
            newWorkflows[repoId] = [];
          }
        })
      );

      setWorkflows(newWorkflows);
      setLastSelectedRepos([...repoIds]);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setWorkflowsLoading(false);
    }
  }, [authStatus, repos]);

  // Check if selectedRepos changed and load workflows if needed
  useEffect(() => {
    const reposChanged = JSON.stringify(selectedRepos.sort()) !== JSON.stringify(lastSelectedRepos.sort());

    if (reposChanged && selectedRepos.length > 0 && authStatus?.authenticated) {
      loadWorkflows(selectedRepos);
    } else if (selectedRepos.length === 0) {
      setWorkflows({});
      setLastSelectedRepos([]);
    }
  }, [selectedRepos, authStatus, lastSelectedRepos, loadWorkflows]);



  const onRefreshWorkflows = useCallback(async () => {
    await loadWorkflows(selectedRepos);
  }, [loadWorkflows, selectedRepos]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Checking authentication...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>GitHub Actions Dashboard</title>
      </Head>
      <div className="flex w-full max-w-none min-h-screen bg-white dark:bg-gray-900 relative">
        {isFilterOpen && !isFullscreen && (
          <div className="relative">
            <FilterPanel
              repos={repos}
              selectedRepos={selectedRepos}
              onRepoToggle={handleRepoSelection}
              ownerFilter={ownerFilter}
              setOwnerFilter={setOwnerFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={handleSortOrderChange}
              sortBy={sortBy}
              setSortBy={handleSortByChange}
            />
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-4 -right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors z-20"
              title="Hide filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {!isFilterOpen && !isFullscreen && (
          <button
            onClick={() => setIsFilterOpen(true)}
            className="fixed top-4 left-4 z-20 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
            title="Show filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className={`flex-1 ${!isFilterOpen && !isFullscreen ? 'pl-16' : 'px-8'}`}>
          <div className="mb-8 flex justify-between items-start pt-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">GitHub Actions Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor your GitHub repositories and their action statuses.</p>
            </div>
            <ThemeToggle />
          </div>
          <ActionStatusDashboard
            selectedRepos={selectedRepos}
            repos={repos}
            workflows={workflows}
            workflowsLoading={workflowsLoading}
            onRefreshWorkflows={onRefreshWorkflows}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
          />
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <ClientOnly>
      <DashboardContent />
    </ClientOnly>
  );
}
