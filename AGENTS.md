# 🤖 Instructions for AI Agents (Codex)

This document provides guidelines for interacting with the `GitActDash` project.

## 🎯 Project Goal

GitActDash is a dashboard for monitoring the status of GitHub Actions across multiple repositories. It consists of a Next.js frontend and an Express.js backend.

## 🏗️ Architecture

- **`client/`**: Frontend application in Next.js/React.
- **`server/`**: Backend API in Express.js.
- **`package.json` (root)**: Orchestrates the scripts to run both environments.

## 🗺️ Coding Guidelines

1. **Code Structure**: Organize code into components and modules for better maintainability.
2. **Type Safety**: Use TypeScript for type safety and to catch errors early.
3. **API Integration**: Follow RESTful principles when designing API endpoints.
4. **State Management**: Use React's built-in state management or context API for managing global state.
5. **Styling**: Use Tailwind CSS for styling components consistently.
6. **Testing**: Write unit tests for critical components and functions.
7. **Documentation**: Document code with JSDoc comments in English and maintain a README for each module.
8. **Code comments**: Use comments in English to explain complex logic or important decisions in the code.

## 🛠️ Common Tasks

### 1. Installing Dependencies

Dependencies are managed in three locations: at the root, in `client/`, and in `server/`.

To install everything, run the scripts from the project root:
- **Linux/macOS**: `./install.sh`
- **Windows**: `install.bat`

These scripts install dependencies in all three folders.

### 2. Running in Development Mode

To start the development environment (frontend and backend simultaneously), use the scripts in the root directory:
- **Linux/macOS**: `./run-dev.sh`
- **Windows**: `run-dev.bat`

This will start:
- The API server (usually at `http://localhost:3001`).
- The Next.js client (usually at `http://localhost:3000`).

### 3. Modifying Code

- For visual and interface changes, edit the files in `client/src/`.
- For changes to the API logic, such as authentication or fetching data from GitHub, edit the files in `server/src/`.

### 4. Adding New Dependencies

- If the dependency is for the **frontend**, navigate to the `client/` directory and run `npm install <package>`.
- If the dependency is for the **backend**, navigate to the `server/` directory and run `npm install <package>`.
