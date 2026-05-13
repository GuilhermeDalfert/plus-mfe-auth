# ADR-0004 — Esconder ações de admin no MFE, não só bloquear no backend

## Status

Aceito — 2026-05-13

> Complementa [ADR-0002](./0002-integracao-com-api.md), que cobre o JWT e o Bearer token. Aqui o foco é **autorização no front** (esconder UI), não autenticação.

## Contexto

O `plus-ms-auth` protege as **ações destrutivas** de gestão de usuários com `ROLE_ADMIN` em `SecurityConfiguration.java`: `PATCH /users/{id}` e `DELETE /users/{id}` retornam **403** para qualquer usuário sem o papel. Já o `GET /users` é permitido para `ADMIN` **e** `USER` autenticados (`hasAnyRole("ADMIN", "USER")`) — qualquer logado consegue listar.

Em tese o backend bastaria para a regra crítica de segurança (impedir mutação). Na prática, ao implementar o `UsersPage` e o `UpdateUserPage` no `plus-mfe-auth`, o problema apareceu: um usuário comum **carregava a lista normalmente** mas via os botões "Adicionar", "Deletar Usuário(s)" e o ícone de "Editar" — todos garantidos a falhar com 403 ao clicar. O time precisava decidir: o MFE deveria *também* checar o papel para esconder esses controles, ou continuar exibindo tudo e deixar o backend rejeitar?

A pergunta apareceu de forma concreta no commit `2de3614` ("modal refatorizado, Apenas admim consegue ver: editar, adicionar e deletar usuários"), durante o refinamento da UsersPage.

### Alternativas consideradas

#### Alternativa A — Esconder ações no MFE quando `role !== "ADMIN"` (escolhida)

O MFE consulta `/auth/me` via `useCurrentUser`, lê o `role` retornado e usa um flag `isAdmin` para condicionar a renderização dos botões "Adicionar usuário" / "Deletar usuário(s)", da coluna "Ações" da tabela, dos checkboxes de seleção e do ícone de editar.

- ✅ Usuário comum não vê controles que sempre falhariam — UX limpa.
- ✅ Defesa em profundidade: backend continua sendo a autoridade; o MFE só serve como camada de UX.
- ✅ Reduz a superfície de pedidos 403 inúteis para o backend (menos ruído em log e métricas).
- ✅ Permite render condicional da contagem de colunas (`columnCount = isAdmin ? 4 : 3`) sem quebrar o layout.
- ❌ Regra de autorização agora vive em dois lugares (backend + MFE) — se um papel novo (ex: `MANAGER`) for criado, é preciso lembrar de atualizar os dois.
- ❌ O cliente é "confiável" para mostrar/esconder UI, mas **nunca** para autorizar — exige disciplina do time para não cair na tentação de pular o backend ("já checamos no front").

#### Alternativa B — Mostrar tudo para todos; backend rejeita

Manter a UI única e deixar o usuário comum ver os botões. Ao clicar, vai cair em 403 e exibimos uma mensagem.

- ✅ Regra de autorização fica em um lugar só (backend).
- ✅ Zero risco de divergência entre front e back.
- ❌ UX terrível: o usuário vê opções que nunca funcionam.
- ❌ Spam de requisições 403 ao clicar nos controles, ruim para observabilidade.
- ❌ A lista carrega normalmente para qualquer logado, então a página parece funcional — o que torna a frustração ainda pior quando cada ação falha.

#### Alternativa C — Rotas inteiras protegidas no shell

O shell carrega `useCurrentUser`, verifica `role` e impede o usuário comum de chegar até a `UsersPage` (redireciona para outra tela). O MFE não precisa saber sobre papéis.

- ✅ Mantém o MFE "burro" sobre autorização.
- ✅ Centraliza no shell, junto com `PrivateRoute` e gestão de token.
- ❌ Quebra a autonomia do MFE: quem entende a regra de "só admin gerencia usuários" é o domínio de auth, não o shell.
- ❌ Acopla o shell a regras de domínio que deveriam viver no próprio MFE.
- ❌ Não cobre ações dentro de uma página parcialmente acessível (ex: futura tela onde admin vê N coisas e usuário comum vê M).

