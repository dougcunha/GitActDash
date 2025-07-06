# 🚀 GitActDash - GitHub Actions Dashboard

Um dashboard moderno e intuitivo para monitorar o status das GitHub Actions dos seus repositórios em tempo real.

![GitHub Actions Dashboard](https://img.shields.io/badge/Status-Active-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)

## ✨ Funcionalidades

- 🔐 **Autenticação GitHub OAuth**: Login seguro com sua conta GitHub
- 📊 **Dashboard Intuitivo**: Interface com abas para melhor organização
- 🔍 **Seleção de Repositórios**: Escolha quais repositórios monitorar
- 📈 **Status em Tempo Real**: Visualize o status das GitHub Actions
- 🎨 **Interface Moderna**: Design responsivo com Tailwind CSS
- 🔄 **Auto-atualização**: Dados atualizados automaticamente

## 🏗️ Arquitetura

### Frontend (Client)
- **Next.js 15** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **React Hooks** para gerenciamento de estado

### Backend (Server)
- **Express.js** API server
- **GitHub OAuth** para autenticação
- **GitHub API** para dados dos repositórios
- **CORS** habilitado para comunicação frontend-backend

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Conta no GitHub
- GitHub OAuth App configurado

### 1. Clone o repositório

\`\`\`bash
git clone https://github.com/SEU_USUARIO/gitactdash.git
cd gitactdash
\`\`\`

### 2. Instale as dependências

\`\`\`bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do cliente
cd client && npm install && cd ..

# Instalar dependências do servidor
cd server && npm install && cd ..
\`\`\`

### 3. Configurar GitHub OAuth App

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os campos:
   - **Application name**: GitActDash
   - **Homepage URL**: \`http://localhost:3000\`
   - **Authorization callback URL**: \`http://localhost:3001/api/auth/callback\`
4. Clique em "Register application"
5. Copie o **Client ID** e **Client Secret**

### 4. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

\`\`\`bash
cp server/.env.example server/.env
\`\`\`

Edite o arquivo \`server/.env\`:

\`\`\`env
PORT=3001
GITHUB_CLIENT_ID=seu_client_id_aqui
GITHUB_CLIENT_SECRET=seu_client_secret_aqui
\`\`\`

### 5. Executar o projeto

\`\`\`bash
# Executar ambos os servidores (frontend e backend)
npm run dev
\`\`\`

O projeto estará disponível em:
- **Frontend**: http://localhost:3000 (ou próxima porta disponível)
- **Backend**: http://localhost:3001

## 📁 Estrutura do Projeto

\`\`\`
gitactdash/
├── client/                 # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Componentes React
│   │   │   ├── dashboard/      # Página do dashboard
│   │   │   ├── layout.tsx      # Layout principal
│   │   │   └── page.tsx        # Página inicial
│   │   └── styles/
│   ├── public/             # Arquivos estáticos
│   ├── tailwind.config.js  # Configuração Tailwind
│   └── package.json
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── types/          # Tipos TypeScript
│   │   ├── config.ts       # Configuração
│   │   └── index.ts        # Servidor principal
│   ├── .env.example        # Exemplo de variáveis
│   └── package.json
├── .gitignore
├── package.json           # Scripts principais
└── README.md
\`\`\`

## 🔧 Scripts Disponíveis

\`\`\`bash
# Executar em modo desenvolvimento
npm run dev

# Executar apenas o frontend
npm run dev --prefix client

# Executar apenas o backend
npm run dev --prefix server

# Build do frontend
npm run build --prefix client

# Iniciar frontend em produção
npm run start --prefix client
\`\`\`

## 🎯 Como Usar

1. **Login**: Clique em "Login with GitHub" na página inicial
2. **Autorização**: Autorize o app no GitHub
3. **Seleção**: Na aba "Select Repositories", escolha os repositórios para monitorar
4. **Monitoramento**: Acesse a aba "Action Status" para ver o status das GitHub Actions

## 🛠️ Tecnologias Utilizadas

### Frontend
- Next.js 15.3.5
- React 19
- TypeScript 5+
- Tailwind CSS 3.4+
- PostCSS & Autoprefixer

### Backend
- Express.js 5+
- Axios para requests HTTP
- CORS para comunicação cross-origin
- dotenv para variáveis de ambiente

### DevTools
- ESLint para linting
- TypeScript para type checking
- ts-node-dev para desenvolvimento
- Concurrently para executar múltiplos scripts

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- GitHub API pela funcionalidade
- Next.js team pelo framework
- Tailwind CSS pela estilização
- Vercel pela hospedagem

---

**Desenvolvido com ❤️ para a comunidade de desenvolvedores**
