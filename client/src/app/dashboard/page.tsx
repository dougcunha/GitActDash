"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ActionStatusDashboard from '../components/ActionStatusDashboard';
import ClientOnly from '../components/ClientOnly';
import ThemeToggle from '../components/ThemeToggle';
import FilterPanel from '../components/FilterPanel';
import useAuth from '@/hooks/useAuth';
import { apiRequest } from '@/utils/api';
import Head from 'next/head';
import type { Repo, WorkflowWithLatestRun } from '@/types/github';

function DashboardContent() {
  const { authStatus, loading: authLoading } = useAuth();
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'personal' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'full_name' | 'updated_at'>('name');

  // Workflow states moved from ActionStatusDashboard
  const [workflows, setWorkflows] = useState<Record<number, WorkflowWithLatestRun[]>>({});
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [loadedForRepos, setLoadedForRepos] = useState<string>(''); // Track which repos we've loaded for

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && authStatus && !authStatus.authenticated) {
      router.push('/');
    }
  }, [authStatus, authLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSelectedRepos = localStorage.getItem('selected_repos');
      if (storedSelectedRepos) {
        const parsedRepos = JSON.parse(storedSelectedRepos);
        setSelectedRepos(parsedRepos);
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

  // Load workflows when selectedRepos changes
  useEffect(() => {
    const currentReposKey = selectedRepos.sort().join(',');
    
    if (repos.length > 0 && selectedRepos.length > 0 && authStatus?.authenticated && currentReposKey !== loadedForRepos) {
      // Inline the workflow loading to avoid dependency issues
      const loadWorkflows = async () => {
        setWorkflowsLoading(true);
        const newWorkflows: Record<number, WorkflowWithLatestRun[]> = {};

        try {
          await Promise.all(
            selectedRepos.map(async (repoId) => {
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
          setLoadedForRepos(currentReposKey);
        } catch (error) {
          console.error('Error loading workflows:', error);
        } finally {
          setWorkflowsLoading(false);
        }
      };

      loadWorkflows();
    } else if (selectedRepos.length === 0 && workflows && Object.keys(workflows).length > 0) {
      setWorkflows({});
      setLoadedForRepos('');
    }
  }, [selectedRepos, repos, authStatus?.authenticated, loadedForRepos, workflows]); // Include all dependencies



  const onRefreshWorkflows = useCallback(async () => {
    if (!authStatus?.authenticated || selectedRepos.length === 0) return;

    setWorkflowsLoading(true);
    const newWorkflows: Record<number, WorkflowWithLatestRun[]> = {};

    try {
      await Promise.all(
        selectedRepos.map(async (repoId) => {
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
      // Update the loaded key to prevent immediate reload
      setLoadedForRepos(selectedRepos.sort().join(','));
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setWorkflowsLoading(false);
    }
  }, [selectedRepos, authStatus?.authenticated, repos]);

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
        <title>GAD - GitHub Actions Dashboard</title>
      </Head>
      <div className="w-full max-w-none min-h-screen bg-white dark:bg-gray-900">
        
        {!isFilterOpen && !isFullscreen && (
          <button
            onClick={() => setIsFilterOpen(true)}
            className="fixed top-4 left-4 z-20 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
            title="Show filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"></path>
            </svg>
          </button>
        )}

        {/* Overlay */}
        {isFilterOpen && !isFullscreen && (
          <div 
            onClick={() => setIsFilterOpen(false)} 
            className="fixed inset-0 bg-black/60 z-30 transition-opacity"
          ></div>
        )}

        {/* Sidebar */}
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="filter-panel-title" 
          className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 transition-transform transform ${isFilterOpen && !isFullscreen ? 'translate-x-0' : '-translate-x-full'} ease-in-out duration-300`}
        >
          <h2 id="filter-panel-title" className="sr-only">Filter Panel</h2>
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
            onClose={() => setIsFilterOpen(false)}
          />
        </div>
        
        <div className={`flex-1 transition-all duration-300 ${!isFullscreen ? 'px-8' : ''}`}>
          <div className={`mb-8 flex justify-between items-start pt-4 ${!isFullscreen ? 'pl-10' : ''}`}>
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">GAD - GitHub Actions Dashboard</h1>
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
