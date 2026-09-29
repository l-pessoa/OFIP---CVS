# Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Note:** this first slice was executed inline, in the same session that wrote this plan, per explicit user request to have something working today (2026-09-28). Kept here as the project's first plan record and as reference for whoever picks up the next slice.

**Goal:** Ship a working static Login page (nome, departamento, naipe/instrumento) matching the approved Figma direction and the site's design tokens — the first real page of the OFIP & CVS site.

**Architecture:** One static HTML page (`index.html`) styled with CSS custom-property tokens (light/dark) and vanilla JS that populates the third `<select>` based on the department choice, saves the identity to `localStorage`, and hands off to a minimal placeholder "página principal" stub so the flow is demoable end to end.

**Tech Stack:** HTML5, CSS3 (custom properties, no preprocessor), vanilla JavaScript (ES modules), no build step, no framework, no backend call yet (Xano wiring comes with the "página principal" plan).

**Spec:** https://claude.ai/code/artifact/c055fa7c-9eec-402e-9163-077a0faaa32b — sections "Login" and "Temas: claro e escuro".

## Global Constraints

- Light theme is the default; dark is opt-in via a toggle, persisted in `localStorage`.
- Colors come only from `css/tokens.css` custom properties — no raw hex in page-specific CSS.
- Naipe/instrumento list lives in one place (`js/naipes.js`) so it's easy to edit without touching markup or logic, per the "semi-static, code-managed" decision in the spec.
- No framework, no build step — files must run by opening `index.html` directly or via a static file server.

---

### Task 1: Design tokens

**Files:**
- Create: `css/tokens.css`

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--surface`, `--text`, `--text-secondary`, `--accent`, `--field-bg` on `:root` (light) and overridden under `:root[data-theme="dark"]` and `@media (prefers-color-scheme: dark)`.

- [x] **Step 1:** Write `css/tokens.css` with the light values (`--bg:#FDFBF7`, `--surface:#FFFFFF`, `--text:#3B2415`, `--text-secondary:#7A4420`, `--accent:#C96A1E`, `--field-bg:#E8C9A0`) as `:root` defaults, and the dark values (`--bg:#211309`, `--surface:#34210F`, `--text:#F1E4D2`, `--text-secondary:#C9A67C`, `--accent:#E08A42`, `--field-bg:#3B2415`) under both `:root[data-theme="dark"]` and a `prefers-color-scheme: dark` media query (so it also respects system theme before the user picks one explicitly).
- [x] **Step 2:** Open the file in the browser preview once `index.html` exists (Task 4) and confirm both themes render with the right colors via `preview_inspect`.

---

### Task 2: Base styles

**Files:**
- Create: `css/base.css`

- [x] **Step 1:** Write a small reset (`box-sizing: border-box` on everything, margin/padding reset on `body`/`h1`/`p`), a body font stack (`Georgia, "Times New Roman", serif` — matches the Figma direction already validated), `min-height: 100dvh` on body (not `100vh`, avoids the mobile viewport bug), and a `.container` utility that centers content with a `max-width`.

---

### Task 3: Naipe/instrumento data

**Files:**
- Create: `js/naipes.js`

**Interfaces:**
- Produces: `export const NAIPES = { orquestra: string[], coral: string[] }`, consumed by `js/login.js` (Task 6).

- [x] **Step 1:** Write the two arrays from what's been named in conversation so far (Violino 1/2/3, Viola, Violoncelo, Contrabaixo, Flauta, Clarinete, Trompete, Trombone, Trompa, Percussão for orquestra; Soprano, Contralto, Tenor, Baixo for coral), with a top-of-file comment flagging this is a best-guess list that needs the maestro's confirmation before going live.

---

### Task 4: Login markup

**Files:**
- Create: `index.html`

- [x] **Step 1:** Write the HTML skeleton: `<head>` linking `css/tokens.css`, `css/base.css`, `css/login.css`; `<body>` with a theme-toggle button, the illustrated panel, the logo placeholder, "Bem-vindo" / "Faça seu login" headings, and a `<form id="login-form">` with: `#nome` (text input), `#departamento` (select: Orquestra / Coral), `#naipe` (select, starts disabled with placeholder "Selecione o departamento primeiro"), and a submit button. Script tag: `<script type="module" src="js/login.js"></script>`.

---

### Task 5: Login styling

**Files:**
- Create: `css/login.css`

- [x] **Step 1:** Style the illustrated panel as a full-bleed diagonal gradient (`var(--accent)` to a darker brown) behind a large rounded white/`var(--surface)` card (approximates the organic wavy shape from Figma — swap for the real traced SVG shape once exported from Figma, noted in the README as a follow-up). Style the three form fields using `var(--field-bg)` for the background and `var(--text)` for filled values (placeholder text uses `var(--text-secondary)` at reduced opacity) — this is the contrast fix agreed on earlier in the conversation. Add a `@media (max-width: 480px)` pass so the card goes full-width with safe padding on phones.

---

### Task 6: Login interactivity

**Files:**
- Create: `js/login.js`
- Modify: none (first version)

**Interfaces:**
- Consumes: `NAIPES` from `js/naipes.js`.
- Produces: writes `localStorage["ofipCvsUsuario"] = JSON.stringify({nome, departamento, naipe})` on submit, then navigates to `pages/principal.html`.

- [x] **Step 1:** On `#departamento` change, enable `#naipe`, clear its options, and repopulate from `NAIPES.orquestra` or `NAIPES.coral`.
- [x] **Step 2:** On form submit, prevent default, validate all three fields are filled (inline error text under whichever field is empty, not a browser `alert`), save to `localStorage`, and navigate to `pages/principal.html`.
- [x] **Step 3:** Wire the theme-toggle button: read/write `localStorage["ofipCvsTema"]`, set `document.documentElement.dataset.theme` on load and on click.

---

### Task 7: Placeholder handoff page

**Files:**
- Create: `pages/principal.html`

- [x] **Step 1:** Minimal stub that reads `localStorage["ofipCvsUsuario"]` and prints "Bem-vindo, {nome} — {naipe} ({departamento})", or redirects back to `index.html` if nothing is stored yet. Marked clearly as a placeholder — the real página principal is its own future plan (tabs, busca, lista, Xano integration).

---

### Task 8: Verify in the browser

- [x] **Step 1:** Serve the folder (`preview_start` with a static server config) and load `index.html`.
- [x] **Step 2:** `preview_snapshot` to confirm the three fields and labels read correctly; `preview_click`/`preview_fill` to pick "Orquestra" and confirm naipe options change to instruments, then "Coral" and confirm they change to vozes.
- [x] **Step 3:** Submit the form and confirm it lands on `pages/principal.html` with the right name/naipe echoed back.
- [x] **Step 4:** Toggle dark mode and `preview_inspect` the filled field text color to confirm it still passes contrast.
- [x] **Step 5:** `preview_resize` to mobile (375×812) and tablet (768×1024) and screenshot both.
