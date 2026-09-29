# Página Principal — Catálogo de Hinos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Note:** executed inline, in the same session that wrote this plan, per explicit user request ("faça você mesmo em código") — the external "Design in codebase" tool was dropped in favor of building directly here, same pattern as the login page's first slice.

**Goal:** Ship the real "página principal" (catálogo de hinos) — busca, categorias, e lista de hinos filtrada por naipe — replacing the `pages/principal.html` placeholder stub, wired to a corrected Xano endpoint.

**Architecture:** One static HTML page (`pages/principal.html`) styled with `css/catalogo.css` (reusing `css/tokens.css` tokens) and vanilla JS (`js/catalogo.js`) that fetches the full hino list for the logged-in naipe **once** from Xano via `js/api.js`, then does all category-grouping and search-filtering client-side (no extra network round-trips per interaction). The Xano `listar_hinos` endpoint is rewritten first since it currently doesn't return the shape the frontend needs (see Task 1-3).

**Tech Stack:** HTML5, CSS3 (custom properties, no preprocessor), vanilla JavaScript (ES modules), no build step, no framework. Backend: XanoScript, deployed via `xano workspace push`.

**Spec:** `docs/superpowers/specs/2026-09-29-pagina-principal-catalogo-design.md` — sections "Layout", "Dados", "Fora de escopo".

## Global Constraints

- Nenhuma cor nova — tudo vem de `css/tokens.css` (`--bg`, `--surface`, `--text`, `--text-secondary`, `--accent` `#EF6400`, `--accent-dark` `#7B3900`, `--field-bg` `#BF8645`, `--login-gradient`) mais as 5 paradas do próprio gradiente (`#EF6400 #DF7529 #D36517 #9C4100 #833700`) reaproveitadas como cores de categoria.
- Aladin só no título da página e nomes de categoria; Abhaya Libre em tudo funcional, tamanho generoso desde o início (mesmo aprendizado do login — não começar pequeno).
- Sem ícone de biblioteca (Font Awesome/Material) — qualquer ícone novo é SVG inline desenhado à mão, no estilo de `assets/icons/cursor-note.svg` e dos ícones sol/lua já existentes em `index.html`.
- Leitor de PDF/MP3, formulário de admin, e escolha de repositório de arquivo (Drive vs R2) ficam **fora de escopo** — não implementar nada disso aqui.
- Sem framework, sem build step — arquivos rodam abrindo direto ou via servidor estático.

---

### Task 1: Backend — addon `partes_do_hino`

**Files:**
- Create: `backend-xano/addon/partes_do_hino.xs`

**Interfaces:**
- Consumes: nada (é a base).
- Produces: addon chamável como `partes_do_hino` com input `{ hino_id: int }`, retorna lista de partes daquele hino (`id`, `hino_id`, `naipe`, `link_pdf`, `link_mp3`, `created_at`).

- [ ] **Step 1:** Criar o arquivo com:

```xs
addon partes_do_hino {
  input {
    int hino_id
  }

  stack {
    db.query parte {
      where = $db.parte.hino_id == $input.hino_id
      return = {type: "list"}
    }
  }
}
```

- [ ] **Step 2:** Validar sintaxe:

Run: usar a tool `xano_validate_xanoscript` com `file_path = "backend-xano/addon/partes_do_hino.xs"`.
Expected: sem erros.

---

### Task 2: Backend — corrigir o endpoint `listar_hinos`

**Files:**
- Modify: `backend-xano/api/catalogo/listar_hinos_GET.xs` (arquivo inteiro, é pequeno)

**Interfaces:**
- Consumes: addon `partes_do_hino` (Task 1).
- Produces: `GET /listar_hinos?naipe=X&categoria=Y&busca=Z` retornando `{ items: [ { id, hino_id, naipe, link_pdf, link_mp3, hino_titulo, hino_numero_harpa, hino_categoria, todas_partes: [...] } ] }` — um item por parte que bate com `naipe` (e opcionalmente `categoria`/`busca`), enriquecido com os campos do hino via join/eval, mais a lista completa de partes daquele hino (todos os naipes) via addon, pra montar os chips de naipe disponível no card.

