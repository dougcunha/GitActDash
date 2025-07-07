"use client";

import { useEffect, useState, useCallback } from 'react';
import ActionStatusDashboard from '../components/ActionStatusDashboard';
import ClientOnly from '../components/ClientOnly';
import ThemeToggle from '../components/ThemeToggle';
import FilterPanel from '../components/FilterPanel';
import useGitHubToken from '@/hooks/useGitHubToken';
import { config } from '@/config/env';
import Head from 'next/head';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner?: {
    login: string;
    type: 'User' | 'Organization';
  };
  updated_at: string;
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

function DashboardContent() {
  const token = useGitHubToken();
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
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${config.serverUrl}/api/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Network error' }));
          throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
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
  }, [token]);

  const handleRepoSelection = (repoId: number) => {
    const newSelectedRepos = selectedRepos.includes(repoId)
      ? selectedRepos.filter((id) => id !== repoId)
      : [...selectedRepos, repoId];
    setSelectedRepos(newSelectedRepos);

    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_repos', JSON.stringify(newSelectedRepos));
    }
  };

  // Function to load workflows for selected repositories
  const loadWorkflows = useCallback(async (repoIds: number[]) => {
    if (!token || repoIds.length === 0) return;

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

            const response = await fetch(`${config.serverUrl}/api/repos/${repo.full_name}/workflows`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const data = await response.json();
              newWorkflows[repoId] = Array.isArray(data.workflows) ? data.workflows : [];
            } else {
              newWorkflows[repoId] = [];
            }
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
  }, [token, repos]);

  // Check if selectedRepos changed and load workflows if needed
  useEffect(() => {
    const reposChanged = JSON.stringify(selectedRepos.sort()) !== JSON.stringify(lastSelectedRepos.sort());

    if (reposChanged && selectedRepos.length > 0 && token) {
      loadWorkflows(selectedRepos);
    } else if (selectedRepos.length === 0) {
      setWorkflows({});
      setLastSelectedRepos([]);
    }
  }, [selectedRepos, token, lastSelectedRepos, loadWorkflows]);



  const onRefreshWorkflows = useCallback(async () => {
    await loadWorkflows(selectedRepos);
  }, [loadWorkflows, selectedRepos]);

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
              setSortOrder={setSortOrder}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            title="Show filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex-1 px-8">
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
