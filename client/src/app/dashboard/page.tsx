"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ActionStatusDashboard from '../components/ActionStatusDashboard';
import ClientOnly from '../components/ClientOnly';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
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
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRepos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching repos:', error);
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
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GitHub Actions Dashboard</h1>
        <p className="text-gray-600">Monitor your GitHub repositories and their action statuses.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('repos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'repos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Select Repositories
            {selectedRepos.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {selectedRepos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'actions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={selectedRepos.length === 0}
          >
            Action Status
            {selectedRepos.length === 0 && (
              <span className="ml-2 text-xs text-gray-400">(Select repos first)</span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'repos' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Select Repositories</h2>
            <p className="text-gray-600">Choose which repositories you want to monitor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out ${
                  selectedRepos.includes(repo.id) 
                    ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
                    : 'hover:bg-gray-50 hover:shadow-md'
                }`}
                onClick={() => handleRepoSelection(repo.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                    checked={selectedRepos.includes(repo.id)}
                    readOnly
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{repo.name}</h3>
                    <p className="text-sm text-gray-500">{repo.full_name}</p>
                    {repo.private && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedRepos.length > 0 && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-green-800">
                    {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''} selected
                  </h3>
                  <p className="text-green-600">
                    Click on "Action Status" tab to view the workflow runs.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
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
            <ActionStatusDashboard token={token} selectedRepos={selectedRepos} repos={repos} />
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories selected</h3>
              <p className="text-gray-500 mb-4">Select some repositories first to view their action status.</p>
              <button
                onClick={() => setActiveTab('repos')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
