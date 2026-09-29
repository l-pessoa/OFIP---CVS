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
