---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Project Context and Coding Guidelines

## Project Context

GitActDash is a dashboard for monitoring the status of GitHub Actions across multiple repositories. It consists of a Next.js frontend and an Express.js backend.

## 1. Coding Guidelines

1. **Code Structure**: Organize code into components and modules for better maintainability.
2. **Type Safety**: Use TypeScript for type safety and to catch errors early.
3. **API Integration**: Follow RESTful principles when designing API endpoints.
4. **State Management**: Use React's built-in state management or context API for managing global state.
5. **Styling**: Use Tailwind CSS for styling components consistently.
6. **Testing**: Write unit tests for critical components and functions.
7. **Documentation**: Document code with JSDoc comments in English and maintain a README for each module.
8. **Code comments**: Use comments in English to explain complex logic or important decisions in the code.

### 2. Running in Development Mode

To start the development environment (frontend and backend simultaneously), use the scripts in the root directory:
- **Linux/macOS**: `./run-dev.sh`
- **Windows**: `run-dev.bat`

**IMPORTANT** Always check if the project is already running before executing these scripts to avoid port conflicts.

Do not use the internal browser to run the project. Instead, open the URLs directly in Chrome.

This will start:
- The API server (usually at `http://localhost:3001`).
- The Next.js client (usually at `http://localhost:3000`).

### 3. Modifying Code

- For visual and interface changes, edit the files in `client/src/`.
- For changes to the API logic, such as authentication or fetching data from GitHub, edit the files in `server/src/`.

### 4. Adding New Dependencies

- If the dependency is for the **frontend**, navigate to the `client/` directory and run `npm install <package>`.
- If the dependency is for the **backend**, navigate to the `server/` directory and run `npm install <package>`.