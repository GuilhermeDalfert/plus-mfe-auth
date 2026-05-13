# ADR-0003 — Tema MUI dentro de cada MFE

## Status

Aceito — 2026-05-10

> Aprofunda a decisão de design system mencionada em [ADR-0001](./0001-visao-geral-do-front.md) (Visão Geral do Front-end, seção 4).

## Contexto

O projeto **Plus** é estruturado como **microfrontends** (MFEs) consumidos por um **shell** host via Module Federation. O requisito do trabalho exige o uso obrigatório do **MUI** como design system **dentro do MFE**.

A arquitetura prevê **múltiplos MFEs** ao longo do projeto (auth, futuros: produtos, vendas, etc.), todos compostos pelo mesmo shell.

Ao montar o MFE de autenticação (`plus-mfe-auth`), surgiu a pergunta: **onde mora o tema MUI** (cores, tipografia, raios de borda, overrides de componentes) — no shell, em cada MFE, ou num pacote compartilhado?

### Alternativas consideradas

#### Alternativa A — Cada MFE traz o próprio tema (escolhida)

Cada microfrontend define o próprio `ThemeProvider`, os próprios tokens, e envolve seus componentes expostos com tudo que precisa pra renderizar com a identidade visual correta.

- ✅ MFE é totalmente autocontido — funciona standalone (`npm run dev`) com visual idêntico ao consumido.
- ✅ MFE não depende do shell para renderizar corretamente.
- ✅ Equipes responsáveis por MFEs diferentes têm autonomia total sobre o visual do seu domínio.
- ✅ Compatível com a leitura literal do requisito: *"MFE — MUI como design system (mandatory)"* — a obrigatoriedade está no MFE.
- ❌ Tema duplicado em N repositórios — qualquer mudança (ex: cor primária) exige sincronizar todos.
- ❌ Risco real de divergência visual entre MFEs ao longo do tempo, mesmo entre membros do mesmo grupo.
- ❌ Cada MFE precisa instalar e versionar MUI individualmente.

#### Alternativa B — Shell centraliza o tema; MFEs ficam "crus"

O shell mantém o `ThemeProvider` com o tema do projeto e envolve todos os MFEs consumidos. Os MFEs expõem componentes "puros" (sem chrome próprio, sem ThemeProvider).

- ✅ Fonte única da verdade para o design system.
- ✅ Mudanças no tema afetam todos os MFEs automaticamente.
- ✅ Componentes de layout reutilizáveis (header, cards, menus) ficam no shell.
- ❌ MFE rodando standalone (em dev) aparece sem estilização (visual cru).
- ❌ Acoplamento implícito: MFE assume que o consumidor fornece um `ThemeProvider`.
- ❌ Conflita com a leitura literal do requisito de que o MFE deve ter MUI como design system.

#### Alternativa C — Design system em pacote compartilhado

Extrair o tema e os tokens para um pacote npm interno (ex: `@plus/design-system`) consumido tanto pelo shell quanto pelos MFEs.

- ✅ Verdadeiro single source of truth, sem acoplamento direto entre shell e MFEs.
- ✅ MFE roda standalone com estilização correta.
- ✅ Padrão usado por empresas como Shopify, Spotify e Atlassian.
- ❌ Setup adicional: monorepo, pipeline de publicação ou registry interno.
- ❌ Overhead operacional desproporcional ao tamanho do trabalho acadêmico.

## Decisão

Adotar a **Alternativa A**: o tema MUI vive **dentro de cada MFE**, junto com os componentes de chrome próprios (`AppHeader`, `AuthCard`, etc.). Os MFEs expõem **telas completas** — com `ThemeProvider`, layout e formulário já embrulhados — e o shell se limita a carregar, rotear e gerenciar estado global (token, redirecionamento).

A decisão foi guiada por feedback recebido do grupo, em alinhamento com a leitura literal do requisito do trabalho: *"Microfrontend (MFE) — MUI como design system (obrigatório)"* — a obrigatoriedade do design system está sobre o MFE, não sobre o shell.

### Implementação

- **MFE** (`plus-mfe-auth` e demais):
  - Possui `src/theme/tokens.ts` (cores, raios, sombras, fonte) e `src/theme/index.ts` (`createTheme` do MUI).
  - Possui componentes de layout próprios (`AppHeader`, `AuthCard`).
  - Componentes expostos via Module Federation já vêm envolvidos em `<ThemeProvider><CssBaseline/>...</ThemeProvider>` e no chrome correspondente.
  - Em desenvolvimento isolado (`npm run dev`), o visual é idêntico ao que o shell renderiza.

- **Shell** (`plus-shell-grupo05`):
  - Não possui tema próprio nem componentes de design.
  - Carrega componentes federados e os renderiza como vêm.
  - Responsabilidades: roteamento, gerenciamento de token (localStorage), `PrivateRoute`, redirecionamento pós-login.

## Consequências

### Positivas

- **Autonomia total dos MFEs**: cada equipe controla o visual do seu domínio sem depender do shell.
- **MFE roda standalone com fidelidade visual** — facilita desenvolvimento e demonstração isolada.
- **Atende ao requisito literal do trabalho** — o design system está dentro do MFE como exigido.
- **Shell simples e estável** — menos código no shell significa menos mudanças e menos conflitos no repo central.

### Negativas

- **Risco de divergência visual entre MFEs.** Sem uma fonte única, cores, tipografia e espaçamentos podem derivar entre módulos. Mitigação: convenção de copiar os mesmos tokens entre MFEs e revisar visualmente em PRs.
- **Manutenção multiplicada.** Mudar a cor primária do projeto exige editar N repositórios. Mitigação: documentar os tokens canônicos em local visível (ex: README do grupo) e considerar a Alternativa C se o número de MFEs crescer.
- **Possível duplicação visual no shell** se múltiplos MFEs trouxerem chrome próprio (ex: dois headers "PLUS" empilhados). Mitigação: definir convenção sobre quais MFEs trazem header e quais não, ou planejar layout do shell pra evitar empilhamento.
- **Bundle maior** — cada MFE traz a própria cópia do MUI/Emotion. Mitigação: declarar `@mui/material`, `@mui/system`, `@emotion/react`, `@emotion/styled` como `shared` no `vite-plugin-federation` pra que o consumidor (shell) reuse uma única instância em runtime.
