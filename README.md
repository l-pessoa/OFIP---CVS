# OFIP & CVS — site da Orquestra Filarmônica Petrus e Coral Vozes de Sião

Catálogo de partituras (PDF) e áudios (MP3) para os músicos e cantores, organizado por naipe/instrumento.

- **Spec de design completo:** https://claude.ai/code/artifact/c055fa7c-9eec-402e-9163-077a0faaa32b
- **Frontend:** HTML, CSS e JavaScript puros — sem framework, sem build step.
- **Backend:** [Xano](https://xano.com) — banco de dados + API. Ainda não conectado nesta primeira fatia (só a página de login).

## Estrutura

```
index.html          → página de login (primeira fatia, pronta)
pages/               → demais páginas (principal, leitor, admin — a construir)
css/
  tokens.css         → cores claro/escuro, única fonte de verdade de paleta
  base.css           → reset + estilos globais
  login.css          → estilos específicos do login
js/
  naipes.js          → lista de instrumentos/vozes (edite aqui se a lista mudar)
  login.js           → lógica da tela de login
  api.js             → (a criar) toda chamada ao Xano centralizada aqui — ver nota abaixo
assets/
  login-bg/          → desktop.png, tablet.png, mobile.png — exports do Figma que foram usados só pra EXTRAIR as cores/contorno (ver seção abaixo). Não são mais carregados pelo site.
  logo/              → logo-combinado.png (real, usada no login)
  patterns/          → instrumentos-fundo.png (real, usado no fundo do login)
  icons/             → cursor-note.svg
docs/superpowers/plans/ → planos de implementação, um arquivo por fatia do projeto
```

## Pra rodar localmente

Não precisa de instalação. Qualquer servidor estático serve, por exemplo:

```bash
python3 -m http.server 8000
```

e abrir `http://localhost:8000`.

## Decisões que facilitam um futuro app

Como o maestro pediu originalmente um aplicativo (Android/iOS), algumas escolhas de agora foram feitas pensando em facilitar essa migração depois:

- **Toda chamada ao Xano vai ficar num único arquivo (`js/api.js`, ainda a criar)** — as funções desse arquivo (ex: `listarHinos(naipe, categoria, busca)`) documentam exatamente que dado o app vai precisar buscar. Ao portar pra um app nativo, só a parte visual muda; a "forma dos dados" já está definida aqui.
- **Cores só existem como variáveis CSS (`css/tokens.css`)** — isso mapeia quase 1:1 pra um tema de app (React Native, SwiftUI etc.), então a paleta não precisa ser redescoberta depois.
- **Lista de naipes isolada em `js/naipes.js`** — não está espalhada pelo HTML, então dá pra reaproveitar esse arquivo inteiro num app sem reescrever.

## O login é 100% código agora, sem PNG de fundo (2026-09-28)

Passamos por três versões até chegar aqui:
1. Recriar tudo à mão em CSS (gradiente, blob, padrão) — nunca bateu exatamente.
2. Usar as imagens exportadas do Figma como fundo, com os campos reais por cima — ficou pixel-perfect, mas criou um problema novo: pra não distorcer a imagem, o container precisava manter a proporção exata dela (`aspect-ratio`), o que deixava sobra de espaço (com fundo degradê, mas ainda perceptível) sempre que a tela da pessoa não tinha exatamente aquela proporção.
3. **A solução final:** a única parte que o CSS não conseguia replicar de verdade era o contorno orgânico do "blob" branco — cor, degradê e padrão eu já tinha exatos. Então usei um script (Python + OpenCV) pra **extrair o contorno exato do blob branco de cada imagem exportada** (detecção de contorno, não foi no olho) e transformei isso num `clip-path: polygon(...)` — ou seja, o formato orgânico agora é 100% CSS, só que com a forma real do Figma, não uma aproximação com `border-radius`.

Com isso, o fundo (`.login-panel`) é sempre `100% x 100dvh` — nunca trava numa proporção fixa, nunca sobra espaço, nunca corta nada, em nenhuma tela ou orientação, porque não existe mais imagem nenhuma pra distorcer ou cortar. As imagens em `assets/login-bg/` ficaram só como material de referência (de onde tirei cores/contorno/posições) — o site não carrega mais elas.

Detalhes técnicos:
- `.login-blob` é um `<div>` com `background: var(--surface)` e o `clip-path` extraído, um por breakpoint.
- Logo, título, subtítulo, campos e botão são elementos reais posicionados em `%` (mesma técnica de antes, agora relativa à tela inteira em vez de a uma imagem).
- **Orientação decide o layout, não só a largura:** retrato usa o blob de mobile/tablet; **qualquer tela em paisagem (celular ou tablet deitado) usa o blob "desktop"**, porque é o formato que já nasce largo — assim nunca fica esmagado/cortado ao deitar a tela.
- Dark mode agora também poderia, em teoria, recolorir o fundo do login (já que não é mais uma imagem fixa) — ainda não fiz isso, mas é bem mais simples de adicionar agora se vocês quiserem.

## Título "Bem-vindos" é texto real, não imagem (2026-09-29)

O maestro/Lucas mandou uma arte pronta do título ("BEM-VINDOS" com o "I" trocado por uma nota musical), mas ela nunca foi encontrada salva em disco pra usar como `<img>`. Em vez de depender do arquivo, o título virou HTML real:

```html
<span aria-hidden="true">Bem-v<span class="note-i">♪</span>ndos</span>
<span class="sr-only">Bem-vindos</span>
```

com `text-transform: uppercase` no CSS pra bater visualmente com a arte original. Isso resolveu de graça um problema que a imagem teria: texto real usa `color: var(--text)`, que já é claro no dark mode — nenhuma versão alternativa da imagem ou fundo tipo "nuvem" foi necessária.

**Tamanho do título:** medido pixel a pixel nas 3 imagens de referência (`assets/login-bg/*.png`) — em todas elas o título renderizado tem a mesma largura do campo "Nome" (não é coincidência, é assim que o design foi feito). Os `font-size` em `vw` de cada breakpoint foram calibrados no navegador (via bounding box real do texto) pra bater exatamente com a largura do `.field-nome` daquele breakpoint — é o critério a seguir se o texto do título mudar de novo.

## Fundo do logo no mobile: um segundo "blob" (2026-09-29)

Só no mobile, o Figma tem o logo sentado em cima de uma forma branca própria (uma faixa ondulada no topo da tela), separada do card branco principal — no tablet/desktop o logo já fica dentro do card, sem precisar de nada extra. Extraído com a mesma técnica de contorno (OpenCV, thresholding de branco + `findContours` + amostragem de ~140 pontos) direto de `assets/login-bg/mobile.png`, virou um novo elemento `.logo-blob` com seu próprio `clip-path`, escondido via `display:none` nos breakpoints de tablet/desktop.

## Padrão de instrumentos no fundo, opacidade controlada (2026-09-29)

Voltou como uma camada própria (`.login-panel::before`, `background-image` + `opacity: .55`), separada do `background` do `.login-panel` — o shorthand de múltiplos backgrounds não tem opacidade por camada, então isolar num pseudo-elemento foi a forma de controlar isso sem afetar o degradê por baixo. Ele pinta antes do `.login-blob`/`.logo-blob` no DOM, então só aparece na área laranja, nunca por cima do card branco.

## Pendências conhecidas

- Lista de naipes em `js/naipes.js` é um palpite baseado na conversa — precisa ser confirmada com o Aldo.
- O botão "Entrar" não aparecia nos frames exportados do Figma (ficava fora da área visível), então posicionei por conta própria logo abaixo do terceiro campo — vale confirmar se bate com a intenção visual do Aldo/Lucas.
- O contorno do blob usa ~220 pontos por tela (amostrados do contorno real via OpenCV, não os ~20 da primeira tentativa) — com essa densidade as bordas já ficam lisas, sem cantos quadrados visíveis.
- Se o texto/layout do Figma mudar no futuro, as porcentagens em `login.css` precisam ser re-extraídas com o mesmo processo (script em `docs/superpowers/plans/` ainda a documentar).
- As caixas de campo no desktop foram estreitadas (47.21% → 42% de largura) e ganharam mais altura (5% → 6.5%) por pedido explícito — ficam um pouco mais estreitas que a medida exata do Figma (que é mais parecida com a largura do título, ~48%), decisão deliberada pra não ficarem "esticadas".

## Sem emoji, com cursor customizado

- O toggle de tema usa SVGs inline (sol/lua) em vez de 🌙/☀ — nenhum ícone por emoji no projeto.
- `assets/icons/cursor-note.svg` (uma notinha musical) substitui o cursor padrão do mouse na página de login.