- [ ] **Step 1:** Substituir o conteúdo inteiro do arquivo por:

```xs
query listar_hinos verb=GET {
  api_group = "catalogo"

  input {
    text naipe? filters=trim
    text categoria? filters=trim
    text busca? filters=trim
  }

  stack {
    db.query parte {
      join = {
        hino: {
          table: "hino",
          type: "inner",
          where: $db.parte.hino_id == $db.hino.id
        }
      }
      where = $db.parte.naipe ==? $input.naipe && $db.hino.categoria ==? $input.categoria && ($input.busca == null || $db.hino.titulo includes $input.busca || $db.hino.numero_harpa == $input.busca)
      eval = {
        hino_titulo: $db.hino.titulo,
        hino_numero_harpa: $db.hino.numero_harpa,
        hino_categoria: $db.hino.categoria
      }
      addon = [
        { name: "partes_do_hino", input: { hino_id: $output.hino_id }, as: "items.todas_partes" }
      ]
      return = {type: "list"}
    } as $resultado
  }

  response = $resultado
  guid = "x-ec9lDyXZqpfI3PHrVn2UbPuqQ"
}
```

- [ ] **Step 2:** Validar sintaxe:

Run: `xano_validate_xanoscript` com `file_path = "backend-xano/api/catalogo/listar_hinos_GET.xs"`.
Expected: sem erros.

**Nota para quem implementar:** isso assume no máximo uma `parte` por (hino, naipe) — verdade pro nosso modelo de dados atual. Se `naipe` não for enviado e um hino tiver várias partes, ele aparece uma vez por parte (edge case aceitável — o front sempre manda `naipe`, vindo do login).

---

### Task 3: Backend — deploy pro Xano

**Files:** nenhum arquivo novo, só deploy dos Tasks 1-2.

- [ ] **Step 1:** `cd backend-xano && xano workspace pull --workspace 163423` (garantir que não tem mudança feita direto na UI do Xano que seria sobrescrita).
- [ ] **Step 2:** `xano workspace push --workspace 163423` e ler o preview (deve mostrar 1 addon novo + 1 endpoint modificado, nada em tabelas).
- [ ] **Step 3:** `xano workspace push --workspace 163423 --force` (confirmar, sem TTY interativo neste ambiente).
- [ ] **Step 4:** Testar direto: `curl "https://x8ki-letl-twmt.n7.xano.io/api:u6Bs9PZE/listar_hinos?naipe=Violino%201"` e conferir que a resposta tem a forma `{ "items": [...] }` com os campos `hino_titulo`/`hino_categoria`/`todas_partes` (mesmo que vazio, se ainda não tiver dado de teste cadastrado — nesse caso, `{ "items": [] }` já confirma que não quebrou).
- [ ] **Step 5:** `cd backend-xano && git add -A && git commit -m "feat: listar_hinos agora traz dados do hino + todas as partes"`.

---

### Task 4: `js/api.js` — chamada centralizada ao Xano

**Files:**
- Create: `js/api.js`

**Interfaces:**
- Produces: `export async function listarHinos({ naipe, categoria, busca })` → `Promise<Array<{ id, hino_id, naipe, link_pdf, link_mp3, hino_titulo, hino_numero_harpa, hino_categoria, todas_partes }>>` (já desembrulhado de `.items`, lança erro se a resposta não for ok).
- Consumido por: `js/catalogo.js` (Task 8).

- [ ] **Step 1:** Criar o arquivo:

```js
const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:u6Bs9PZE";

export async function listarHinos({ naipe, categoria, busca } = {}) {
  const params = new URLSearchParams();
  if (naipe) params.set("naipe", naipe);
  if (categoria) params.set("categoria", categoria);
  if (busca) params.set("busca", busca);

  const res = await fetch(`${API_BASE}/listar_hinos?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Falha ao buscar hinos (status ${res.status})`);
  }
  const data = await res.json();
  return data.items ?? [];
}
```

---

### Task 5: `js/categorias.js` — lista e cor de cada categoria

**Files:**
- Create: `js/categorias.js`

**Interfaces:**
- Produces: `export const CATEGORIAS` (array ordenada de `{ nome: string, cor: string }`), `export const COR_CATEGORIA_PADRAO` (string, cor de fallback pra categoria não listada).
- Consumido por: `js/catalogo.js` (Task 8).

