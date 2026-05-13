# plus-mfe-auth

Microfrontend de autenticação e gestão de usuários do projeto **Plus**.

Expõe páginas via **Module Federation** para serem consumidas pelo `plus-shell`. Construído com React + Vite + TypeScript.

---

## Tecnologias

- React 18
- Vite 5
- TypeScript
- Material UI
- React Router
- Vitest
- `@originjs/vite-plugin-federation` — Module Federation
- `@vitejs/plugin-react`

---

## Module Federation

Este microfrontend atua como **remote**:

| Propriedade | Valor |
|---|---|
| Nome | `mfe_auth` |
| Entry point | `http://localhost:4001/assets/remoteEntry.js` |
| Expõe | `./LoginPage` → `src/pages/LoginPage.tsx` |
| Expõe | `./RegisterPage` → `src/pages/RegisterPage.tsx` |
| Expõe | `./UsersPage` → `src/pages/UsersPage.tsx` |
| Expõe | `./UpdateUserPage` → `src/pages/UpdateUserPage.tsx` |
| Shared | `react`, `react-dom`, `react-router-dom` |

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_MS_AUTH_URL` | URL do `plus-ms-auth` (ex: `http://localhost:3001`) |

---

## Integração com API

O front integra com o backend `plus-ms-auth` usando `fetch` centralizado em `src/api/http.ts`.

| Recurso | Endpoints consumidos |
|---|---|
| Autenticação | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Usuários | `GET /users`, `PATCH /users/{id}`, `DELETE /users/{id}` |

A autenticação usa JWT salvo em `localStorage` e enviado no header `Authorization: Bearer <token>`.

Swagger/OpenAPI do backend: **A confirmar** no repositório `plus-ms-auth`.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento na porta 4001 |
| `npm run typecheck` | Executa a validação de tipos com TypeScript |
| `npm test` | Executa os testes unitários com Vitest |
| `npm run test:coverage` | Executa os testes unitários com relatório de cobertura |
| `npm run build` | Gera o bundle em `dist/` |
| `npm run preview` | Serve o build na porta 4001 |

---

## CI/CD

Este repositório possui pipeline configurado com GitHub Actions.

O pipeline executa automaticamente:

- testes unitários;
- build da aplicação;
- geração de release, quando aplicável.

Workflow principal:

```text
.github/workflows/ci.yml
```

Comandos utilizados pelo pipeline:

| Etapa | Comando |
|---|---|
| Instalação de dependências | `npm ci` |
| Validação de tipos | `npm run typecheck` |
| Testes unitários | `npm test` |
| Build da aplicação | `npm run build` |

Release: o job é executado para tags com prefixo `v`, gera um `.zip` com `dist/` e cria uma GitHub Release. Criação/publicação da tag: **A confirmar**.

Observação: alterações apenas em arquivos Markdown são ignoradas pelo workflow atual por `paths-ignore`.

---

## Desenvolvimento local (sem Docker)

```bash
npm install
npm run dev
```

Acesse: http://localhost:4001

---

## Documentação

- [Índice da documentação](docs/README.md)
- [Manual de UI](docs/manual-ui.md)
- [ADR 0001 - Visão Geral do Front-end](docs/adr/0001-visao-geral-do-front.md)
- [ADR 0002 - Integração com API](docs/adr/0002-integracao-com-api.md)

---

## Executando com a stack completa

Este serviço é orquestrado pelo `plus-infra`. Consulte o [README do plus-infra](https://github.com/pucrs-sweii-2026-1-30/plus-infra).
