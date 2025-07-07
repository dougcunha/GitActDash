#!/bin/bash
# Instala as dependências do projeto (root, client e server)

echo "Instalando dependências do root..."
npm install

echo "Instalando dependências do client..."
cd client
npm install
cd ..

echo "Instalando dependências do server..."
cd server
npm install
cd ..

echo "Instalação concluída!"
