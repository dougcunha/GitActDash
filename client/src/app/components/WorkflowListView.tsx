"use client";

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import type { Repo, WorkflowWithLatestRun } from '@/types/github';
import { formatRelativeTime } from '@/utils/time';

interface WorkflowListViewProps {
  selectedRepos: number[];
  repos: Repo[];
  workflows: Record<number, WorkflowWithLatestRun[]>;
  workflowsLoading: boolean;
}

type SortColumn = 'repository' | 'workflow' | 'status' | 'execution' | 'organization';
type SortOrder = 'asc' | 'desc';

interface WorkflowRowData {
  repo: Repo;
  workflow: WorkflowWithLatestRun;
  organization: string;
  status: string;
  executionDate: string | null;
}

export default function WorkflowListView({
  selectedRepos,
  repos,
  workflows,
  workflowsLoading
}: WorkflowListViewProps) {
  const [workflowNameFilter, setWorkflowNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('organization');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Function to get workflow status
  const getWorkflowStatus = useCallback((workflow: WorkflowWithLatestRun): string => {
    if (!workflow.latest_run) {
      return 'no_runs';
    } else if (workflow.latest_run.status === 'completed') {
      return workflow.latest_run.conclusion === 'success' ? 'success' : 'failure';
    } else if (workflow.latest_run.status === 'in_progress') {
      return 'in_progress';
    } else {
      return 'no_runs';
    }
  }, []);

  // Function to get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failure':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }, []);

  // Function to get status text
  const getStatusText = useCallback((workflow: WorkflowWithLatestRun): string => {
    if (!workflow.latest_run) {
      return 'Sem execuções';
    } else if (workflow.latest_run.status === 'completed') {
      return workflow.latest_run.conclusion === 'success' ? 'Sucesso' : 'Falha';
    } else if (workflow.latest_run.status === 'in_progress') {
      return 'Em progresso';
    } else {
      return 'Sem execuções';
    }
  }, []);

  // Create flat list of workflow data
  const workflowData = useMemo((): WorkflowRowData[] => {
    const data: WorkflowRowData[] = [];
    
    selectedRepos.forEach(repoId => {
      const repo = repos.find(r => r.id === repoId);
      if (!repo) return;
      
      const repoWorkflows = workflows[repoId] || [];
      repoWorkflows.forEach(workflow => {
        data.push({
          repo,
          workflow,
          organization: repo.owner?.login || 'Unknown',
          status: getWorkflowStatus(workflow),
          executionDate: workflow.latest_run?.created_at || null
        });
      });
    });
    
    return data;
  }, [selectedRepos, repos, workflows, getWorkflowStatus]);

  // Filter data
  const filteredData = useMemo(() => {
    return workflowData.filter(item => {
      const workflowNameMatch = !workflowNameFilter || 
        item.workflow.workflow_name.toLowerCase().includes(workflowNameFilter.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      
      const organizationMatch = organizationFilter === 'all' || 
        item.organization.toLowerCase().includes(organizationFilter.toLowerCase());
      
      return workflowNameMatch && statusMatch && organizationMatch;
    });
  }, [workflowData, workflowNameFilter, statusFilter, organizationFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortColumn) {
        case 'repository':
          compareValue = a.repo.name.localeCompare(b.repo.name);
          break;
        case 'workflow':
          compareValue = a.workflow.workflow_name.localeCompare(b.workflow.workflow_name);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'execution':
          if (a.executionDate && b.executionDate) {
            compareValue = new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime();
          } else if (a.executionDate) {
            compareValue = -1;
          } else if (b.executionDate) {
            compareValue = 1;
          }
          break;
        case 'organization':
        default:
          compareValue = a.organization.localeCompare(b.organization);
          if (compareValue === 0) {
            compareValue = a.repo.name.localeCompare(b.repo.name);
          }
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [filteredData, sortColumn, sortOrder]);

  // Handle column sort
  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  }, [sortColumn, sortOrder]);

  // Get unique organizations for filter
  const organizations = useMemo(() => {
    const orgs = new Set(workflowData.map(item => item.organization));
    return Array.from(orgs).sort();
  }, [workflowData]);

  // Sort icon component
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" />
      </svg>
    );
  };

  if (workflowsLoading && Object.keys(workflows).length === 0) {
    return (
      <div className="mt-12 flex justify-center items-center py-8">
        <div className="text-gray-600 dark:text-gray-400">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Workflow Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Workflow
            </label>
            <input
              type="text"
              placeholder="Filtrar por nome..."
              value={workflowNameFilter}
              onChange={(e) => setWorkflowNameFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="success">Sucesso</option>
              <option value="failure">Falha</option>
              <option value="in_progress">Em progresso</option>
              <option value="no_runs">Sem execuções</option>
            </select>
          </div>

          {/* Organization Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organização
            </label>
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as organizações</option>
              {organizations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {sortedData.length} workflow{sortedData.length !== 1 ? 's' : ''} de {workflowData.length} total
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('repository')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Repositório</span>
                    <SortIcon column="repository" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('workflow')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Nome do Workflow</span>
                    <SortIcon column="workflow" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon column="status" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('execution')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Dt/Hr Execução</span>
                    <SortIcon column="execution" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('organization')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Organização</span>
                    <SortIcon column="organization" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum workflow encontrado com os filtros aplicados
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr key={`${item.repo.id}-${item.workflow.workflow_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {item.repo.owner?.avatar_url ? (
                            <Image 
                              className="h-8 w-8 rounded-full" 
                              src={item.repo.owner.avatar_url} 
                              alt={item.repo.owner.login}
                              width={32}
                              height={32}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {item.repo.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.repo.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.repo.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {item.workflow.workflow_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.workflow)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.executionDate ? formatRelativeTime(item.executionDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.organization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => window.open(item.workflow.workflow_url, '_blank')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        Ver no GitHub
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}