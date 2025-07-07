#!/bin/bash
# Executa o projeto em modo de desenvolvimento

# Inicia o servidor em background
echo "Iniciando o servidor..."
(cd server && npm run dev) &

# Inicia o cliente
echo "Iniciando o cliente..."
cd client
npm run dev