- [ ] **Step 1:** Criar o arquivo:

```js
// Ordem fixa de exibição das categorias, cada uma com uma cor da própria
// paleta do site (paradas do --login-gradient + accent/accent-dark) — nenhuma
// cor nova. Qualquer `categoria` vinda do banco fora dessa lista usa
// COR_CATEGORIA_PADRAO e aparece depois destas, na ordem em que aparecer.
export const CATEGORIAS = [
  { nome: "Harpa Cristã", cor: "#EF6400" },
  { nome: "Hinos das Irmãs", cor: "#DF7529" },
  { nome: "Hinos dos Jovens", cor: "#D36517" },
  { nome: "Hinos do Coral", cor: "#9C4100" },
  { nome: "Hinos das Crianças", cor: "#BF8645" },
  { nome: "Avulsos", cor: "#7B3900" },
];

export const COR_CATEGORIA_PADRAO = "#833700";
```

---

### Task 6: Compartilhar `.theme-toggle` entre login e catálogo

O botão de tema já existe (visual + lógica de troca de ícone sol/lua) em `css/login.css`, só que com posicionamento absoluto pensado pro painel full-bleed do login. A tela de catálogo usa o mesmo componente visual, mas dentro de uma linha do cabeçalho (fluxo normal, não absoluto) — então a parte visual vai pra `css/base.css` (compartilhada) e só o posicionamento fica em cada CSS de página.

**Files:**
- Modify: `css/base.css` (adicionar)
- Modify: `css/login.css` (remover o que virou duplicado, manter só o posicionamento)

- [ ] **Step 1:** No fim de `css/base.css`, adicionar:

```css
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--field-bg);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url("../assets/icons/cursor-note.svg") 4 20, pointer;
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
  color: var(--accent-dark);
}

.theme-toggle .icon-sun {
  display: none;
}

:root[data-theme="dark"] .theme-toggle .icon-moon {
  display: none;
}

:root[data-theme="dark"] .theme-toggle .icon-sun {
  display: block;
}
```

- [ ] **Step 2:** Em `css/login.css`, substituir o bloco `.theme-toggle { ... }` inteiro (todas as propriedades) por só:

```css
.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}
```

E remover os blocos `.theme-toggle svg`, `.theme-toggle .icon-sun`, `:root[data-theme="dark"] .theme-toggle .icon-moon`, `:root[data-theme="dark"] .theme-toggle .icon-sun` de `login.css` (agora vivem só em `base.css`).

- [ ] **Step 3:** Abrir o login no navegador e confirmar visualmente que o botão de tema continua idêntico a antes (`preview_screenshot` + clicar pra trocar de tema).

---

### Task 7: `pages/principal.html` — markup real do catálogo

**Files:**
- Modify: `pages/principal.html` (substituir o conteúdo inteiro do placeholder)

**Interfaces:**
- Consumido por: `js/catalogo.js` (Task 9) — precisa exatamente destes ids: `theme-toggle`, `usuario-info`, `busca`, `categoria-nav`, `hino-lista`, `carregando`.

- [ ] **Step 1:** Substituir o arquivo inteiro por:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Catálogo de Hinos — OFIP &amp; CVS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Aladin&family=Abhaya+Libre:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/tokens.css" />
  <link rel="stylesheet" href="../css/base.css" />
  <link rel="stylesheet" href="../css/catalogo.css" />
</head>
<body>
  <header class="catalogo-header">
    <div class="catalogo-header-top">
      <img class="catalogo-logo" src="../assets/logo/logo-combinado.png" alt="Coral Vozes de Sião / Orquestra Filarmônica Petrus" />
      <p class="catalogo-usuario" id="usuario-info"></p>
      <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Alternar tema claro/escuro">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>
    </div>
    <div class="catalogo-pauta">
      <div class="pauta-linhas" aria-hidden="true"></div>
      <div class="catalogo-busca">
        <label for="busca" class="sr-only">Buscar por nome ou número da Harpa</label>
        <input type="search" id="busca" placeholder="Buscar por nome ou número da Harpa..." autocomplete="off" />
      </div>
    </div>
  </header>

  <nav class="categoria-nav" id="categoria-nav" aria-label="Categorias de hinos"></nav>

  <main class="hino-lista" id="hino-lista">
    <p class="carregando" id="carregando">Carregando hinos...</p>
  </main>

  <script type="module" src="../js/catalogo.js"></script>
