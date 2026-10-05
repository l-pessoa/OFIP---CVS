// Ordem fixa de exibição das categorias reais do hinário, cada uma com:
// - cor: a cor de destaque (lombada do card, chip ativo, marca d'água).
//   Pra Harpa / Coral Vozes de Sião / Outros continua dentro da paleta de
//   marrom/laranja original. Heroínas da Fé, Átrios, Júbilos dos Fiéis,
//   Cânticos de Davi e Cantata ganharam tons próprios (bem suaves, puxado
//   pro branco) a pedido do Lucas — não é regra geral, é só essas 5.
// - corFaixa: opcional. Só existe nessas mesmas 5 categorias — é o fundo
//   da faixa personalizada que aparece entre a navegação e a lista quando
//   a categoria tá selecionada. Categoria sem corFaixa = sem faixa, fica
//   exatamente como era antes (reverter = só apagar essa propriedade).
// - motivo: um SVG decorativo pequeno, desenhado à mão (mesmo estilo dos
//   ícones sol/lua e do cursor-note.svg — traço fino, sem preenchimento
//   sólido), usado no canto do card, na marca d'água do cabeçalho e dentro
//   da faixa personalizada.
//
// Os nomes entre parênteses no pedido original (irmãs, coral, adolescentes,
// jovens, crianças) são só identificação de público — não aparecem na UI,
// o nome de exibição é sempre o nome real da categoria.
export const CATEGORIAS = [
  {
    nome: "Harpa",
    cor: "#EF6400",
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V5C6 3 8 2 10 2c3 0 5 2 6 5l2 4"/><path d="M9 21V7M12 21V8M15 21V10"/></svg>`,
  },
  {
    nome: "Heroínas da Fé",
    cor: "#C97F92",
    corFaixa: "#FBEAEE",
    // Flor — referência às "irmãs", o público desse grupo.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12.00" cy="7.40" r="3"/><circle cx="16.37" cy="10.58" r="3"/><circle cx="14.70" cy="15.72" r="3"/><circle cx="9.30" cy="15.72" r="3"/><circle cx="7.63" cy="10.58" r="3"/><circle cx="12" cy="12" r="2.2"/></svg>`,
  },
  {
    nome: "Coral Vozes de Sião",
    cor: "#9C4100",
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c2-5 4-5 6 0s4 5 6 0 4-5 6 0"/></svg>`,
  },
  {
    nome: "Átrios",
    cor: "#7FA3C4",
    corFaixa: "#E8F0F7",
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M5 21h14M8 21v-8M16 21v-8"/></svg>`,
  },
  {
    nome: "Júbilos dos Fiéis",
    cor: "#4A74A0",
    corFaixa: "#DCE8F2",
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>`,
  },
  {
    nome: "Cânticos de Davi",
    cor: "#B8963E",
    corFaixa: "#F6EEDA",
    // Coroa (Davi rei), não estrela — a estrela fica reservada pra Favoritos.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h16M4 18l-1-9 5 4 4-6 4 6 5-4-1 9"/></svg>`,
  },
  {
    nome: "Cantata",
    cor: "#7A9E82",
    corFaixa: "#E6EFE7",
    // Estrela de Belém sobre os montes — cena natalina, hinos da cantata.
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12.00,3.20 13.23,6.80 17.04,6.86 14.00,9.15 15.12,12.79 12.00,10.60 8.88,12.79 10.00,9.15 6.96,6.86 10.77,6.80"/><path d="M2 21l5-6 4 5 4-5.5 4 5.5 3-4"/></svg>`,
  },
  {
    nome: "Outros",
    cor: "#833700",
    motivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2.5"/><path d="M9.5 18V5l8-2v11"/></svg>`,
  },
];

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
