import { RequestHandler } from 'express';

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.githubToken) {
    res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in with GitHub to access this resource'
    });
    return;
  }
  
  // Add token to request for API calls
  req.githubToken = req.session.githubToken;
  next();
};

export const optionalAuth: RequestHandler = (req, res, next) => {
  if (req.session?.githubToken) {
    req.githubToken = req.session.githubToken;
  }
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      githubToken?: string;
    }
  }
}
