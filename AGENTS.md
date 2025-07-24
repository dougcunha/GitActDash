# 🤖 Instructions for AI Agents

## Commands
- **Install**: `install.bat` (Windows) or `./install.sh` (Linux/macOS) - installs all dependencies
- **Dev**: `npm run dev` (root) - starts both client and server concurrently
- **Test**: `npm test` (root) - compiles and runs TypeScript tests
- **Lint**: `npm run lint` (in client/) - ESLint check
- **Build**: `npm run build` (in client/) - Next.js production build
- **Single test**: Navigate to tests/ and run specific .js files after compilation

## Architecture
- **Client**: Next.js/React with TypeScript, Tailwind CSS (port 3000)
- **Server**: Express.js with TypeScript, Redis sessions (port 3001)  
- **Database**: Redis for session management
- **Tests**: TypeScript compiled to JS in tests/ directory

## Code Style
- **TypeScript**: Strict mode enabled, use proper types
- **Imports**: ES modules in client, CommonJS in server
- **Styling**: Tailwind CSS classes, no custom CSS
- **API**: RESTful endpoints, Express middleware pattern
- **State**: React hooks/context, no external state library
- **Naming**: camelCase variables, PascalCase components
- **Error handling**: Try/catch blocks, proper HTTP status codes

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
