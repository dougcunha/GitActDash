"use client";

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

interface WorkflowCardProps {
  workflow: WorkflowWithLatestRun;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const getStatusColor = () => {
    if (workflow.latest_run?.status === 'completed') {
      return workflow.latest_run?.conclusion === 'success' ? 'bg-green-500' : 'bg-red-500';
    } else if (workflow.latest_run?.status === 'in_progress') {
      return 'bg-yellow-500';
    } else {
      return 'bg-gray-400';
    }
  };

  const getStatusBadgeColor = () => {
    if (workflow.latest_run?.status === 'completed') {
      return workflow.latest_run?.conclusion === 'success'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';
    } else if (workflow.latest_run?.status === 'in_progress') {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => window.open(workflow.workflow_url, '_blank')}
    >
      <div className="flex items-center space-x-2 mb-2">
        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor()}`} />
        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{workflow.workflow_name}</h4>
      </div>
      {workflow.latest_run ? (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="capitalize mb-1 flex items-center gap-1">
            <span className="font-medium">Status:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
              {workflow.latest_run.status === 'completed' 
                ? workflow.latest_run.conclusion 
                : workflow.latest_run.status}
            </span>
          </p>
          <p className="mb-1">
            <span className="font-medium">Executed:</span> {new Date(workflow.latest_run.created_at).toLocaleDateString()}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Click to view on GitHub →</p>
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="italic">No executions found</p>
          <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">Click to view on GitHub →</p>
        </div>
      )}
    </div>
  );
}
