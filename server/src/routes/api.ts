import { Router, Request, Response } from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/repos', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('Fetching repositories for user...');
    
    // Fetch personal repositories
    const userReposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${req.githubToken}`,
      },
      params: {
        type: 'all',
        sort: 'updated',
        per_page: 100
      }
    });

    console.log(`Found ${userReposResponse.data.length} user repositories`);

    let orgRepos: any[] = [];

    // Try to fetch user organizations (but don't fail if no permissions)
    try {
      const orgsResponse = await axios.get('https://api.github.com/user/orgs', {
        headers: {
          Authorization: `Bearer ${req.githubToken}`,
        },
      });

      console.log(`Found ${orgsResponse.data.length} organizations`);

      // Fetch repositories from each organization
      for (const org of orgsResponse.data) {
        try {
          console.log(`Fetching repos for org: ${org.login}`);
          const orgReposResponse = await axios.get(`https://api.github.com/orgs/${org.login}/repos`, {
            headers: {
              Authorization: `Bearer ${req.githubToken}`,
            },
            params: {
              type: 'all',
              sort: 'updated',
              per_page: 100
            }
          });
          console.log(`Found ${orgReposResponse.data.length} repos for org ${org.login}`);
          orgRepos.push(...orgReposResponse.data);
        } catch (orgError: any) {
          console.warn(`Could not fetch repos for org ${org.login}:`, orgError.response?.status);
          // Continue with other orgs even if one fails
        }
      }
    } catch (orgsError: any) {
      console.warn('Could not fetch organizations (missing read:org scope?):', orgsError.response?.status);
      // Continue with just personal repos
    }

    // Combine all repositories and remove duplicates
    const allRepos = [...userReposResponse.data, ...orgRepos];
    const uniqueRepos = allRepos.filter((repo, index, self) => 
      index === self.findIndex(r => r.id === repo.id)
    );

    // Sort by last update
    uniqueRepos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    console.log(`Returning ${uniqueRepos.length} total unique repositories`);
    res.json(uniqueRepos);
  } catch (error: any) {
    console.error('Error fetching repositories:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching repositories',
      message: error.response?.data?.message || error.message 
    });
  }
});

router.get('/repos/:owner/:repo/runs', requireAuth, async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
      headers: {
        Authorization: `Bearer ${req.githubToken}`,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching workflow runs for ${owner}/${repo}:`, error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching workflow runs',
      message: error.response?.data?.message || error.message 
    });
  }
});

// New route to get workflows with their latest runs
router.get('/repos/:owner/:repo/workflows', requireAuth, async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  try {
    // First, get all workflows for this repository
    const workflowsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
      headers: {
        Authorization: `Bearer ${req.githubToken}`,
      },
    });

    const workflows = workflowsResponse.data.workflows || [];
    const workflowsWithLatestRun: any[] = [];

    // For each workflow, get its latest run
    for (const workflow of workflows) {
      try {
        const runsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow.id}/runs`, {
          headers: {
            Authorization: `Bearer ${req.githubToken}`,
          },
          params: {
            per_page: 1 // Only get the latest run
          }
        });

        const latestRun = runsResponse.data.workflow_runs?.[0];
        
        workflowsWithLatestRun.push({
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          workflow_path: workflow.path,
          workflow_state: workflow.state,
          workflow_url: workflow.html_url.replace(/\/blob\/[^\/]+\/\.github\/workflows\//, '/actions/workflows/'),
          latest_run: latestRun || null
        });
      } catch (runError: any) {
        console.warn(`Could not fetch runs for workflow ${workflow.id}:`, runError.response?.status);
        // Include workflow even if we can't get its runs
        workflowsWithLatestRun.push({
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          workflow_path: workflow.path,
          workflow_state: workflow.state,
          workflow_url: workflow.html_url.replace(/\/blob\/[^\/]+\/\.github\/workflows\//, '/actions/workflows/'),
          latest_run: null
        });
      }
    }

    res.json({ workflows: workflowsWithLatestRun });
  } catch (error: any) {
    console.error(`Error fetching workflows for ${owner}/${repo}:`, error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching workflows',
      message: error.response?.data?.message || error.message 
    });
  }
});

export default router;
