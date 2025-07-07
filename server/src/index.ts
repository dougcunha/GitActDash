import './config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import apiRouter from './routes/api';
import { sessionConfig } from './middleware/session';
import { securityHeaders, httpsRedirect } from './middleware/security';

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(httpsRedirect);
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || `http://localhost:${process.env.CLIENT_PORT || '3000'}`,
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Session management
app.use(sessionConfig);

app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
