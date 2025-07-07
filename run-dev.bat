@echo off
REM Executa o projeto em modo de desenvolvimento

echo "Iniciando o servidor em uma nova janela..."
start "Server" cmd /c "cd server && npm run dev"

echo "Iniciando o cliente..."
cd client
npm run dev
