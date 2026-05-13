# Manual da UI - Plus MFE Auth

**Documentação completa da interface de usuário, componentes e fluxos de autenticação.**

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Rotas e Telas](#rotas-e-telas)
3. [Fluxos de Usuário](#fluxos-de-usuário)
4. [Componentes](#componentes)
5. [Consumo da API](#consumo-da-api)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Temas e Design System](#temas-e-design-system)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Plus MFE Auth** é um microfrontend que fornece:
- Login de usuários
- Registro de novos usuários
- Listagem e gestão de usuários
- Edição de dados de usuários
- Sistema de autenticação com JWT

**Stack Tecnológico**:
- React 18
- Vite 5
- Material-UI 9
- TypeScript
- React Router 6
- Module Federation (Vite)

---

## Rotas e Telas

### 1. **Login Page** (`/login`)

**Arquivo**: [src/pages/LoginPage.tsx](../src/pages/LoginPage.tsx)

**Componentes**:
- AppHeader (sem ícone de menu)
- AuthCard com título "ENTRAR"
- Formulário com campos:
  - Email (required, type="email")
  - Senha (required, type="password")
  - Botão "Entrar"
  - Exibição de erros via Alert

**Props**:
```typescript
type LoginPageProps = {
  onLogin?: (token: string) => void;
};
```

**Fluxo**:
1. Usuário preenche email e senha
2. Clica "Entrar"
3. Requisição POST `/auth/login` com `{ email, password }`
4. **Sucesso**: Token armazenado em localStorage, callback `onLogin()` dispara
5. **Erro**: Mensagem de erro exibida no Alert

**Endpoints**:
- `POST /auth/login` → `LoginResponse`

**Armazenamento**:
- `localStorage.token` = accessToken
- `localStorage.refreshToken` = refreshToken

---

### 2. **Register Page** (`/register`)

**Arquivo**: [src/pages/RegisterPage.tsx](../src/pages/RegisterPage.tsx)

**Componentes**:
- AppHeader com ícone de menu e dados do usuário logado
- Sidebar lateral (minimizável)
- AuthCard com título "CADASTRAR"
- Formulário com campos:
  - Usuário (username, required)
  - E-mail (required, type="email")
  - Senha (required, type="password")
  - Role/Perfil (Select com valores: USER, ADMIN)
  - Botão "Cadastrar"
  - Exibição de erros via Alert

**Props**:
```typescript
type RegisterPageProps = {
  onRegister?: () => void;
};
```

**Fluxo**:
1. Usuário preenche formulário
2. Seleciona Role no dropdown
3. Clica "Cadastrar"
4. Requisição POST `/auth/register` com `{ username, email, password, role }`
5. **Sucesso**: Callback `onRegister()` dispara, navegação para `/users`
6. **Erro**: Mensagem de erro exibida

**Endpoints**:
- `POST /auth/register` → void (sem response body)

**Validações** (A confirmar):
- Email válido (client-side apenas?)
- Senha com requisitos mínimos? (A confirmar)
- Username único? (server-side)

---

### 3. **Users Page** (`/users`)

**Arquivo**: [src/pages/UsersPage.tsx](../src/pages/UsersPage.tsx)

**Componentes**:
- AppHeader com ícone de menu e dados do usuário logado
- Sidebar lateral (minimizável)
- Painel principal com:
  - Botão "+ Adicionar Usuário"
  - Campo de busca (filtra por username, email, role)
  - Tabela com colunas:
    - Checkbox (seleção múltipla)
    - ID
    - Usuário
    - Email
    - Perfil/Role
    - Ações (ícone de editar)
  - Botão "Deletar Selecionados" (vermelho, só ativa se itens selecionados)
  - Estados de loading (spinner), erro (Alert), vazio

**Props**:
```typescript
type UsersPageProps = {
  onAddUser?: () => void;  // Callback ao clicar "Adicionar"
};
```

**Fluxo**:
1. Página carrega lista de usuários via `GET /users`
2. Usuários são exibidos em tabela
3. Usuário pode:
   - **Buscar**: Digita no campo de busca, filtra em tempo real
   - **Selecionar**: Clica checkbox para seleção múltipla
   - **Editar**: Clica ícone de editar, navega para `/users/{id}`
   - **Deletar selecionados**: Clica botão vermelho, confirma em modal, deleta via `DELETE /users/{id}`
   - **Adicionar**: Clica botão "+ Adicionar", dispara callback `onAddUser()` ou navega para `/register`

**Endpoints**:
- `GET /users` → `User[]`
- `DELETE /users/{id}` → void (sem response)

**Estado**:
- `users`: Array de usuários carregados
- `loading`: Boolean indicando se está carregando
- `error`: String com mensagem de erro (se houver)
- `selected`: Set<string> com IDs dos usuários selecionados
- `search`: String com query de busca

**Lógica de Seleção**:
- Usuário não pode deletar a si mesmo (checkbox desabilitado para usuário atual)
- Confirmação via modal antes de deletar

---

### 4. **Update User Page** (`/users/:id`)

**Arquivo**: [src/pages/UpdateUserPage.tsx](../src/pages/UpdateUserPage.tsx)

**Componentes**:
- AppHeader com ícone de menu e dados do usuário logado
- Sidebar lateral (minimizável)
- Painel principal com:
  - Título: "Editar Usuário"
  - Formulário com campos:
    - Username (text input)
    - Email (email input)
    - Role (Select)
  - Botões:
    - "Salvar" (azul)
    - "Cancelar" (cinza)
    - "Deletar Usuário" (vermelho)
  - Estados: loading, erro no carregamento, erro na salvação

**Fluxo**:
1. URL contém ID do usuário (`/users/:id`)
2. Página carrega lista de usuários e encontra o usuário com ID especificado
3. Formulário é preenchido com dados do usuário
4. Usuário pode:
   - **Editar**: Altera campos, clica "Salvar"
   - **Cancelar**: Volta para `/users`
   - **Deletar**: Clica botão vermelho, confirma em modal, deleta via `DELETE /users/{id}`

**Endpoints**:
- `GET /users` → `User[]` (lista completa, depois filtra pelo ID)
- `PATCH /users/{id}` → `User` (atualiza usuário)
- `DELETE /users/{id}` → void (deleta usuário)

**Estado**:
- `user`: Dados do usuário carregado
- `loading`: Boolean indicando se está carregando
- `loadError`: String com erro de carregamento
- `saving`: Boolean indicando se está salvando
- `saveError`: String com erro de salvação
- `deleting`: Boolean indicando se está deletando
- `username`, `email`, `role`: Campos do formulário

---

## 👥 Fluxos de Usuário

### Fluxo 1: Login

```
[Tela Login] 
    ↓ preenche email/senha
[Clica "Entrar"]
    ↓
[API: POST /auth/login]
    ↓
┌─ Sucesso: Token recebido
│   ↓
│   localStorage.token = accessToken
│   localStorage.refreshToken = refreshToken
│   ↓
│   onLogin(token) callback
│   ↓
│   [Redirect /users]
│
└─ Erro: Exibe mensagem
    ↓
    [Permanece em /login]
```

### Fluxo 2: Registro

```
[Tela Register]
    ↓ preenche username, email, senha, role
[Clica "Cadastrar"]
    ↓
[API: POST /auth/register]
    ↓
┌─ Sucesso
│   ↓
│   onRegister() callback
│   ↓
│   [Redirect /users]
│
└─ Erro: Exibe mensagem
    ↓
    [Permanece em /register]
```

### Fluxo 3: Listar Usuários

```
[Tela Users - Carregamento]
    ↓
[API: GET /users] (com header Authorization: Bearer {token})
    ↓
┌─ Sucesso: Lista recebida
│   ↓
│   [Exibe tabela com usuários]
│   ↓
│   Usuário pode: buscar, selecionar, editar, deletar
│
└─ Erro: Exibe mensagem de erro
    ↓
    [Tenta recarregar? - Não implementado]
```

### Fluxo 4: Editar Usuário

```
[Clica ícone editar em /users]
    ↓ params: userId
[Navega /users/{id}]
    ↓
[API: GET /users] (carrega lista, filtra por id)
    ↓
┌─ Usuário encontrado
│   ↓
│   [Exibe formulário preenchido]
│   ↓
│   Usuário edita campos
│   ↓
│   [Clica "Salvar"]
│   ↓
│   [API: PATCH /users/{id} com dados alterados]
│   ↓
│   Sucesso: [Redirect /users]
│   Erro: Exibe mensagem
│
└─ Usuário não encontrado
    ↓
    [Exibe erro: "Usuário não encontrado"]
```

### Fluxo 5: Deletar Usuário

```
[Seleciona checkboxes em /users OU clica "Deletar" em /users/{id}]
    ↓
[Clica botão de delete]
    ↓
[Modal de confirmação]
    ↓
Usuário confirma?
│
├─ SIM
│   ↓
│   [API: DELETE /users/{id}]
│   ↓
│   Sucesso: [Remove da tabela ou redirect /users]
│   Erro: Exibe mensagem
│
└─ NÃO
    ↓
    [Modal fecha, nada muda]
```

### Fluxo 6: Logout

```
[Clica "Sair" na Sidebar]
    ↓
localStorage.removeItem("token")
localStorage.removeItem("refreshToken")
    ↓
[Redirect /login]
```

---

## 🧩 Componentes

### Componente: AppHeader

**Arquivo**: [src/components/AppHeader.tsx](../src/components/AppHeader.tsx)

**Renderização**:
```
┌─────────────────────────────────────────────────┐
│ [≡]  PLUS                    [username] [👤]   │ ← Altura: 71px
└─────────────────────────────────────────────────┘
```

**Props**:
```typescript
type AppHeaderProps = {
  leading?: ReactNode;           // Elemento à esquerda (ex: IconButton menu)
  currentUser?: {                // Dados do usuário logado
    username: string;
    role: string;
  } | null;
};
```

**Comportamento**:
- `leading`: Slot para ícone de menu (opcional)
- Logo "PLUS" sempre no centro-esquerda
- Se `currentUser`: Exibe username, role e ícone de usuário
- Se sem `currentUser`: Não exibe info de usuário

**Estilo**:
- Background: `colors.surface` (branco/claro)
- Borda inferior: 3px solid `colors.brandBorder` (cor da marca)
- Sombra: `shadows.header`

---

### Componente: AuthCard

**Arquivo**: [src/components/AuthCard.tsx](../src/components/AuthCard.tsx)

**Renderização**:
```
┌────────────────────┐
│     ENTRAR        │  ← Título
│  ┌──────────────┐ │
│  │ E-mail       │ │  ← Formulário
│  │ Senha        │ │
│  │ [Entrar]     │ │
│  └──────────────┘ │
└────────────────────┘
```

**Props**:
```typescript
type AuthCardProps = {
  title: string;      // Título do card (ex: "ENTRAR", "CADASTRAR")
  children: ReactNode; // Conteúdo interno (formulário)
};
```

**Dimensões**:
- Width: 346px
- Padding: 25px vertical, 15px horizontal
- Border-radius: `radii.card` (12px)

**Estilo**:
- Background: `colors.surface`
- Sombra: `shadows.card`
- Título em cor `colors.brand`, fontWeight 700, fontSize 36px

---

### Componente: Sidebar

**Arquivo**: [src/components/Sidebar.tsx](../src/components/Sidebar.tsx)

**Renderização**:
```
┌──────────────┐
│ ⌂  Início    │  ← Seção superior
│ 👥 Usuários  │
├──────────────┤
│ ⇦ Sair       │  ← Seção inferior
│ ←← Minimizar │
└──────────────┘
```

**Props**:
```typescript
type SidebarProps = {
  active?: SidebarItemKey;           // Item selecionado ("home" | "users")
  onNavigate?: (key: SidebarItemKey) => void; // Callback de navegação
  open?: boolean;                    // Se sidebar está aberta (default: true)
  onMinimize?: () => void;           // Callback ao minimizar
};
```

**Itens**:
```typescript
// Seção superior
{ key: "home", label: "Início", icon: <DesktopWindowsIcon /> }
{ key: "users", label: "Usuários", icon: <GroupIcon /> }

// Seção inferior
{ key: "logout", label: "Sair", icon: <LogoutIcon /> }
{ key: "minimize", label: "Minimizar menu", icon: <KeyboardArrowLeftIcon /> }
```

**Comportamento**:
- Item ativo tem background `ACTIVE_BG` (rgba(76, 55, 42, 0.51))
- Click em "logout": Remove token, redirect /login
- Click em "minimize": Chama callback, sidebar fecha
- Click em "home" ou "users": Navega via callback ou rota interna

**Estilo**:
- Background: `SIDEBAR_BG` (rgba(76, 55, 42, 0.5))
- Cor texto: #ffffff
- Hover: Muda background para `ACTIVE_BG`

**Estado Persistido**:
- `useSidebarState()` hook salva estado em `localStorage.plus.sidebarOpen`

---

## 🔌 Consumo da API

### Estratégia de Autenticação

Todas as requisições **autenticadas** incluem header:
```
Authorization: Bearer <accessToken>
```

Token é armazenado em `localStorage.token` após login.

### Função `request()` Genérica

**Arquivo**: [src/api/http.ts](../src/api/http.ts)

```typescript
export async function request<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T>
```

**Exemplo de uso**:
```typescript
// GET request
const users = await request<User[]>("/users", "GET");

// POST request
const response = await request<LoginResponse>("/auth/login", "POST", {
  email: "user@example.com",
  password: "senha123",
});

// PATCH request
const updated = await request<User>("/users/123", "PATCH", {
  username: "novo_nome",
});

// DELETE request
await request<void>("/users/123", "DELETE");
```

**Comportamento**:
1. Adiciona header `Content-Type: application/json` se houver body
2. Adiciona header `Authorization: Bearer {token}` se existir token em localStorage
3. Envia requisição via fetch
4. Se resposta não OK: Lança `ApiError` com mensagem
5. Se status 204: Retorna undefined
6. Se content-type não é JSON: Retorna undefined
7. Senão: Parsa JSON e retorna

### Classe `ApiError`

```typescript
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Uso
try {
  await login({ email, password });
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`Status ${err.status}: ${err.message}`);
  }
}
```

### Endpoints - Auth

#### Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "senha123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid-here",
    "username": "joao",
    "email": "user@example.com",
    "role": "USER"
  }
}

Error (400/401):
"Credenciais inválidas"
```

#### Register
```
POST /auth/register
Content-Type: application/json

Request:
{
  "username": "joao",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "USER"
}

Response (201 Created):
(sem body)

Error (400/409):
"Email já está registrado"
```

#### Current User
```
GET /auth/me
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "id": "uuid-here",
  "username": "joao",
  "email": "joao@example.com",
  "role": "USER"
}

Error (401):
"Token expirado" ou "Unauthorized"
```

### Endpoints - Users

#### List Users
```
GET /users
Authorization: Bearer <accessToken>

Response (200 OK):
[
  {
    "id": "uuid-1",
    "username": "joao",
    "email": "joao@example.com",
    "role": "USER"
  },
  {
    "id": "uuid-2",
    "username": "maria",
    "email": "maria@example.com",
    "role": "ADMIN"
  }
]

Error (401):
"Unauthorized"
```

#### Update User
```
PATCH /users/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "username": "novo_nome",
  "email": "novo@example.com",
  "role": "ADMIN"
}

