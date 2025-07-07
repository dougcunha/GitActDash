#!/bin/bash
# Executa o projeto em modo de desenvolvimento

# Inicia o servidor em background
echo "Starting the server..."
(cd server && npm run dev) &

# Inicia o cliente
echo "Starting the client..."
cd client
npm run dev
