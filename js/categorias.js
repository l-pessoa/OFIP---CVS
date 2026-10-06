// Ordem fixa de exibição das categorias reais do hinário, cada uma com:
// - cor: a cor de destaque (lombada do card, chip ativo). Harpa, Coral
//   Vozes de Sião e Outros ficam dentro da paleta de marrom/laranja
//   original (pedido do Lucas pra não fugir muito da cor da marca); as
//   outras 5 têm tons próprios.
// - corCena: a base do gradiente escuro da cena personalizada que
//   substitui o cabeçalho inteiro (cor + sem moldura, full-bleed) quando
//   a categoria tá selecionada — ícone grande, nome em Aladin, silhueta
//   decorativa embaixo. Todas as categorias têm. Pra tirar a cena de uma
//   categoria específica é só apagar essa propriedade dela.
// - silhueta: opcional, SVG da linha decorativa no rodapé da cena. Se
//   ausente, usa a silhueta de montanhas genérica (ver SILHUETA_PADRAO).
// - motivo: um SVG decorativo pequeno, desenhado à mão (mesmo estilo dos
//   ícones sol/lua e do cursor-note.svg — traço fino, sem preenchimento
//   sólido), usado no canto do card e, ampliado, dentro da cena.
//
// Os nomes entre parênteses no pedido original (irmãs, coral, adolescentes,
// jovens, crianças) são só identificação de público — não aparecem na UI,
// o nome de exibição é sempre o nome real da categoria.

// As silhuetas usam um viewBox LARGO (200x24, não 24x24) porque elas
// esticam pra cobrir a largura inteira da cena (preserveAspectRatio=none
// no catalogo.js) — desenhar num quadrado e esticar pra uma faixa larga
// deixava o traço bem distorcido/quebrado. Com o padrão repetindo dentro
// de um viewBox já largo, a distorção fica mínima.
const SILHUETA_MONTANHAS = `<path d="M0,22 L11,5 L23,22 L37,9 L52,22 L66,3 L80,22 L90,9 L102,22 L116,5 L127,22 L142,9 L156,22 L172,9 L185,22 L200,5 L200,22" vector-effect="non-scaling-stroke"/>`;
const SILHUETA_PILARES = `<path d="M0,22V11L7,6L14,11V22 M26,22V11L33,6L40,11V22 M52,22V11L59,6L66,11V22 M78,22V11L85,6L92,11V22 M104,22V11L111,6L118,11V22 M130,22V11L137,6L144,11V22 M156,22V11L163,6L170,11V22 M182,22V11L189,6L196,11V22" vector-effect="non-scaling-stroke"/>`;
const SILHUETA_ONDA = `<path d="M0,14 Q6,6 12,14 Q18,20 24,14 Q30,6 36,14 Q42,20 48,14 Q54,6 60,14 Q66,20 72,14 Q78,6 84,14 Q90,20 96,14 Q102,6 108,14 Q114,20 120,14 Q126,6 132,14 Q138,20 144,14 Q150,6 156,14 Q162,20 168,14 Q174,6 180,14 Q186,20 192,14 Q198,6 204,14" vector-effect="non-scaling-stroke"/>`;
// Cordas de harpa — barrinhas verticais de altura variável.
const SILHUETA_CORDAS = `<path d="M6,22L6,6L9,6L9,22Z M23,22L23,10L26,10L26,22Z M40,22L40,4L43,4L43,22Z M57,22L57,9L60,9L60,22Z M74,22L74,5L77,5L77,22Z M91,22L91,11L94,11L94,22Z M108,22L108,6L111,6L111,22Z M125,22L125,8L128,8L128,22Z M142,22L142,4L145,4L145,22Z M159,22L159,10L162,10L162,22Z M176,22L176,6L179,6L179,22Z M193,22L193,9L196,9L196,22Z"/>`;
// Raios/explosão — pontas finas e irregulares, clima de júbilo/festa.
const SILHUETA_RAIOS = `<path d="M0,22 L6,2 L12,22 L18,10 L24,22 L30,4 L36,22 L42,14 L48,22 L54,2 L60,22 L66,9 L72,22 L78,5 L84,22 L90,13 L96,22 L102,3 L108,22 L114,11 L120,22 L126,4 L132,22 L138,15 L144,22 L150,2 L156,22 L162,10 L168,22 L174,5 L180,22 L186,12 L192,22 L198,3 L204,22Z" vector-effect="non-scaling-stroke"/>`;
// Pontas de coroa — alternando pico alto/baixo, ritmo regular tipo coroa.
const SILHUETA_COROA = `<path d="M0,22 L7,3 L14,22 L21,14 L28,22 L35,1 L42,22 L49,17 L56,22 L63,3 L70,22 L77,14 L84,22 L91,1 L98,22 L105,17 L112,22 L119,3 L126,22 L133,14 L140,22 L147,1 L154,22 L161,17 L168,22 L175,3 L182,22 L189,14 L196,22 L203,3 L210,22Z" vector-effect="non-scaling-stroke"/>`;
// Pétalas — bolhas arredondadas repetindo, clima floral suave.
const SILHUETA_PETALAS = `<path d="M0,22 Q5,8 9,9 Q13,8 18,22 Q23,8 27,9 Q31,8 36,22 Q41,8 45,9 Q49,8 54,22 Q59,8 63,9 Q67,8 72,22 Q77,8 81,9 Q85,8 90,22 Q95,8 99,9 Q103,8 108,22 Q113,8 117,9 Q121,8 126,22 Q131,8 135,9 Q139,8 144,22 Q149,8 153,9 Q157,8 162,22 Q167,8 171,9 Q175,8 180,22 Q185,8 189,9 Q193,8 198,22Z"/>`;