Response (200 OK):
{
  "id": "uuid-1",
  "username": "novo_nome",
  "email": "novo@example.com",
  "role": "ADMIN"
}

Error (404):
"Usuário não encontrado"
```

#### Delete User
```
DELETE /users/{id}
Authorization: Bearer <accessToken>

Response (204 No Content):
(sem body)

Error (404):
"Usuário não encontrado"
```

### Estados de Carregamento

Nas páginas que fazem requisições HTTP, os estados são:

```typescript
const [loading, setLoading] = useState(false);      // GET inicial
const [saving, setSaving] = useState(false);        // POST/PATCH
const [deleting, setDeleting] = useState(false);    // DELETE
const [error, setError] = useState<string | null>(null);
```

**Indicadores visuais**:
- Loading: `<CircularProgress />`
- Error: `<Alert severity="error">{error}</Alert>`
- Empty state: Mensagem "Nenhum usuário encontrado"

---

## ⚙️ Variáveis de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_MS_AUTH_URL` | URL do microserviço de autenticação | `http://localhost:3001` |

### Arquivo `.env`

```
VITE_MS_AUTH_URL=http://localhost:3001
```

### Arquivo `.env.production`

```
VITE_MS_AUTH_URL=https://api.plus.com
```

### Uso no Código

```typescript
import.meta.env.VITE_MS_AUTH_URL  // Acesso via Vite

// Em src/api/http.ts
const API_BASE = import.meta.env.VITE_MS_AUTH_URL ?? "http://localhost:3001";
```