## Decisão

Adotar a **Alternativa A**: o MFE consulta `useCurrentUser` e usa `isAdmin = currentUser?.role === "ADMIN"` para esconder controles de gerenciamento. O backend continua sendo a única autoridade real — o MFE apenas **reflete** o que o usuário poderia fazer.

A regra orientadora é: **se o backend retorna 403, o controle não deveria nem ter aparecido.** O MFE não bloqueia nada; ele só evita exibir o que seria bloqueado.

### Implementação

Em `plus-mfe-auth/src/pages/UsersPage.tsx`:

```ts
const currentUser = useCurrentUser();
const isAdmin = currentUser?.role === "ADMIN";
const canDelete = isAdmin && selected.size > 0;
const columnCount = isAdmin ? 4 : 3;
```

Itens condicionados a `isAdmin`:

- Botão **"adicionar usuário"** no cabeçalho.
- Botão **"Deletar Usuário(s)"** (também precisa de `selected.size > 0` via `canDelete`).
- Coluna **"Ações"** na tabela (cabeçalho e células).
- Ícone de **editar** em cada linha.
- Checkboxes de **seleção** de linha.

Refinamento adicional, fora do escopo puro de role mas relacionado: **o admin não pode deletar a si mesmo.** A linha do próprio usuário tem o checkbox desabilitado com `<Tooltip title="Você não pode deletar a si mesmo">`. A regra existe no front para evitar UX confusa; cabe ao backend ter a regra equivalente.

O hook `useCurrentUser` (`src/hooks/useCurrentUser.ts`) carrega `/auth/me` uma vez no mount e retorna `CurrentUser | null`. Enquanto o fetch não resolve, `isAdmin` é `false` por padrão — então a UI **começa** sem ações de admin e só revela quando o servidor confirma o papel. Isso evita um flash de botões que poderiam aparecer indevidamente.

## Consequências

### Positivas

- **UX coerente**: usuário comum não vê ações inúteis; admin vê a interface completa.
- **Defesa em profundidade**: a regra de segurança continua no backend; o MFE é a camada de UX.
- **Menos pedidos 403** chegando ao backend para `PATCH` e `DELETE` de `/users` — reduz ruído em logs (o `GET /users` continua aberto a qualquer logado, então o tráfego de listagem não muda).
- **Padrão claro para futuras telas**: qualquer ação privilegiada nova no MFE deve checar `isAdmin` antes de renderizar.

### Negativas

- **Regra duplicada parcialmente** entre `SecurityConfiguration.java` (backend, autoritativo para `PATCH`/`DELETE` em `/users`) e checks de `role` espalhados em `UsersPage.tsx` (front, para UX). Mitigação: ao introduzir um papel novo, fazer um grep por `=== "ADMIN"` no MFE para garantir que todos os pontos foram atualizados.
- **Risco de falsa sensação de segurança**: alguém pode confiar no check do front e pular a validação do back num endpoint novo. Mitigação: o backend é sempre a fonte da verdade; ADRs e revisão de PR devem reforçar isso.
- **Acoplamento ao formato de `CurrentUser`**: o MFE depende de o backend retornar `role` em `/auth/me` como string compatível com a comparação `=== "ADMIN"`. Se o backend mudar o nome (ex: `roles: ["ADMIN"]` em array), todos os checks quebram. Mitigação: centralizar a derivação de `isAdmin` num helper se a complexidade crescer.
- **Janela de mount sem `currentUser`**: durante o fetch de `/auth/me`, `isAdmin` é `false`. Para o admin, há um instante em que a UI parece de usuário comum. Mitigação aceita: o atraso é curto e o "default seguro" (esconder) é preferível ao oposto.
