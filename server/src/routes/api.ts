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
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${req.token}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repositories', error);
    res.status(500).send('Error fetching repositories');
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
  } catch (error) {
    console.error(`Error fetching workflow runs for ${owner}/${repo}`, error);
    res.status(500).send('Error fetching workflow runs');
  }
});

export default router;