### Fallback

Se `VITE_MS_AUTH_URL` não estiver definido, usa `http://localhost:3001` (ambiente local).

---

## 🎨 Temas e Design System

### Design Tokens

**Arquivo**: [src/theme/tokens.ts](../src/theme/tokens.ts)

#### Cores

```typescript
colors = {
  primary: "#2a414d",        // Azul escuro (inputs, botões)
  brand: "#2a414d",          // Azul marca (textos, logo)
  brandBorder: "#9ca3af",    // Cinza (borda do header)
  surface: "#ffffff",        // Branco (backgrounds)
  label: "#545454",          // Cinza escuro (labels, textos secundários)
}
```

#### Espaçamentos (Border Radius)

```typescript
radii = {
  button: 10,    // Botões: 10px
  input: 12,     // Inputs: 12px
  card: 12,      // Cards: 12px
}
```

#### Sombras

```typescript
shadows = {
  card: "0 2px 8px rgba(0, 0, 0, 0.1)",
  header: "0 2px 4px rgba(0, 0, 0, 0.08)",
}
```

#### Tipografia

```typescript
fontFamily: "'Inter', 'Roboto', sans-serif"
```

### Tema Material-UI

**Arquivo**: [src/theme/index.ts](../src/theme/index.ts)

O tema Material-UI é customizado com:

