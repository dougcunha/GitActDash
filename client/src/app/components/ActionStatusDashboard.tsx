"use client";

import { useEffect, useState } from 'react';

interface Repo {
  id: number;
  name: string;
  full_name: string;
}

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
}

interface Props {
  token: string;
  selectedRepos: number[];
  repos: Repo[];
}

export default function ActionStatusDashboard({ token, selectedRepos, repos }: Props) {
  const [workflowRuns, setWorkflowRuns] = useState<Record<number, WorkflowRun[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && selectedRepos.length > 0) {
      const fetchWorkflowRuns = async () => {
        setLoading(true);
        const runs: Record<number, WorkflowRun[]> = {};
        for (const repoId of selectedRepos) {
          const repo = repos.find((r) => r.id === repoId);
          if (repo) {
            try {
              const response = await fetch(`http://localhost:3001/api/repos/${repo.full_name}/runs`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await response.json();
              runs[repoId] = data.workflow_runs || [];
            } catch (error) {
              console.error(`Error fetching workflow runs for ${repo.full_name}:`, error);
            }
          }
        }
        setWorkflowRuns(runs);
        setLoading(false);
      };
      fetchWorkflowRuns();
    } else {
      setLoading(false);
    }
  }, [token, selectedRepos, repos]);

  const getStatusColor = (conclusion: string | null) => {
    switch (conclusion) {
      case 'success':
        return 'bg-green-500';
      case 'failure':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return <p>Loading action statuses...</p>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Action Status for Selected Repositories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedRepos.map((repoId) => {
          const repo = repos.find((r) => r.id === repoId);
          const runs = workflowRuns[repoId] || [];
          return (
            <div key={repoId} className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
              <h3 className="font-semibold text-gray-800 text-xl mb-4">{repo?.name}</h3>
              {runs.length > 0 ? (
                <ul className="space-y-3">
                  {runs.slice(0, 5).map((run) => (
                    <li key={run.id} className="flex items-center justify-between">
                      <a
                        href={run.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-base truncate mr-2"
                        title={run.name}
                      >
                        {run.name}
                      </a>
                      <span
                        className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(run.conclusion)}`}
                      >
                        {run.conclusion ? run.conclusion.toUpperCase() : (run.status ? run.status.toUpperCase() : 'UNKNOWN')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No workflow runs found for this repository.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
