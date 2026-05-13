# ADR-0006 — Pipeline de CI/CD e lockfile versionado

## Status

Aceito — 2026-05-13

> Operacionaliza a estratégia de testes definida em [ADR-0005](./0005-estrategia-de-testes.md).

## Contexto

O MFE precisa de uma pipeline de CI que valide cada PR (typecheck + testes + build) e produza um artefato versionado quando uma tag de release for criada. Três pontos viraram decisões reais ao longo da jornada — todos visíveis no git log:

1. **Onde rodar a CI?** Cada repo do projeto Plus é independente; cada um tem seu próprio fluxo.
2. **O `package-lock.json` entra no git ou não?** O `.gitignore` inicial do MFE ignorava o lockfile (commit `61101da fix: front lock off git` corrigiu).
3. **A CI quebrou ao instalar dependências.** O erro vinha do `esbuild` reclamando de dependência opcional de plataforma quando o lockfile gerado por uma versão antiga de npm encontrava a versão moderna no runner — daí a sequência `38e9951 ci: track package-lock.json for reproducible builds` → `a21c82f ci: regenerate package-lock.json` → `3b72bfe ci: regenerate lockfile with modern npm`.

### Alternativas consideradas

#### Sobre o runner de CI

**A — GitHub Actions (escolhida)**
- ✅ Nativo do GitHub, sem custo extra para repos públicos/privados acadêmicos.
- ✅ Cache de `npm` integrado (`actions/setup-node@v4` com `cache: 'npm'`).
- ✅ Artefatos e GitHub Releases nativos.
- ❌ Vendor lock-in (mas o `.yml` é portátil para outros runners se necessário).

**B — CI externa (GitLab, CircleCI, Jenkins)**
- ❌ Setup adicional sem benefício para o escopo atual.

#### Sobre versionar o `package-lock.json`

**A — Lockfile no git (escolhida)**
- ✅ Builds reproduzíveis — a CI instala exatamente as mesmas versões da máquina de quem testou.
- ✅ Permite `npm ci` (mais rápido e estrito que `npm install`).
- ❌ Conflitos de merge no lockfile podem ser feios; precisam ser resolvidos regenerando, não editando à mão.

**B — Ignorar lockfile no git (descartada)**
- ❌ Cada CI baixa versões diferentes — bug "funciona na minha máquina" garantido.
- ❌ Foi o estado inicial (corrigido em `61101da`).

#### Sobre o bug de optional deps do esbuild

**A — Atualizar npm na CI antes do install (escolhida)**
- O runner do Ubuntu vem com uma versão de npm que tinha bug conhecido com `optionalDependencies` de plataforma — o lockfile registrava o binário `@esbuild/linux-x64` e o npm antigo recusava a instalação correta.
- Solução: `npm install -g npm@latest` antes do `npm ci`.
- ✅ Workaround mínimo, sem alterar o lockfile.
- ❌ Adiciona ~5s ao job de CI.

**B — Fixar versão exata do esbuild / pular optional deps**
- ❌ Tratamento do sintoma, não da causa.

**C — Voltar ao `npm install` em vez de `npm ci`**
- ❌ Abre mão da reprodutibilidade.

## Decisão

### Pipeline

Pipeline única em `.github/workflows/ci.yml`, com dois jobs:

**Job `build`** (roda em push/PR para `main` e em tags `v*`):

```yaml
- Setup Node.js 20 com cache npm
- Update npm:  npm install -g npm@latest    ← workaround esbuild
- Install:     npm ci
- Type check:  npm run typecheck
- Test:        npm test
- Build:       npm run build
- Upload artifact: dist/ (retention 7 dias)
```

**Job `release`** (gate `if: startsWith(github.ref, 'refs/tags/v')`):

```yaml
- Download artifact dist/
- Zip:           plus-mfe-auth-<tag>.zip
- Create Release: softprops/action-gh-release@v2 (gera notes automaticamente)
```

### Skip de runs irrelevantes

```yaml
paths-ignore:
  - '**.md'
  - '.ai_log/**'
```

Mudanças puramente de docs não gastam minutos de CI.

### Lockfile

- **`package-lock.json` versionado** no git.
- **Não pode** estar no `.gitignore` (regressão silenciosa que já mordeu uma vez).
- Atualizado regenerando com npm moderno (`npm install` numa máquina com `npm@latest`), nunca editado à mão.

## Consequências

### Positivas

- **Builds reproduzíveis** — `npm ci` falha se o lockfile estiver desincronizado com `package.json`, então PRs que esquecem de commitar o lockfile são pegos antes do merge.
- **Releases auditáveis** — tag `v*` no git ↔ artefato zip ↔ GitHub Release com release notes automáticas.
- **CI gratuita e integrada** — sem custo operacional adicional.
- **Skip de docs** — README, ADRs e `.ai_log/` não disparam builds (~30 minutos de CI economizados por PR de documentação).

### Negativas

- **Workaround do npm antigo** sobrevive enquanto a imagem do Ubuntu não atualizar. Quando o runner vier com npm moderno por padrão, o passo `Update npm` vira morto e pode ser removido. **Gatilho de revisão:** validar a versão do npm no runner a cada 6 meses.
- **Lockfile gera ruído em PRs** — atualizações de dependência inflam o diff. Mitigação: revisões aprendem a focar no `package.json` e tratar `package-lock.json` como gerado.
- **Vendor lock-in no GitHub Actions** — migrar para outro CI exigiria reescrever o `.yml`. Risco baixo: a sintaxe é simples (~74 linhas) e Bash dentro do `run:` é portátil.
- **Sem deploy automático** — o release zipa o `dist/` mas não publica em CDN, S3 nem servidor algum. Hoje o deploy é manual via Docker Compose orquestrado pelo `plus-infra-grupo05`. **Gatilho de revisão:** quando o MFE for hospedado em ambiente produtivo real, adicionar job de deploy.
- **Não há lint** — pipeline cobre typecheck e teste, mas não ESLint/Prettier. Estilo está sendo regulado por convenção, não por ferramenta. **Gatilho de revisão:** adicionar lint se a divergência de estilo aumentar entre os membros do grupo.
