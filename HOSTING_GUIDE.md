# 🚀 Web Hosting Guide for GitActDash

## 🔒 Security Overview

GitActDash has been designed with security in mind for web hosting. The application uses:

- **Session-based authentication** with HTTP-only cookies
- **No client-side token storage** (no localStorage vulnerabilities)
- **HTTPS enforcement** in production
- **Security headers** (CSP, HSTS, etc.)
- **CORS protection** with credential support

## 🌐 Recommended Hosting Platforms

### 1. Vercel (Recommended)
**Best for**: Easy deployment with built-in HTTPS and serverless functions

```bash
# Deploy frontend to Vercel
npx vercel --prod

# Deploy backend as Vercel Functions (requires adaptation)
# Or use a separate backend hosting service
```

**Environment Variables for Vercel:**
```env
NEXT_PUBLIC_SERVER_URL=https://your-api-domain.vercel.app
```

### 2. Railway
**Best for**: Full-stack deployment with automatic HTTPS

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy both frontend and backend
railway login
railway project create
railway deploy
```

### 3. Render
**Best for**: Free tier with automatic SSL

1. Create Web Service for backend
2. Create Static Site for frontend
3. Configure environment variables

### 4. AWS/Azure/GCP
**Best for**: Enterprise deployments with full control

## 🔧 Production Configuration

### Backend (.env)
```env
NODE_ENV=production
PORT=8080
SERVER_URL=https://your-api-domain.com
CLIENT_URL=https://your-app-domain.com
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
SESSION_SECRET=your-super-secure-random-string-min-32-chars
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SERVER_URL=https://your-api-domain.com
```

## 🛡️ Security Checklist

### ✅ Pre-deployment
- [ ] Change SESSION_SECRET to a strong random string
- [ ] Update GitHub OAuth App URLs to production domains
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your frontend domain
- [ ] Enable HTTPS for both frontend and backend

### ✅ Post-deployment
- [ ] Test authentication flow
- [ ] Verify HTTPS is working
- [ ] Check security headers are applied
- [ ] Test logout functionality
- [ ] Monitor for authentication errors

## 🔑 GitHub OAuth Configuration

### Development URLs
- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3001/api/auth/callback`

### Production URLs
- **Homepage URL**: `https://your-app-domain.com`
- **Callback URL**: `https://your-api-domain.com/api/auth/callback`

## 🚨 Security Best Practices

1. **Always use HTTPS in production**
2. **Keep SESSION_SECRET private and unique**
3. **Regularly rotate GitHub OAuth credentials**
4. **Monitor authentication logs**
5. **Use environment variables for all secrets**
6. **Keep dependencies updated**

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication required" errors**
   - Check CORS configuration
   - Verify GitHub OAuth URLs
   - Ensure cookies are being sent

2. **Session not persisting**
   - Check HTTPS configuration
   - Verify SESSION_SECRET is set
   - Check cookie domain settings

3. **CORS errors**
   - Update CLIENT_URL in backend env
   - Check credentials: true in CORS config

## 📊 Monitoring

Consider implementing:
- **Error tracking** (Sentry, LogRocket)
- **Analytics** (Google Analytics, Plausible)
- **Performance monitoring** (Vercel Analytics, New Relic)
- **Uptime monitoring** (UptimeRobot, Pingdom)

## 🔄 Deployment Scripts

### Automated Deployment
```bash
# Build and deploy script
#!/bin/bash
set -e

echo "Building frontend..."
cd client && npm run build

echo "Starting backend..."
cd ../server && npm start
```

### Docker Deployment
```dockerfile
# Multi-stage Dockerfile example
FROM node:18-alpine AS base

# Backend stage
FROM base AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
EXPOSE 3001
CMD ["npm", "start"]

# Frontend stage  
FROM base AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

**⚠️ Important**: Always test your deployment in a staging environment before going to production!
