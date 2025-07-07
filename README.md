# 🚀 GitActDash - GitHub Actions Dashboard

A modern and intuitive dashboard to monitor your GitHub repositories' Actions status in real-time.

![GitHub Actions Dashboard](https://img.shields.io/badge/Status-Active-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)

## ✨ Features

- 🔐 **GitHub OAuth Authentication**: Secure login with your GitHub account
- 📊 **Intuitive Dashboard**: Tab-based interface for better organization
- 🔍 **Repository Selection**: Choose which repositories to monitor
- 📈 **Real-time Status**: View GitHub Actions status updates
- 🎨 **Modern Interface**: Responsive design with Tailwind CSS
- 🔄 **Auto-refresh**: Automatically updated data

## 🏗️ Architecture

### Frontend (Client)
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

### Backend (Server)
- **Express.js** API server
- **GitHub OAuth** for authentication
- **GitHub API** for repository data
- **CORS** enabled for frontend-backend communication

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
PORT=8080
CLIENT_PORT=80
SERVER_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com
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

## 🛠️ Technologies Used

### Frontend
- Next.js 15.3.5
- React 19
- TypeScript 5+
- Tailwind CSS 3.4+
- PostCSS & Autoprefixer

### Backend
- Express.js 5+
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