</body>
</html>
```

---

### Task 8: `css/catalogo.css` — estilo do catálogo

**Files:**
- Create: `css/catalogo.css`

- [ ] **Step 1:** Criar o arquivo:

```css
.catalogo-header {
  background: var(--login-gradient);
  padding: 12px 20px 20px;
}

.catalogo-header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.catalogo-logo {
  height: 36px;
  width: auto;
}

.catalogo-usuario {
  flex: 1;
  margin: 0;
  color: var(--surface);
  font-family: "Abhaya Libre", serif;
  font-weight: 500;
  font-size: clamp(14px, 2.2vw, 18px);
}

.catalogo-pauta {
  position: relative;
  height: 44px;
}

.pauta-linhas {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--surface) 0px,
    var(--surface) 1px,
    transparent 1px,
    transparent 11px
  );
  opacity: .4;
}

.catalogo-busca {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

#busca {
  width: min(100%, 480px);
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: none;
  background: var(--surface);
  color: var(--text);
  font-family: "Abhaya Libre", serif;
  font-size: clamp(15px, 3.6vw, 18px);
  cursor: url("../assets/icons/cursor-note.svg") 4 20, text;
}

#busca::placeholder {
  color: var(--text-secondary);
  opacity: .6;
}

.categoria-nav {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  overflow-x: auto;
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 2;
  scrollbar-width: none;
}

.categoria-nav::-webkit-scrollbar {
  display: none;
}

.categoria-chip {
  flex: none;
  padding: 8px 16px 10px;
  border: none;
  border-bottom: 3px solid transparent;
  background: none;
  color: var(--text);
  font-family: "Abhaya Libre", serif;
  font-weight: 500;
  font-size: clamp(14px, 3vw, 16px);
  white-space: nowrap;
  cursor: url("../assets/icons/cursor-note.svg") 4 20, pointer;
}

.categoria-chip.is-ativa {
  border-bottom-color: var(--chip-cor, var(--accent));
  color: var(--chip-cor, var(--accent));
  font-weight: 700;
}

.hino-lista {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 40px;
}

@media (prefers-reduced-motion: no-preference) {
  .hino-lista {
    animation: hino-lista-fade .2s ease;
  }
}

@keyframes hino-lista-fade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.hino-card {
  background: var(--surface);
  border-left: 6px solid var(--spine-cor, var(--accent));
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.hino-card-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  cursor: url("../assets/icons/cursor-note.svg") 4 20, pointer;
}

.hino-titulo {
  font-family: "Abhaya Libre", serif;
  font-weight: 700;
  font-size: clamp(16px, 4vw, 19px);
  color: var(--text);
}

.hino-numero {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--field-bg);
  color: var(--text);
  font-family: "Abhaya Libre", serif;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hino-naipes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.naipe-chip {
  padding: 3px 10px;
  border-radius: 12px;
  background: var(--field-bg);
  color: var(--text);
  font-family: "Abhaya Libre", serif;
  font-size: 13px;
  opacity: .75;
}

.naipe-chip.is-do-usuario {
  background: var(--accent);
  color: #FFFFFF;
  opacity: 1;
  font-weight: 700;
}

.naipe-chip-mais {
  background: transparent;
  opacity: .6;
}

.hino-detalhes {
  display: none;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--field-bg);
}

.hino-detalhes:not([hidden]) {
  display: flex;
}

.hino-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-dark);
  font-family: "Abhaya Libre", serif;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  cursor: url("../assets/icons/cursor-note.svg") 4 20, pointer;
}

.hino-vazio,
.carregando {
  text-align: center;
  color: var(--text-secondary);
  font-family: "Abhaya Libre", serif;
  font-size: 15px;
  padding: 40px 20px;
}

