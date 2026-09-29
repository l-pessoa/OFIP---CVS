# Página Principal — Catálogo de Hinos (Design Spec)

**Status:** aprovado pelo usuário em chat (direção visual + pesquisa), aguardando revisão deste documento.
**Escopo desta spec:** só a tela de catálogo (busca + categorias + lista de hinos). O leitor de PDF/MP3 (abrir, swipe, zoom, fullscreen, visão de duas páginas) e a tela de admin/"Adicionar novo" são **fora de escopo** — cada um vira sua própria rodada de brainstorming depois que o catálogo estiver pronto.

## Contexto

Depois do login (pronto), o usuário cai nessa tela com `nome`/`departamento`/`naipe` já salvos em `localStorage["ofipCvsUsuario"]`. A tela mostra os hinos disponíveis pro naipe dele, agrupados por categoria, com busca por título/número da Harpa. Não existe Figma pra essa tela — direção visual proposta do zero pelo Claude, aprovada pelo usuário (Lucas), com Vini fora do projeto (é só Lucas + Claude daqui em diante, inclusive pra backend).

## Por que essa direção (não a "genérica")

O caminho óbvio seria busca no topo + dropdown de filtro + grid de cards com sombra — o "template de catálogo" que não conversa com o resto do site (blob orgânico, Aladin cursiva, padrão de instrumentos à mão do login). Pesquisei 15 referências reais antes de fechar a direção (ver seção "Referências" no fim) — apps de hinário digital, forScore, IMSLP, Hymnary.org, PraiseCharts, Libby, e sites de design premiados — pra fundamentar cada escolha em vez de usar o default de IA.

## Conceito visual

**A pauta como estrutura** (as 5 linhas de um pentagrama), não a capa de um livro. O login é dominado pelo laranja/gradiente com um cartão branco; aqui a proporção **inverte**: fundo predominantemente branco/creme (melhor leitura de lista longa, público inclui pessoas mais velhas — pedido explícito do usuário: "vão ter senhores de idade que irão ler"), e o laranja/marrom vira **acento estrutural** (cabeçalho, sublinhado ativo, lombada colorida do card) em vez de fundo dominante. Isso deixa claro "mesma família visual, tela diferente" sem repetir a técnica do blob.

## Paleta e tipografia (reaproveitadas de `css/tokens.css`)

Nenhuma cor nova. Mesmos tokens do login:
- `--login-gradient` (`#EF6400→#833700`) usado só na faixa do cabeçalho, não no fundo inteiro.
- `--surface` (`#FFFFFF`) como fundo dominante da área de conteúdo.
- `--accent` (`#7B3900`) / `--accent-dark` (`#BF8645`) como acento (lombada do card, sublinhado ativo, ícones).
- `--text` / `--field-bg` como já definidos.
- Aladin (cursiva) só no título da página e nomes de categoria — uso comedido, igual ao login.
- Abhaya Libre em tudo funcional (busca, nome do hino, número) — tamanho generoso desde o início (`clamp` com piso alto, não vou repetir o erro de começar pequeno e ter que aumentar depois, como aconteceu no login).

## Layout

### Cabeçalho (comum a todos os breakpoints)
- Faixa com o gradiente do login (`var(--login-gradient)`), altura fixa pequena (não a tela toda como no login).
- Logo pequena à esquerda, "{nome} — {naipe}" (lido do `localStorage`) à direita, toggle de tema reaproveitado do login (`#theme-toggle`, mesmo componente/JS).
- Uma pauta de 5 linhas finas (`--accent-dark`, baixa opacidade) atravessa a faixa; o campo de busca fica desenhado sobre essa pauta, centralizado, com o placeholder "Buscar por nome ou número da Harpa...".

### Navegação de categoria
- Chips horizontais (não abas saindo da lateral): um por categoria, na ordem fixa **Harpa Cristã, Hinos das Irmãs, Hinos dos Jovens, Hinos do Coral, Hinos das Crianças, Avulsos**. Qualquer `categoria` que vier do banco fora dessa lista (não deveria acontecer, mas o campo é texto livre no schema) vira uma seção extra no fim, na ordem em que aparecer.
- Chip ativo ganha sublinhado curto no estilo "trecho de pauta" (reforça o motivo gráfico sem reusar o clip-path do blob).
- **Mobile/retrato:** chips em faixa horizontal com scroll, sticky abaixo do cabeçalho ao rolar.
- **Tablet/desktop:** mesma faixa horizontal (decidido não usar sidebar vertical — simplicidade, e evita reintroduzir a ideia de "índice lateral" que foi descartada).

### Lista de hinos (dentro da categoria ativa)
- Lista vertical de cards (não grid — nomes de hino variam muito de tamanho, e é mais fácil de ler em lista pra qualquer idade, confirmado pela pesquisa de apps de hinário: "large, readable text... intuitive navigation").
- Cada **card**:
  - Lombada colorida na borda esquerda (`--accent`), única por categoria (mesma cor do chip daquela categoria).
  - Título do hino (Abhaya Libre, bold) + selo circular com o número da Harpa (quando existir — `numero_harpa` é opcional no schema).
  - Linha de **chips de naipe disponível**: mostra em quais naipes esse hino tem parte cadastrada (ex: "Violino 1", "Violino 2", "Coral"), destacando o naipe do usuário logado se ele tiver parte disponível. Se houver mais de 4 chips, mostra os 3 primeiros + "+N" (padrão inspirado no PraiseCharts).
  - Ícone de nota (SVG desenhado à mão, não ícone de biblioteca) se aquele hino tiver `link_mp3` pro naipe do usuário.
  - Todo o card é clicável: expande inline (accordion, sem navegar pra outra página) mostrando os links diretos — "Baixar PDF" / "Ouvir referência" (MP3, se existir) — pra parte do naipe do usuário. Esse accordion é só um estado provisório; vira o botão "Abrir no leitor" quando o leitor for especificado e construído.

