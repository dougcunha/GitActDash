# GitActDash: AI Agent Coding Instructions

## Project Overview
GitActDash is a dashboard for monitoring GitHub Actions across multiple repositories. It uses a Next.js frontend and an Express.js backend, both written in TypeScript. The client runs on port 3000, the server on port 3001.

## Architecture & Key Patterns
- **Frontend**: Located in `client/src/`. Built with Next.js (App Router), React hooks/context, and Tailwind CSS. State is managed with React's built-in features—no external state libraries.
- **Backend**: Located in `server/src/`. Express.js API, session-based authentication (Redis), security middleware, and RESTful endpoints. Integrates with GitHub OAuth and GitHub API.
- **Tests**: TypeScript tests compiled to JS in `tests/`.
- **Environment**: Use `.env` files in `server/` and `client/` for secrets and config. See `README.md` for setup details.

## Developer Workflows
- **Install dependencies**: Use `install.bat` (Windows) or `./install.sh` (Linux/macOS) from the root. Installs for root, client, and server.
- **Run dev servers**: Use `run-dev.bat` (Windows) or `./run-dev.sh` (Linux/macOS) from the root. Starts both frontend and backend.
- **Build frontend**: `npm run build` in `client/`.
- **Lint frontend**: `npm run lint` in `client/`.
- **Run tests**: `npm test` from root. For single tests, run compiled JS files in `tests/`.

## Coding Conventions
- **TypeScript strict mode**: Enforced in both client and server.
- **Imports**: Use ES modules in client, CommonJS in server.
- **Styling**: Only Tailwind CSS classes—no custom CSS files.
- **API**: RESTful endpoints, Express middleware pattern.
- **Naming**: camelCase for variables, PascalCase for components.
- **Error handling**: Use try/catch and proper HTTP status codes.
- **Documentation**: JSDoc comments in English. Each module should have a README if complex.
- **Comments**: Use English for all code comments.

## Integration Points
- **GitHub OAuth**: Configure via `server/.env` and GitHub Developer Settings. See `README.md` for details.
- **Session Management**: Uses Redis (see `server/src/middleware/session.ts`).
- **API Data Flow**: Frontend calls backend REST endpoints, which proxy to GitHub API.

## Examples
- **Frontend component**: See `client/src/app/components/ActionStatusDashboard.tsx` for dashboard layout and Tailwind usage.
- **Backend route**: See `server/src/routes/api.ts` for RESTful API patterns and GitHub integration.
- **State management**: See `client/src/app/contexts/ThemeContext.tsx` for context usage.

## Special Notes
- Do not use custom CSS—only Tailwind.
- Do not use external state libraries.
- Always check if dev servers are running before starting new ones to avoid port conflicts.
- Open local URLs directly in Chrome, not the internal browser.

---
For more details, see `README.md`, `AGENTS.md`, and `.github/instructions/instructions.instructions.md`.
