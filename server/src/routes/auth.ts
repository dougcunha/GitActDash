import { Router } from 'express';
import axios from 'axios';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || '3001'}`;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${process.env.CLIENT_PORT || '3000'}`;

router.get('/login', (req, res) => {
  const redirect_uri = `${SERVER_URL}/api/auth/callback`;
  const scope = 'repo read:org read:user';
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=${scope}`);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: {
        Accept: 'application/json',
      },
    });

    const { access_token } = response.data;

    // Get user info for session
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`,
        'User-Agent': 'GitActDash'
      }
    });

    // Store in secure session instead of passing via URL
    req.session.githubToken = access_token;
    req.session.userId = userResponse.data.id.toString();
    req.session.userLogin = userResponse.data.login;

    // Redirect without token in URL
    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.redirect(`${CLIENT_URL}/?error=auth_failed`);
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session?.githubToken) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        login: req.session.userLogin
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('gitactdash_session');
    res.json({ success: true });
  });
});

export default router;