@media (min-width: 768px) {
  .catalogo-header-top,
  .catalogo-pauta,
  .categoria-nav {
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }

  .categoria-nav {
    justify-content: center;
    overflow-x: visible;
    flex-wrap: wrap;
  }
}
```

---

### Task 9: `js/catalogo.js` — lógica da página

**Files:**
- Create: `js/catalogo.js`

**Interfaces:**
- Consome: `listarHinos` de `js/api.js` (Task 4), `CATEGORIAS`/`COR_CATEGORIA_PADRAO` de `js/categorias.js` (Task 5).
- Consome do `localStorage`: `ofipCvsUsuario` (`{nome, departamento, naipe}`, escrito pelo login), `ofipCvsTema` (mesma chave usada em `js/login.js`).

- [ ] **Step 1:** Criar o arquivo:

```js
import { listarHinos } from "./api.js";
import { CATEGORIAS, COR_CATEGORIA_PADRAO } from "./categorias.js";

const USER_KEY = "ofipCvsUsuario";
const THEME_KEY = "ofipCvsTema";

function getUsuario() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.dataset.theme = saved;
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const atual = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = atual;
    localStorage.setItem(THEME_KEY, atual);
  });
}

function corDaCategoria(nome) {
  const encontrada = CATEGORIAS.find((c) => c.nome === nome);
  return encontrada ? encontrada.cor : COR_CATEGORIA_PADRAO;
}

function agruparPorCategoria(hinos) {
  const grupos = new Map();
  for (const cat of CATEGORIAS) grupos.set(cat.nome, []);
  for (const hino of hinos) {
    const nome = hino.hino_categoria;
    if (!grupos.has(nome)) grupos.set(nome, []);
    grupos.get(nome).push(hino);
  }
  return grupos;
}

function svgNota() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="18" r="3"/><path d="M9 18V4l10-2v14"/><circle cx="16" cy="16" r="3"/></svg>';
}

function renderNaipeChips(hino, naipeDoUsuario) {
  const todas = [...(hino.todas_partes ?? [])].sort((a, b) => {
    if (a.naipe === naipeDoUsuario) return -1;
    if (b.naipe === naipeDoUsuario) return 1;
    return 0;
  });
  const visiveis = todas.slice(0, 3);
  const resto = todas.length - visiveis.length;
  const chips = visiveis
    .map((p) => {
      const destaque = p.naipe === naipeDoUsuario ? " is-do-usuario" : "";
      return `<span class="naipe-chip${destaque}">${p.naipe}</span>`;
    })
    .join("");
  const mais = resto > 0 ? `<span class="naipe-chip naipe-chip-mais">+${resto}</span>` : "";
  return chips + mais;
}

function renderCard(hino, naipeDoUsuario) {
  const cor = corDaCategoria(hino.hino_categoria);
  const article = document.createElement("article");
  article.className = "hino-card";
  article.style.setProperty("--spine-cor", cor);

  article.innerHTML = `
    <button type="button" class="hino-card-toggle" aria-expanded="false">
      <span class="hino-titulo">${hino.hino_titulo}</span>
      ${hino.hino_numero_harpa ? `<span class="hino-numero">${hino.hino_numero_harpa}</span>` : ""}
    </button>
    <div class="hino-naipes">${renderNaipeChips(hino, naipeDoUsuario)}</div>
    <div class="hino-detalhes" hidden>
      ${hino.link_pdf ? `<a class="hino-link" href="${hino.link_pdf}" target="_blank" rel="noopener">Baixar PDF</a>` : ""}
      ${hino.link_mp3 ? `<a class="hino-link hino-link-audio" href="${hino.link_mp3}" target="_blank" rel="noopener">${svgNota()} Ouvir referência</a>` : ""}
    </div>
  `;

  const toggle = article.querySelector(".hino-card-toggle");
  const detalhes = article.querySelector(".hino-detalhes");
  toggle.addEventListener("click", () => {
    const aberto = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!aberto));
    detalhes.hidden = aberto;
  });

  return article;
}

function renderCategoriaNav(categoriasComHinos, categoriaAtiva, onSelecionar) {
  const nav = document.getElementById("categoria-nav");
  nav.innerHTML = "";
  for (const nome of categoriasComHinos) {
    const cor = corDaCategoria(nome);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "categoria-chip" + (nome === categoriaAtiva ? " is-ativa" : "");
    btn.textContent = nome;
    btn.style.setProperty("--chip-cor", cor);
    btn.addEventListener("click", () => onSelecionar(nome));
    nav.appendChild(btn);
  }
}

