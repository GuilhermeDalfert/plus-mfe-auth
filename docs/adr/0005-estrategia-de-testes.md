# ADR-0005 — Estratégia de testes: Vitest + Testing Library + jsdom

## Status

Aceito — 2026-05-13

> Complementa [ADR-0001](./0001-visao-geral-do-front.md), que cita "Testing: Cada componente pode ser testado isoladamente" sem detalhar **como**.

## Contexto

O MFE precisa de testes automatizados que rodem na CI (ver [ADR-0006](./0006-cicd-e-lockfile-versionado.md)) e dêem confiança em duas frentes:

1. **Componentes de UI** (`AuthCard`) renderizam o conteúdo esperado.
2. **Páginas que orquestram chamadas à API** (`LoginPage`, `RegisterPage`) submetem o payload correto, exibem erros e disparam callbacks após sucesso.

A pergunta foi: qual stack de teste adotar, e como lidar com componentes que dependem do **React Router** (usam `useNavigate` ou `<Link>`)? Tentamos testar `RegisterPage` direto e quebrou — `useNavigate()` exige um Router no contexto, e a mensagem de erro do React Router é genérica o suficiente pra atrasar o diagnóstico.

A correção apareceu no commit `5f55f87` ("fix: RegisterPage agora envolvem o componente em `<MemoryRouter>`").

### Alternativas consideradas

#### Alternativa A — Vitest + Testing Library + jsdom (escolhida)

- Vitest reaproveita a config do Vite (`vite.config.js` declara `test: { environment: "jsdom", globals: true, setupFiles: ["./tests/setup.ts"] }`).
- `@testing-library/react` para queries por papel/texto (centradas no usuário).
- `@testing-library/user-event` para interações reais (typing, click) em vez de `fireEvent`.
- `jsdom` como ambiente de DOM virtual.
- `@testing-library/jest-dom` para matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.).

- ✅ Mesma toolchain do build → CI rápida, sem configurar Jest separadamente.
- ✅ ESM nativo, sem transpilação adicional.
- ✅ Padrão Testing Library casa com o jeito como o usuário usa a UI.
- ❌ Sem testes end-to-end nativos (ver Negativas).

#### Alternativa B — Jest + Testing Library

- ✅ Ecossistema maduro, documentação ampla.
- ❌ Precisa de Babel/SWC para TS/JSX — segunda toolchain a manter.
- ❌ Resolução de ESM ainda é dolorosa no Jest.
- ❌ Mais lento que o Vitest no nosso tamanho de projeto.

#### Alternativa C — Playwright/Cypress (E2E como prioridade)

- ✅ Testa a integração real entre MFE, shell e backend.
- ❌ Lento para feedback em PR — não cabe no loop de desenvolvimento.
- ❌ Exige stack completa no CI (Postgres, gateway, etc.) — incompatível com o tempo de cada job.
- ❌ Escopo do trabalho não justifica ainda.

## Decisão

Adotar **Vitest + @testing-library/react + @testing-library/user-event + jsdom**, com `tests/setup.ts` carregando `@testing-library/jest-dom/vitest` para os matchers.

**Convenção firmada (a partir do commit `5f55f87`):**

> Toda página/componente que usa hooks de roteamento (`useNavigate`, `useLocation`, `useParams`) ou componentes (`<Link>`) **deve** ser renderizada dentro de `<MemoryRouter>` nos testes.

Padrão concreto adotado em `tests/pages/RegisterPage.test.tsx` e `tests/pages/LoginPage.test.tsx`:

```ts
import { MemoryRouter } from "react-router-dom";

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}
```

**Mock de API** via `vi.mock` no módulo `src/api/auth.ts`, preservando o resto do módulo com `vi.importActual` para que tipos como `USER_ROLES` continuem disponíveis:

```ts
vi.mock("../../src/api/auth", async () => {
  const actual = await vi.importActual<typeof import("../../src/api/auth")>("../../src/api/auth");
  return { ...actual, register: vi.fn() };
});
```

### Escopo atual

| Arquivo | Cobre |
|---|---|
| `tests/components/AuthCard.test.tsx` | Renderização do componente reutilizável. |
| `tests/pages/LoginPage.test.tsx` | Submissão de login, persistência de token, callback `onLogin`, erro da API. |
| `tests/pages/RegisterPage.test.tsx` | Validação de email no front, payload tipado enviado à API, callback `onRegister`, erro da API. |

Scripts em `package.json`:
- `npm test` — uma rodada (usado na CI).
- `npm run test:watch` — modo watch para desenvolvimento.
- `npm run test:coverage` — relatório de cobertura via `@vitest/coverage-v8`.

## Consequências

### Positivas

- **CI rápida** — vitest reaproveita o pipeline Vite, sem dupla configuração.
- **Testes centrados no usuário** — `getByRole`, `getByLabelText` quebram menos em refactor de implementação.
- **Mock isolado por arquivo** — `vi.mock` no `auth.ts` mantém o restante real (tipos, constantes), evita falsificar demais.
- **Padrão MemoryRouter documentado** — quem adicionar uma página nova sabe o que fazer ao primeiro `useNavigate is not a function`.

### Negativas

- **Sem testes E2E** — qualquer integração real entre MFE/shell/backend só é exercitada manualmente ou em produção. Mitigação aceita: o escopo do trabalho não justifica Playwright/Cypress ainda; se a stack crescer, vale criar um repositório separado de E2E.
- **Componentes que usam Module Federation runtime não são testáveis em unidade** — o `remoteEntry.js` só existe no contexto do shell. Mitigação: o MFE testa o que é dele (páginas, componentes, API) e confia no contrato federado.
- **Duplicação do wrapper `<MemoryRouter>`** — cada arquivo de teste de página declara seu próprio `renderWithRouter`. Mitigação aceita por enquanto: extrair para um helper compartilhado só se virar regra em 4+ testes.
- **`USER_ROLES` ainda é placeholder** — os testes usam `USER_ROLES[0]` (`"USER"`), e o backend ainda não definiu o enum canônico (ver [ADR-0002](./0002-integracao-com-api.md), Negativas). Quando o backend fixar os papéis, os testes precisam ser revisitados.