```typescript
export const theme = createTheme({
  palette: {
    primary: { main: colors.primary },
    secondary: { main: colors.brand },
    background: { default: colors.surface },
    text: { primary: colors.brand, secondary: colors.label },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 800, fontSize: 36 },
    button: { fontWeight: 700, fontSize: 24, textTransform: "none" },
  },
  components: {
    MuiButton: {
      // Botões customizados
      styleOverrides: {
        root: {
          borderRadius: radii.button,
          height: 41,
          minWidth: 192,
        },
      },
    },
    MuiOutlinedInput: {
      // Inputs customizados
      styleOverrides: {
        root: {
          borderRadius: radii.input,
          height: 40,
          backgroundColor: colors.surface,
        },
      },
    },
  },
});
```

### Uso do Tema em Componentes

```typescript
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { colors } from "../theme/tokens";

export function LoginPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: colors.brand }}>
        {/* Componentes */}
      </Box>
    </ThemeProvider>
  );
}
```

---

## 🆘 Troubleshooting

### "Erro ao fazer login"

**Causa possível**: API retornou erro 401/400
- Verificar se email/senha estão corretos
- Verificar se `VITE_MS_AUTH_URL` aponta para servidor correto
- Verificar logs do console

**Solução**:
```bash
# Verifique a variável de ambiente
echo $VITE_MS_AUTH_URL

# Teste conexão com API
curl http://localhost:3001/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

---

### "Não foi possível contatar o servidor"

**Causa possível**: API não está rodando ou URL está incorreta
- Verificar se microserviço `plus-ms-auth` está rodando
- Verificar se porta está correta (default: 3001)
- Verificar firewall/CORS

**Solução**:
```bash
# Inicie o microserviço
cd ../plus-ms-auth
npm run dev