function renderLista(hinos, naipeDoUsuario, categoriaAtiva) {
  const lista = document.getElementById("hino-lista");
  lista.innerHTML = "";
  if (hinos.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "hino-vazio";
    vazio.textContent = categoriaAtiva
      ? `Ainda não tem partitura de ${naipeDoUsuario} em "${categoriaAtiva}".`
      : `Ainda não tem partitura de ${naipeDoUsuario} cadastrada.`;
    lista.appendChild(vazio);
    return;
  }
  for (const hino of hinos) {
    lista.appendChild(renderCard(hino, naipeDoUsuario));
  }
}

async function init() {
  const usuario = getUsuario();
  if (!usuario) {
    window.location.href = "../index.html";
    return;
  }

  initTheme();
  document.getElementById("usuario-info").textContent = `${usuario.nome} — ${usuario.naipe}`;

  const carregando = document.getElementById("carregando");
  let todosOsHinos = [];
  try {
    todosOsHinos = await listarHinos({ naipe: usuario.naipe });
  } catch (erro) {
    carregando.textContent = "Não deu pra carregar os hinos agora. Tenta recarregar a página.";
    return;
  }
  carregando.remove();

  const grupos = agruparPorCategoria(todosOsHinos);
  const categoriasComHinos = [...grupos.keys()].filter((nome) => grupos.get(nome).length > 0);

  let categoriaAtiva = categoriasComHinos[0] ?? null;

  function atualizar() {
    renderCategoriaNav(categoriasComHinos, categoriaAtiva, (nome) => {
      categoriaAtiva = nome;
      atualizar();
    });
    const termoBusca = document.getElementById("busca").value.trim().toLowerCase();
    const hinosDaCategoria = categoriaAtiva ? grupos.get(categoriaAtiva) ?? [] : [];
    const filtrados = termoBusca
      ? hinosDaCategoria.filter(
          (h) =>
            h.hino_titulo.toLowerCase().includes(termoBusca) ||
            String(h.hino_numero_harpa ?? "").includes(termoBusca)
        )
      : hinosDaCategoria;
    renderLista(filtrados, usuario.naipe, categoriaAtiva);
  }

  document.getElementById("busca").addEventListener("input", atualizar);
  atualizar();
}

init();
```

---

### Task 10: Verificar no navegador

- [ ] **Step 1:** Servir a pasta (`preview_start` com a config já existente `static-site`) e abrir `pages/principal.html` **sem** ter feito login antes (limpar `localStorage`) — confirmar que redireciona pra `index.html`.
- [ ] **Step 2:** Fazer login de verdade pelo `index.html` (nome + naipe existente no banco de teste, ou qualquer naipe se o banco ainda estiver vazio) e confirmar que cai em `pages/principal.html` mostrando "Carregando hinos..." e depois a lista (ou a mensagem vazia, se não tiver dado de teste ainda).
- [ ] **Step 3:** `preview_snapshot` pra conferir que "{nome} — {naipe}" aparece certo no cabeçalho.
- [ ] **Step 4:** Clicar numa categoria diferente (`preview_click`) e confirmar que a lista troca sem recarregar a página.
- [ ] **Step 5:** Digitar no campo de busca (`preview_fill`) um termo que bate com um hino de teste e confirmar que a lista filtra.
- [ ] **Step 6:** Clicar no título de um card (`preview_click`) e confirmar que expande mostrando os links de PDF/MP3.
- [ ] **Step 7:** `preview_resize` pra mobile (390×844), tablet (834×1194) e desktop (1440×900) e `preview_screenshot` os três.
- [ ] **Step 8:** Alternar tema escuro (`#theme-toggle`) e confirmar que o cabeçalho/cards/chips recolorem corretamente, sem texto ilegível.
- [ ] **Step 9:** Commitar: `git add -A && git commit -m "feat: página principal — catálogo de hinos com busca e categorias"`.

];

export const COR_CATEGORIA_PADRAO = "#833700";