### Estado vazio
- Se a categoria ativa não tiver nenhum hino pro naipe do usuário: mensagem no tom da interface (não genérica tipo "Nenhum resultado") — algo como "Ainda não tem partitura de {naipe} nessa categoria." Texto exato a refinar na implementação.

## Dados — o que existe e o que precisa mudar no backend

Conferi o schema real no Xano (`backend-xano/table/hino.xs`, `parte.xs`, `backend-xano/api/catalogo/listar_hinos_GET.xs`) em vez de supor:

**Schema atual (sem mudança necessária):**
```
hino: { id, titulo, numero_harpa?, categoria (text livre), created_at }
parte: { id, hino_id -> hino, naipe (text), link_pdf?, link_mp3?, created_at }
```

**Gap encontrado no endpoint `listar_hinos`:** ele recebe `naipe`, `categoria` e `busca` como input, mas a stack **só consulta a tabela `parte` filtrada por naipe** e devolve uma lista plana de partes — `categoria` e `busca` não são usados, e a resposta não traz `titulo`/`numero_harpa`/`categoria` do hino junto. Isso não serve pro catálogo como especificado aqui.

**Contrato alvo (a implementar antes/junto com o frontend, já que agora sou eu que cuido disso, não o Vini):**
```
GET /listar_hinos?naipe=X&categoria=Y&busca=Z
→ [
    {
      id, titulo, numero_harpa, categoria,
      partes: [ { id, naipe, link_pdf, link_mp3 }, ... ]  // todas as partes do hino, não só a do naipe filtrado — o front precisa saber quais outros naipes existem pra montar os chips
    },
    ...
  ]
```
- `naipe` filtra **quais hinos aparecem** (só hinos que têm pelo menos uma parte pro naipe do usuário) — mas o array `partes` de cada hino retorna **todas** as partes daquele hino (pra montar os chips de "disponível em: ..."), não só a do naipe filtrado.
- `categoria` filtra por igualdade exata quando enviado.
- `busca` filtra `titulo` (contains, case-insensitive) OU `numero_harpa` (igualdade, se a busca for numérica).
- Reimplementação fica com `db.query hino` com um `addon` pra trazer as partes relacionadas (ou duas queries + join em memória) — decisão de implementação, não trava a spec do front.

## Interações e movimento

Restrito, não decorativo — pesquisa (Awwwards) mostra sites de showcase com bastante animação, mas isso é pra portfólio, não pra utilitário usado por gente de 12 a 60+ anos. Vou usar: fade+leve slide ao trocar de categoria (conteúdo antigo sai, novo entra, ~200ms), sem scroll-jacking, sem parallax, sem hover states que dependam de mouse (o público majoritário é touch/tablet).

## Fora de escopo (confirmado com o usuário)

- Leitor de PDF/MP3 (abrir, swipe, zoom, fullscreen, duas páginas em paisagem).
- Tela/formulário de "Adicionar novo" hino (admin: Aldo, Bruno Nascimento, Vinicius). Aqui só reservo visualmente um botão flutuante (estilo marcador/ribbon) pros 3 admins, sem construir o formulário.
- Repositório definitivo de PDF/MP3 (Google Drive vs Cloudflare R2) — decisão adiada pelo usuário para depois; os campos `link_pdf`/`link_mp3` já existem no schema como texto simples (URL), então a UI não depende de qual serviço for escolhido.

## Referências pesquisadas

- [forScore | Design](https://forscore.co/about-design/) — interface limpa, hierarquia clara, texto dinâmico.
- [11 Best Hymnal Apps for Android & iOS](https://freeappsforme.com/hymnal-apps/) — busca-primeiro, texto grande, qualquer idade.
- [21 Best Library Website Design Inspiration 2026 — Colorlib](https://colorlib.com/wp/library-website-design/) — busca como elemento central.
- [IMSLP](https://imslp.org/wiki/Main_Page) — contagem de arquivos/partes por obra direto na listagem.
- [Hymnary.org](https://hymnary.org) — modelo de dados Texto/Melodia/Instância (valida o modelo Hino/Parte já existente).
- [PraiseCharts](https://www.praisecharts.com) — padrão "+N mais" pra variantes de instrumento.
- [OnSong](https://m.onsongapp.com/docs/features/) / [SongSelect](https://songselect.ccli.com/) — recursos de transposição/setlist avaliados e descartados (fora do nosso escopo, PDFs/MP3 estáticos).
- [Libby (OverDrive)](https://www.overdrive.com/apps/libby) — "quente, pessoal, acessível pra qualquer idade", descoberta por curadoria (categorias) além de busca.
- [Awwwards — Music & Sound](https://www.awwwards.com/websites/music-sound/) — referência de animação avaliada e conscientemente não adotada (showcase ≠ utilitário).
- [Musicnotes.com](https://www.musicnotes.com/) — filtros por instrumento/dificuldade avaliados e simplificados pro nosso caso (YAGNI).