# Verifique a URL
curl http://localhost:3001/health
```

---

### "Usuário não encontrado" (ao editar)

**Causa possível**: Usuário foi deletado antes de abrir a página de edição
- ID na URL não existe mais
- Voltar para /users e recarregar

**Solução**: Implementar validação server-side (A confirmar)

---

### Token expirado

**Sintoma**: Requisições retornam 401 após algum tempo
- **Situação atual**: Token não é automaticamente renovado
- **Solução**: Fazer login novamente
- **Futuro**: Implementar refresh token automático (ver ADR 0002)

---

### "Erro ao registrar" / "Email já existe"

**Causa possível**: Email já foi registrado
- Tentar com outro email
- Verificar se usuário já existe em `/users`

**Solução**: Usar email único

---

### "Não pode deletar a si mesmo"

**Comportamento esperado**: Checkbox é desabilitado para usuário atual em `/users`
- User não consegue selecionar seu próprio usuário
- Permissão server-side também evita delete (A confirmar)

---

### Sidebar não persiste estado

**Causa possível**: localStorage desabilitado ou navegador privado
- Verificar se localStorage está habilitado
- Testar em modo normal (não privado)

**Código relevante**:
```typescript
// src/hooks/useSidebarState.ts
const STORAGE_KEY = "plus.sidebarOpen";
window.localStorage.setItem(STORAGE_KEY, String(open));
```

---

### Componentes não carregam (Module Federation)

**Causa possível**: remoteEntry.js não foi gerado ou URLs estão incorretas
- Verificar se build foi executado: `npm run build`
- Verificar se portas (shell: 5000, mfe: 4001) estão corretas
- Ver console do browser para erros de CORS

---

## 📚 Links e Referências

- [Documentação geral](./README.md)
- [ADR 0001 - Arquitetura do Front](./adr/0001-visao-geral-do-front.md)
- [ADR 0002 - Integração com API](./adr/0002-integracao-com-api.md)
- [Material-UI Docs](https://mui.com)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)

