import { Router } from 'express';
import axios from 'axios';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || '3001'}`;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${process.env.CLIENT_PORT || '3000'}`;

router.get('/login', (req, res) => {
  const redirect_uri = `${SERVER_URL}/api/auth/callback`;
  const scope = 'repo read:org read:user'; // Adicionar scopes necessários
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

    // For now, we'll just redirect to the client with the token.
    // In a real app, you'd create a session for the user.
    res.redirect(`${CLIENT_URL}/dashboard?token=${access_token}`);
  } catch (error) {
    console.error('Error getting access token', error);
    res.status(500).send('Error getting access token');
  }
});

export default router;
