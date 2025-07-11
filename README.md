![GitHub Actions Dashboard](https://img.shields.io/badge/Status-Active-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)
[![CI](https://github.com/dougcunha/GitActDash/actions/workflows/ci.yml/badge.svg)](https://github.com/dougcunha/GitActDash/actions/workflows/ci.yml)

# GAD - GitHub Actions Dashboard

- A modern and intuitive dashboard to monitor your GitHub repositories' Actions.

## Index

- [✨ Features](#-features)
- [🖼️ Screenshots](#screenshots)
- [🏗️ Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#project-structure)
- [🔧 Available Scripts](#-available-scripts)
- [🎯 How to Use](#-how-to-use)
- [🌐 Web Hosting](#-web-hosting)
- [🛠️ Technologies Used](#-technologies-used)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

- 🔐 **GitHub OAuth Authentication**: Secure login with your GitHub account
- 🛡️ **Secure Session Management**: Session-based authentication with HTTP-only cookies
- 📊 **Intuitive Dashboard**: Tab-based interface for better organization
- 🔍 **Repository Selection & Filtering**: Easily choose, search, and filter repositories to monitor
- 📈 **Real-time Status**: View GitHub Actions status updates with auto-refresh capabilities
- 🎨 **Modern & Responsive Interface**: Built with Tailwind CSS, the dashboard is fully responsive. It uses a flexible grid layout that adapts to different screen sizes, from narrow mobile displays to ultra-wide monitors, ensuring excellent usability everywhere
- 🔄 **Auto-refresh**: Automatically updated data with configurable intervals
- 🌕 **Fullscreen Mode**: Expand the status view for a focused, clutter-free monitoring experience
- 🔄 **Loading Indicators**: Visual feedback with skeleton loaders and refresh indicators
- 🎯 **Advanced Filtering**: Filter repositories by type (personal/organization) and workflow status
- 🚨 **Failure Detection**: Quickly identify repositories with failed workflows
- 🌐 **Production Ready**: Secure architecture ready for web hostingshboard


## 🖼️ Screenshots

### Dark theme

![GitActDash Dark Theme](imgs/dark-theme.png)

### White theme

![GitActDash Light Theme](imgs/white-theme.png)

### Full screen

![GitActDash Dark Full Screen](imgs/dark-full-screen.png)

### Detailed repository view

![GitActDash Detailed View](imgs/detailed-view.png)

## 🏗️ Architecture

### Frontend (Client)
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

### Backend (Server)
- **Express.js** API server
- **Session-based Authentication** with HTTP-only cookies
- **Security Headers** (CSP, HSTS, CORS)
- **GitHub OAuth** for authentication
- **GitHub API** for repository data
- **Production-ready security** middleware

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- GitHub account
- GitHub OAuth App configured

### 1. Clone the repository

```bash
git clone https://github.com/dougcunha/gitactdash.git
cd gitactdash
```

### 2. Install dependencies

```bash
# Install main project dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 3. Configure GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the fields:
   - **Application name**: GitActDash
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 4. Set up environment variables

#### Backend Configuration

Copy the example file and configure your credentials:

```bash
cp server/.env.example server/.env
```

Edit the `server/.env` file:

```env
# Port for the server
PORT=3001

# Port for the client (frontend)
CLIENT_PORT=3000

# Base URLs for the application (useful for production/Docker)
SERVER_URL=http://localhost:3001
CLIENT_URL=http://localhost:3000

# GitHub OAuth App credentials
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

# Session security (generate a strong random secret for production)
SESSION_SECRET=your-strong-random-session-secret-change-in-production

# Environment
NODE_ENV=development
```

#### Frontend Configuration (Optional)

Create a `client/.env.local` file to override default URLs:

```env
# Server URL (backend)
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# Client URL (frontend)
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

> **Note**: The frontend will automatically use the default ports if these variables are not set.

#### Production/Docker Example

For production or containerized environments:

```env
# server/.env (Production)
NODE_ENV=production
PORT=8080
CLIENT_PORT=80
SERVER_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com
SESSION_SECRET=your-super-secure-random-string-min-32-chars
```

### 5. Run the project

```bash
# Run both servers (frontend and backend)
npm run dev
```

The project will be available at:
- **Frontend**: http://localhost:3000 (or next available port)
- **Backend**: http://localhost:3001

## 📁 Project Structure

```
gitactdash/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # React Components
│   │   │   ├── dashboard/      # Dashboard Page
│   │   │   ├── layout.tsx      # Main Layout
│   │   │   └── page.tsx        # Home Page
│   │   └── styles/
│   ├── public/             # Static Files
│   ├── tailwind.config.js  # Tailwind Configuration
│   └── package.json
├── server/                 # Express Backend
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   ├── types/          # TypeScript Types
│   │   ├── config.ts       # Configuration
│   │   └── index.ts        # Main Server
│   ├── .env.example        # Environment Variables Example
│   └── package.json
├── .gitignore
├── package.json           # Main Scripts
└── README.md
```

## 🔧 Available Scripts

```bash
# Run in development mode
npm run dev

# Run frontend only
npm run dev --prefix client

# Run backend only
npm run dev --prefix server

# Build frontend
npm run build --prefix client

# Start frontend in production
npm run start --prefix client
```

## 🎯 How to Use

1. **Login**: Click "Login with GitHub" on the home page
2. **Authorization**: Authorize the app on GitHub
3. **Selection**: In the "Select Repositories" tab, choose repositories to monitor
4. **Monitoring**: Access the "Action Status" tab to view GitHub Actions status
5. **Filtering**: Use the various filters to focus on specific repositories or workflow states

## 🌐 Web Hosting

This application is designed to be safely hosted on the web with enterprise-grade security features:

- ✅ **Session-based authentication** (no localStorage vulnerabilities)
- ✅ **HTTP-only cookies** for token storage
- ✅ **HTTPS enforcement** in production
- ✅ **Security headers** (CSP, HSTS, CORS)
- ✅ **CSRF protection** with secure cookies

📖 **[Complete Web Hosting Guide](HOSTING_GUIDE.md)** - Detailed instructions for deploying to production with security best practices.

## 🛠️ Technologies Used

### Frontend
- Next.js 15.3.5
- React 19
- TypeScript 5+
- Tailwind CSS 3.4+
- PostCSS & Autoprefixer

### Backend
- Express.js 5+
- Express-session for secure authentication
- Helmet for security headers
- Axios for HTTP requests
- CORS for cross-origin communication
- dotenv for environment variables

### DevTools
- ESLint for linting
- TypeScript for type checking
- ts-node-dev for development
- Concurrently for running multiple scripts

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub API for functionality
- Next.js team for the framework
- Tailwind CSS for styling
- Vercel for hosting

---

**Built with ❤️ for the developer community**
