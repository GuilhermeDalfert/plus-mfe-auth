# ADR-0007 — Persistência de estado de UX no localStorage com prefixo `plus.`

## Status

Aceito — 2026-05-13

> Complementa [ADR-0001](./0001-visao-geral-do-front.md), que cita "localStorage: Para persistir token de autenticação e estado da sidebar" sem detalhar a convenção de chaves.

## Contexto

Algumas escolhas de UI precisam **sobreviver à navegação** mas não pertencem ao backend. O primeiro caso concreto que apareceu foi a **sidebar do `UsersPage`**: o usuário a fecha porque incomoda, navega para outra página e, ao voltar, ela está aberta de novo — fricção desnecessária.

A questão imediata foi: **onde guardar esse tipo de estado?** E, mais importante para o longo prazo, **qual convenção seguir** para que o próximo estado de UX persistente (filtros de tabela, modo escuro, tamanho de coluna, etc.) não vire bagunça?

### Alternativas consideradas

#### Alternativa A — `localStorage` com prefixo `plus.` (escolhida)

Cada estado de UX persistente ganha sua própria chave no `localStorage`, sempre com prefixo `plus.` para evitar colisão com chaves de outras origens (incluindo possíveis outros MFEs futuros consumidos pelo mesmo shell).

- ✅ Sobrevive a reload completo da página, não só a navegação client-side.
- ✅ Compartilhado entre abas do mesmo domínio (útil — sidebar uniforme em duas abas).
- ✅ Síncrono, sem promise — pode ser lido no `useState` inicializador sem flicker.
- ✅ Prefixo `plus.` deixa claro a quem a chave pertence em devtools.
- ❌ Compartilhamento entre abas pode ser indesejado em casos futuros (mitigação na hora de criar a chave nova).
- ❌ Não funciona em modo privado/SSR sem fallback (já tratado — ver implementação).

#### Alternativa B — `sessionStorage`

- ✅ Estado some quando a aba fecha — pode ser desejável para alguns casos.
- ❌ Não sobrevive ao reload em outra sessão.
- ❌ Comportamento inconsistente com o `token` que já vive em `localStorage`.

#### Alternativa C — Estado em memória (Context API)

- ✅ Não toca disco/storage.
- ❌ Perde tudo ao reload. Para sidebar isso é exatamente o problema que queremos resolver.

#### Alternativa D — Persistir no backend (preferências do usuário)

- ✅ Sincroniza entre dispositivos.
- ❌ Overhead enorme para "abrir/fechar sidebar". Backend não precisa saber disso.
- ❌ Adiciona endpoints e estado servidor que não fazem parte do domínio de auth.

## Decisão

Adotar **Alternativa A**: estado de UX persistente vive em `localStorage`, em chaves prefixadas com `plus.`, encapsuladas em hooks customizados (`useSidebarState`, `useXxxState`).

### Convenção firmada

1. **Prefixo `plus.`** em toda chave (`plus.sidebarOpen`, `plus.tableFilters`, etc.).
2. **Um hook por chave** — nada de ler `localStorage` direto no componente. O hook encapsula serialização, parsing e SSR safety.
3. **Default explícito** quando a chave não existe ainda (não confiar em `JSON.parse(null)`).
4. **SSR safe**: testar `typeof window === "undefined"` antes de ler — mesmo que hoje não usemos SSR, o custo é uma linha e protege contra surpresas em testes ou render server-side futuro.
5. **Não usar** o prefixo `plus.` para tokens de autenticação. A chave histórica `token` e `refreshToken` (sem prefixo) continua pelo legado e por já estar documentada em [ADR-0002](./0002-integracao-com-api.md); novos itens **sempre** usam prefixo.

### Implementação de referência (`useSidebarState.ts`)

```ts
const STORAGE_KEY = "plus.sidebarOpen";

function readInitial(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function useSidebarState() {
  const [open, setOpen] = useState<boolean>(readInitial);
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(open));
  }, [open]);
  return [open, setOpen] as const;
}
```

Padrão de uso na página:

```ts
const [sidebarOpen, setSidebarOpen] = useSidebarState();
```

A página não sabe que existe localStorage — só pega o `[valor, setter]` como qualquer `useState`.

## Consequências

### Positivas

- **UX coerente** — fechar a sidebar uma vez vale para toda a sessão e além.
- **Padrão claro para o futuro** — quando alguém quiser persistir filtros da tabela de usuários, o caminho é "copiar `useSidebarState.ts`, trocar a chave e o tipo".
- **Sem dependência nova** — `localStorage` é nativo, zero peso no bundle.
- **Testável** — o hook é puro o suficiente para mockar `localStorage` em vitest se necessário.

### Negativas

- **Crescimento desordenado de chaves** — sem uma fonte central, daqui a um ano podemos ter `plus.foo`, `plus.bar`, `plus.bazSettings` espalhados em N hooks. Mitigação: criar `src/storage/keys.ts` exportando constantes quando passarmos de 3 chaves.
- **Sem invalidação coordenada** — se mudarmos o formato de uma chave (ex: `boolean` → `{ open, width }`), valores antigos no `localStorage` viram lixo até o usuário limpar. Mitigação: versionar a chave (`plus.sidebar.v2`) quando a forma mudar de maneira incompatível.
- **Não migra entre dispositivos** — usuário que abre o app em outro computador começa do default. Aceito: o domínio é "preferência local de UI", não "configuração de conta".
- **Quota de `localStorage` (~5 MB)** — irrelevante para UX flags, mas vira problema se alguém persistir listas grandes. Convenção implícita: `localStorage` é para **flags e preferências curtas**, não para cache de dados.
