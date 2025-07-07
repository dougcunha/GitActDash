import session from 'express-session';

const isProduction = process.env.NODE_ENV === 'production';

export const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'your-development-secret-change-in-production',
  name: 'gitactdash_session', // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
  },
  rolling: true, // Reset expiration on activity
});

// Session data interface
declare module 'express-session' {
  interface SessionData {
    githubToken?: string;
    userId?: string;
    userLogin?: string;
  }
}
