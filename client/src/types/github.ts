export interface Repo {
  id: number;
  name: string;
  full_name: string;
  private?: boolean;
  owner?: {
    login: string;
    type: 'User' | 'Organization';
    avatar_url?: string;
  };
  updated_at?: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  archived?: boolean;
  pushed_at?: string;
  topics?: string[];
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowWithLatestRun {
  workflow_id: number;
  workflow_name: string;
  workflow_path: string;
  workflow_state: string;
  workflow_url: string;
  latest_run: WorkflowRun | null;
}
