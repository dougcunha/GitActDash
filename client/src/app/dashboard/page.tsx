"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ActionStatusDashboard from '../components/ActionStatusDashboard';
import ClientOnly from '../components/ClientOnly';
import ThemeToggle from '../components/ThemeToggle';

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

type TabType = 'repos' | 'actions';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('repos');
  const [repoFilter, setRepoFilter] = useState<'all' | 'personal' | 'organization'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Workflow states moved from ActionStatusDashboard
  const [workflows, setWorkflows] = useState<Record<number, WorkflowWithLatestRun[]>>({});
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [lastSelectedRepos, setLastSelectedRepos] = useState<number[]>([]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const accessToken = searchParams.get('token');
    let currentToken = accessToken;
    
    if (typeof window !== 'undefined') {
      currentToken = accessToken || localStorage.getItem('github_token');

      if (accessToken) {
        localStorage.setItem('github_token', accessToken);
        window.history.replaceState({}, document.title, "/dashboard");
      }
    }
    
    if (!currentToken) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return;
    }
    
    setToken(currentToken);

    if (typeof window !== 'undefined') {
      const storedSelectedRepos = localStorage.getItem('selected_repos');
      if (storedSelectedRepos) {
        setSelectedRepos(JSON.parse(storedSelectedRepos));
      }
    }
  }, [searchParams, mounted]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3001/api/repos', {
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
  const loadWorkflows = async (repoIds: number[]) => {
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

            const response = await fetch(`http://localhost:3001/api/repos/${repo.full_name}/workflows`, {
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
  };

  // Check if selectedRepos changed and load workflows if needed
  useEffect(() => {
    const reposChanged = JSON.stringify(selectedRepos.sort()) !== JSON.stringify(lastSelectedRepos.sort());
    
    if (reposChanged && selectedRepos.length > 0 && token) {
      loadWorkflows(selectedRepos);
    } else if (selectedRepos.length === 0) {
      setWorkflows({});
      setLastSelectedRepos([]);
    }
  }, [selectedRepos, token]);

  const filteredRepos = repos.filter(repo => {
    // Filter by type (personal/organization)
    const typeFilter = 
      repoFilter === 'all' || 
      (repoFilter === 'personal' && repo.owner?.type === 'User') ||
      (repoFilter === 'organization' && repo.owner?.type === 'Organization');
    
    // Filter by search term
    const searchFilter = searchTerm === '' || 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.owner?.login && repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return typeFilter && searchFilter;
  });

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading...</p>
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
    <div className="container mx-auto p-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">GitHub Actions Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your GitHub repositories and their action statuses.</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('repos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'repos'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Select Repositories
            {selectedRepos.length > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {selectedRepos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'actions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            disabled={selectedRepos.length === 0}
          >
            Action Status
            {selectedRepos.length === 0 && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(Select repos first)</span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'repos' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Select Repositories</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose which repositories you want to monitor.</p>
            
            {/* Search and Filter Controls */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {/* Search Filter */}
              <div className="relative flex-1 min-w-[280px]">
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
              
              {/* Type Filter Controls */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRepoFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    repoFilter === 'all'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All ({repos.length})
                </button>
                <button
                  onClick={() => setRepoFilter('personal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    repoFilter === 'personal'
                      ? 'bg-green-600 dark:bg-green-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Personal ({repos.filter(r => r.owner?.type === 'User').length})
                </button>
                <button
                  onClick={() => setRepoFilter('organization')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    repoFilter === 'organization'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Organizations ({repos.filter(r => r.owner?.type === 'Organization').length})
                </button>
              </div>
            </div>
            
            {/* Results Info */}
            {(searchTerm || repoFilter !== 'all') && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredRepos.length} of {repos.length} repositories
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out bg-white dark:bg-gray-800 ${
                    selectedRepos.includes(repo.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                  }`}
                  onClick={() => handleRepoSelection(repo.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded mr-4"
                      checked={selectedRepos.includes(repo.id)}
                      readOnly
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{repo.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{repo.full_name}</p>
                      <div className="flex gap-2 mt-1">
                        {repo.private && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            Private
                          </span>
                        )}
                        {repo.owner?.type === 'Organization' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            Organization
                          </span>
                        )}
                        {repo.owner?.type === 'User' && repo.owner?.login !== repo.full_name.split('/')[0] && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            Personal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No repositories found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm 
                    ? `No repositories match "${searchTerm}". Try adjusting your search.` 
                    : 'No repositories match the selected filter.'
                  }
                </p>
                {(searchTerm || repoFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRepoFilter('all');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
          {selectedRepos.length > 0 && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                    {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''} selected
                  </h3>
                  <p className="text-green-600 dark:text-green-300">
                    Click on "Action Status" tab to view the workflow runs.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  View Actions →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'actions' && (
        <div>
          {selectedRepos.length > 0 && token ? (
            <ActionStatusDashboard 
              token={token} 
              selectedRepos={selectedRepos} 
              repos={repos}
              workflows={workflows}
              workflowsLoading={workflowsLoading}
              onRefreshWorkflows={() => loadWorkflows(selectedRepos)}
            />
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No repositories selected</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select some repositories first to view their action status.</p>
              <button
                onClick={() => setActiveTab('repos')}
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                ← Select Repositories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ClientOnly>
      <DashboardContent />
    </ClientOnly>
  );
}
