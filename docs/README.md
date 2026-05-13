# Documentação - Plus MFE Auth

Bem-vindo à documentação do **Plus MFE Auth**, o microfrontend de autenticação e gestão de usuários do projeto Plus.

## Conteúdo

### [Manual da UI](./manual-ui.md)
Guia completo sobre a interface de usuário, fluxos de autenticação, telas, componentes, rotas e consumo de API.

**Tópicos:**
- Visão geral das telas
- Fluxos de usuário
- Componentes principais
- Rotas e navegação
- Integração com API
- Variáveis de ambiente

### Arquitetura e Decisões (ADRs)

1. **[0001 - Visão Geral do Front-end](./adr/0001-visao-geral-do-front.md)**
   - Decisão de usar Module Federation
   - Arquitetura de componentes
   - Gerenciamento de estado com hooks

2. **[0002 - Integração com API](./adr/0002-integracao-com-api.md)**
   - Estratégia de autenticação
   - Padrão de requisições HTTP
   - Tratamento de erros

---

## Quick Start

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev  # Inicia em http://localhost:4001
```

### Build
```bash
npm run build
```

### Testes
```bash
npm run test         # Testes unitários
npm run test:watch   # Modo watch
npm run test:coverage # Com cobertura
```

### CI/CD

A documentação principal de CI/CD está no [README da raiz](../README.md#cicd).

Resumo:
- Workflow principal: `.github/workflows/ci.yml`
- Instalação de dependências: `npm ci`
- Testes unitários: `npm test`
- Build da aplicação: `npm run build`
- Release: executada pelo GitHub Actions para tags com prefixo `v`; criação/publicação da tag está **A confirmar**.

---

## Arquitetura

O projeto é estruturado como um **microfrontend (MFE)** que expõe componentes via **Module Federation**:

```
plus-mfe-auth (MFE)
├── LoginPage
├── RegisterPage
├── UsersPage
└── UpdateUserPage
```

Consumido pelo **plus-shell** (aplicação host).

---

## Autenticação

- **Token JWT** armazenado em `localStorage` (accessToken + refreshToken)
- **Authorization Header**: `Authorization: Bearer <token>`
- **Endpoint**: POST `/auth/login` (via plus-ms-auth)

---

## Stack Tecnológico

- **React 18** - UI library
- **Vite 5** - Build tool
- **TypeScript** - Type safety
- **Material-UI 9** - Component library
- **React Router 6** - Routing
- **Module Federation** - Micro frontend
- **Vitest** - Testing

---

## Notas

- Informações marcadas como **"A confirmar"** indicam decisões ainda em discussão ou que precisam validação com a API/backend.
- Consulte os ADRs para contexto detalhado sobre decisões arquiteturais.
- O manual da UI é o guia principal para compreender fluxos e componentes.

---

**Última atualização**: 13 de maio de 2026