export const CATEGORIAS = [
  {
    nome: "Harpa",
    cor: "#EF6400",
    corCena: "#6B2E00",
    silhueta: SILHUETA_CORDAS,
    // Nota musical única — a harpa com cordas ficava estranha preenchida
    // sólida; uma nota fecha bem tanto em traço quanto em preenchimento.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="17" r="4"/><path d="M12 17V4c3 0 5 2 6 5"/></svg>`,
  },
  {
    nome: "Heroínas da Fé",
    cor: "#C97F92",
    corCena: "#9B3A5F",
    silhueta: SILHUETA_PETALAS,
    // Flor — referência às "irmãs", o público desse grupo.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12.00" cy="7.40" r="3"/><circle cx="16.37" cy="10.58" r="3"/><circle cx="14.70" cy="15.72" r="3"/><circle cx="9.30" cy="15.72" r="3"/><circle cx="7.63" cy="10.58" r="3"/><circle cx="12" cy="12" r="2.2"/></svg>`,
  },
  {
    nome: "Coral Vozes de Sião",
    cor: "#9C4100",
    corCena: "#4A2510",
    silhueta: SILHUETA_ONDA,
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c2-5 4-5 6 0s4 5 6 0 4-5 6 0"/></svg>`,
  },
  {
    nome: "Átrios",
    cor: "#7FA3C4",
    corCena: "#2E5C82",
    silhueta: SILHUETA_PILARES,
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M5 21h14M8 21v-8M16 21v-8"/></svg>`,
  },
  {
    nome: "Júbilos dos Fiéis",
    cor: "#4A74A0",
    corCena: "#16314D",
    silhueta: SILHUETA_RAIOS,
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>`,
  },
  {
    nome: "Cânticos de Davi",
    cor: "#B8963E",
    corCena: "#6B4E00",
    silhueta: SILHUETA_COROA,
    // Coroa (Davi rei), não estrela — a estrela fica reservada pra Favoritos.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h16M4 18l-1-9 5 4 4-6 4 6 5-4-1 9"/></svg>`,
  },
  {
    nome: "Cantata",
    cor: "#7A9E82",
    corCena: "#0F2E26",
    // Estrela de Belém sobre os montes — cena natalina, hinos da cantata.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12.00,3.20 13.23,6.80 17.04,6.86 14.00,9.15 15.12,12.79 12.00,10.60 8.88,12.79 10.00,9.15 6.96,6.86 10.77,6.80"/></svg>`,
  },
  {
    nome: "Outros",
    cor: "#833700",
    corCena: "#332014",
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2.5"/><path d="M9.5 18V5l8-2v11"/></svg>`,
  },
];

export const SILHUETA_PADRAO = SILHUETA_MONTANHAS;

export const COR_CATEGORIA_PADRAO = "#833700";
export const MOTIVO_PADRAO = CATEGORIAS[CATEGORIAS.length - 1].motivo;

// Estrela — usada só pra favoritos (na aba de navegação e no botão de
// favoritar de cada card), nunca como motivo decorativo de categoria.
export const ICONE_ESTRELA = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l2.4 6.2L21 11l-5.5 4 1.8 6.5L12 17.8 6.7 21.5l1.8-6.5L3 11l6.6-1.8Z"/></svg>`;

// Favoritos não é uma categoria real do banco — é um filtro do lado do
// cliente (localStorage) que sempre aparece primeiro na navegação,
// independente de quais categorias reais tiverem hino.
export const FAVORITOS = {
  nome: "Favoritos",
  cor: "#EF6400",
  icone: ICONE_ESTRELA,
};
