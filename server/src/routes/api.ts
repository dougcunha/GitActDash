import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized');
    return;
  }
  // @ts-ignore
  req.token = authHeader.split(' ')[1];
  next();
};

router.get('/repos', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('Fetching repositories for user...');
    
    // Buscar repositórios pessoais
    const userReposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${req.token}`,
      },
      params: {
        type: 'all',
        sort: 'updated',
        per_page: 100
      }
    });

    console.log(`Found ${userReposResponse.data.length} user repositories`);

    // Buscar organizações do usuário
    const orgsResponse = await axios.get('https://api.github.com/user/orgs', {
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${req.token}`,
      },
    });

    console.log(`Found ${orgsResponse.data.length} organizations`);

    // Buscar repositórios de cada organização
    const orgRepos: any[] = [];
    for (const org of orgsResponse.data) {
      try {
        console.log(`Fetching repos for org: ${org.login}`);
        const orgReposResponse = await axios.get(`https://api.github.com/orgs/${org.login}/repos`, {
          headers: {
            // @ts-ignore
            Authorization: `Bearer ${req.token}`,
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

    // Combinar todos os repositórios e remover duplicatas
    const allRepos = [...userReposResponse.data, ...orgRepos];
    const uniqueRepos = allRepos.filter((repo, index, self) => 
      index === self.findIndex(r => r.id === repo.id)
    );

    // Ordenar por última atualização
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
        // @ts-ignore
        Authorization: `Bearer ${req.token}`,
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

export default router;
