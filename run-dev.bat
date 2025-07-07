@echo off
REM Executa o projeto em modo de desenvolvimento

echo "Starting the server in a new window..."
start "Server" cmd /c "cd server && npm run dev"

echo "Starting the client..."
cd client
npm run dev
