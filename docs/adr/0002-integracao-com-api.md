# ADR 0002: Integração com API - Autenticação e Comunicação HTTP

**Data**: 13 de maio de 2026  
**Status**: ACEITA  
**Autor**: Equipe de Backend/Frontend

---

## Contexto

O Plus MFE Auth precisa se comunicar com a API backend (`plus-ms-auth`) para:
1. Autenticar usuários (login)
2. Registrar novos usuários
3. Carregar dados do usuário atual
4. Listar usuários
5. Atualizar usuários
6. Deletar usuários

Requisitos:
- Segurança com JWT (Bearer token)
- Tratamento centralizado de erros
- Tipagem forte (TypeScript)
- Sinalização clara de falhas de rede (sem retry automático — ver Negativas)

---

## Decisão

### 1. **Camada HTTP Centralizada**

Criar um **cliente HTTP genérico** em `src/api/http.ts` que:
- Valida a URL base via `VITE_MS_AUTH_URL` (variável de ambiente)
- Adiciona automaticamente header `Authorization: Bearer <token>` se existir
- Trata erros de forma consistente com classe `ApiError`
- Suporta método GET, POST, PATCH, DELETE

**Código**:
```typescript
export const API_BASE = import.meta.env.VITE_MS_AUTH_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível contatar o servidor", 0);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(text || `Erro ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined as T;

  return res.json() as Promise<T>;
}
```

### 2. **Endpoints Específicos (Tipados)**

Criar arquivos com endpoints específicos do domínio:

#### `src/api/auth.ts`
```typescript
export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; username: string; email: string; role: string };
};

export function login(body: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", "POST", body);
}

export function register(body: RegisterRequest): Promise<void> {
  return request<void>("/auth/register", "POST", body);
}

export function me(): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/me", "GET");
}
```

#### `src/api/users.ts`
```typescript
export type User = { id: string; username: string; email: string; role: string };

export function listUsers(): Promise<User[]> {
  return request<User[]>("/users", "GET");
}

export function updateUser(id: string, body: UpdateUserRequest): Promise<User> {
  return request<User>(`/users/${id}`, "PATCH", body);
}

export function deleteUser(id: string): Promise<void> {
  return request<void>(`/users/${id}`, "DELETE");
}
```

### 3. **Tratamento de Erros**

**Estratégia centralizada** (implementação real em `http.ts`):
- **Falha de rede** (`fetch` lança) → `ApiError("Não foi possível contatar o servidor", 0)` — status `0` é a convenção para "não chegou ao servidor".
- **Resposta não-OK (qualquer 4xx ou 5xx)** → `ApiError(<body de texto> || \`Erro ${status}\`, status)`. O cliente **não** diferencia 4xx de 5xx — usa o body do backend se presente, caso contrário um genérico `Erro <status>`.
- **Status 204** ou resposta sem `Content-Type: application/json` → resolve com `undefined` (tratado como `void` na API tipada).
- **Resposta OK com JSON** → `res.json()` é retornado como `T`.

**Exposição do erro**:
```typescript
export const AuthApiError = ApiError;
export type AuthApiError = ApiError;

// Uso em componentes:
try {
  await login({ email, password });
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`Erro ${err.status}: ${err.message}`);
  }
}
```

### 4. **Gerenciamento de Token**

**Storage**:
- `localStorage.setItem("token", accessToken)` - Token de acesso
- `localStorage.setItem("refreshToken", refreshToken)` - Token de refresh

**Header automático**:
```typescript
if (token) headers["Authorization"] = `Bearer ${token}`;
```

**Logout**:
```typescript
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  navigate("/login");
};
```

### 5. **Variáveis de Ambiente**

**Necessária**:
- `VITE_MS_AUTH_URL` - URL do microserviço de auth (ex: `http://localhost:3001`)

**Exemplo de .env**:
```
VITE_MS_AUTH_URL=http://localhost:3001
```

**Fallback**: `http://localhost:3001` (para desenvolvimento local)

---

## ✅ Consequências

### Positivas
- ✅ **Centralização**: Um único lugar para lidar com autenticação HTTP
- ✅ **Reutilização**: Função `request` genérica com tipos fortes
- ✅ **Tratamento consistente**: Todos os erros passam por `ApiError`
- ✅ **Segurança**: Token automaticamente adicionado a todas as requisições autenticadas
- ✅ **Flexibilidade**: Fácil adicionar interceptadores, retry logic, refresh token

### Negativas
- ❌ **localStorage vulnerável a XSS**: Tokens em localStorage podem ser roubados via XSS (A confirmar: httpOnly cookies?)
- ❌ **Sem refresh token automático**: Atualmente não há interceptação para renovar token expirado
- ❌ **Sem timeout/retry**: Requisições longas podem falhar sem retry automático
- ❌ **TODO com UserRole**: Enum `USER_ROLES` em auth.ts precisa ser alinhado com backend

---

## 🔄 Alternativas Consideradas

### 1. **axios vs fetch**
- ✅ **Selecionado**: fetch (nativa, sem dependência extra)
- ❌ **Rejeitada**: axios (redundante, fetch nativa suficiente)

### 2. **localStorage vs Cookies vs Memory**
- ✅ **Selecionado**: localStorage (compatibilidade, persistência)
- ⚠️ **A confirmar**: Usar httpOnly cookies para refresh token (segurança)
- ❌ **Rejeitada**: Memory (perde ao recarregar página)

### 3. **Refresh Token Automático**
- ✅ **Futuro**: Implementar interceptador para renovar token antes de expirar
- ❌ **Não implementado**: Complexidade adicional
- 📝 **Sugestão**: Criar ADR separado quando necessário

### 4. **Global Error Handler**
- ⚠️ **Parcial**: Errors são capturados em cada página, mas propagados via `try/catch`
- 🔄 **Considerar**: Context API ou global error boundary para UX consistente

---

## 🔐 Endpoints Esperados

| Método | Endpoint | Descrição | Auth | Implementado no cliente |
|--------|----------|-----------|------|---|
| POST | `/auth/login` | Login com email/senha | ❌ | ✅ `auth.login()` |
| POST | `/auth/register` | Registro de novo usuário | ❌ | ✅ `auth.register()` |
| GET | `/auth/me` | Dados do usuário atual | ✅ | ✅ `auth.me()` |
| POST | `/auth/refresh` | Renovar access token via refresh token | ❌ | ❌ **pendente** |
| POST | `/auth/logout` | Revogar refresh token no backend | ✅ | ❌ **pendente** (logout atual só limpa localStorage) |
| GET | `/users` | Listar todos usuários | ✅ | ✅ `users.listUsers()` |
| PATCH | `/users/{id}` | Atualizar usuário | ✅ | ✅ `users.updateUser()` |
| DELETE | `/users/{id}` | Deletar usuário | ✅ | ✅ `users.deleteUser()` |

**Base URL**: `${VITE_MS_AUTH_URL}` (ex: `http://localhost:3001`)

> `auth/refresh` e `auth/logout` existem no backend (`plus-ms-auth`) e estão documentados no `CLAUDE.md` do projeto. O cliente HTTP do MFE ainda não os consome — refresh token automático é uma pendência conhecida (ver "Negativas" e "Alternativas Consideradas → Refresh Token Automático").

---

## 📌 Referências

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JWT Authentication](https://tools.ietf.org/html/rfc7519)
- [OWASP - Storage of Sensitive Data](https://owasp.org/www-community/vulnerabilities/Sensitive_Data_Exposure)

