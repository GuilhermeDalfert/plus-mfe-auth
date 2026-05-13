# ADR 0001: Visão Geral da Arquitetura do Front-end

**Data**: 13 de maio de 2026  
**Status**: ACEITA  
**Autor**: Equipe de Arquitetura

---

## Contexto

O projeto Plus necessita de um módulo de autenticação e gestão de usuários que seja:
1. Reutilizável em múltiplos contextos (arquitetura em microfrontends)
2. Independente e deployável
3. Escalável e mantível
4. Integrado com o sistema de roteamento global (plus-shell)

O Plus MFE Auth deve ser um microfrontend que expõe componentes/páginas para serem consumidos por um shell (aplicação host).

---

## Decisão

Adotar a seguinte arquitetura:

### 1. **Module Federation (Vite Plugin)**
- Usar `@originjs/vite-plugin-federation` para expor páginas como componentes remotos
- Expor: `LoginPage`, `RegisterPage`, `UsersPage`, `UpdateUserPage`
- Compartilhar dependências: `react`, `react-dom`, `react-router-dom`
- Entry point: `remoteEntry.js` (gerado automaticamente no build)

**Arquivo**: `vite.config.js`
```javascript
federation({
  name: "mfe_auth",
  filename: "remoteEntry.js",
  exposes: {
    "./LoginPage": "./src/pages/LoginPage",
    "./RegisterPage": "./src/pages/RegisterPage",
    "./UsersPage": "./src/pages/UsersPage",
    "./UpdateUserPage": "./src/pages/UpdateUserPage",
  },
  shared: ["react", "react-dom", "react-router-dom"],
})
```

### 2. **Arquitetura de Pastas**
```
src/
├── api/              # Camada de comunicação com API
│   ├── auth.ts       # Endpoints de autenticação
│   ├── users.ts      # Endpoints de usuários
│   └── http.ts       # Cliente HTTP centralizado
├── components/       # Componentes reutilizáveis
│   ├── AppHeader.tsx      # Cabeçalho com info do usuário
│   ├── AuthCard.tsx       # Card para login/registro
│   ├── ConfirmDialog.tsx  # Modal de confirmação (ex: deletar usuário)
│   └── Sidebar.tsx        # Menu lateral
├── hooks/            # Custom hooks
│   ├── useCurrentUser.ts    # Carrega usuário logado
│   └── useSidebarState.ts   # Persiste estado da sidebar
├── pages/            # Páginas/Telas (expostas via Module Federation)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── UsersPage.tsx
│   └── UpdateUserPage.tsx
├── theme/            # Design system
│   ├── index.ts      # Tema Material-UI customizado
│   └── tokens.ts     # Design tokens (cores, espaçamentos, etc)
└── main.tsx          # Entry point da aplicação (modo desenvolvimento)
```

### 3. **Gerenciamento de Estado**
- **Sem Redux/Zustand**: Usar hooks customizados e React context quando necessário
- **localStorage**: Para persistir token de autenticação e estado da sidebar
- **Props callbacks**: Componentes reutilizáveis recebem callbacks (onLogin, onRegister, etc)
- **useCurrentUser**: Hook que carrega dados do usuário logado via API

### 4. **Design System (Tema)**
- Material-UI como base
- Design tokens customizados em `tokens.ts`:
  - **Cores**: brand, primary, surface, label, etc
  - **Espaçamentos**: radii (border-radius padronizado)
  - **Sombras**: card, header, etc
  - **Tipografia**: fontFamily customizada
- Tema centralizado em `theme/index.ts` com componentes MUI personalizados

> Detalhamento da decisão de **onde mora o tema** (no MFE vs. no shell) em [ADR-0003 — Tema MUI dentro de cada MFE](./0003-tema-mui-no-mfe.md).

---

## Consequências

### Positivas
- **Modularidade**: Cada página é um componente independente reutilizável
- **Code splitting automático**: Module Federation garante bundles isolados
- **Escalabilidade**: Fácil adicionar novas páginas/features sem afetar shell
- **TypeScript**: Type safety em toda a aplicação
- **Testing**: Cada componente pode ser testado isoladamente
- **Design consistency**: Sistema de design centralizado com tokens

### Negativas
- **Complexidade de build**: Module Federation adiciona complexidade ao Vite
- **Shared dependencies**: Necessário sincronizar versões com shell (react, react-dom, react-router)
- **Sem state global**: Para dados compartilhados, precisa ser props drilling ou context API
- **Autenticação**: Token em localStorage é vulnerável a XSS (ver [ADR-0002](./0002-integracao-com-api.md) para o tratamento completo de auth)
- **Autorização**: A regra de admin-only no MFE é tratada à parte (ver [ADR-0004](./0004-visibilidade-admin-only-no-mfe.md))

---

## Alternativas Consideradas

### 1. **Redux para State Management**
- **Rejeitada**: Overkill para escopo atual
- **Reconsiderado**: Se state global crescer além de autenticação + sidebar

### 2. **localStorage vs SessionStorage vs Cookies**
- **Selecionado**: localStorage (compatibilidade, simples)
- **A confirmar**: Usar httpOnly cookies para refresh token (segurança)

### 3. **Styled Components vs Material-UI + CSS-in-JS**
- **Selecionado**: Material-UI + Emotion (já vem com MUI)
- **Rejeitada**: Tailwind (conflitaria com design system MUI)

---

## Referências

- [Vite Module Federation](https://github.com/originjs/vite-plugin-federation)
- [React 18 Best Practices](https://react.dev)
- [Material-UI v9](https://mui.com)
- [Micro Frontends](https://micro-frontends.org)

