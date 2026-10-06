// Lista confirmada a partir das partes reais enviadas pelo Aldo (hino
// "Plena Paz" — Harpa 3). Timpano e bateria são instrumentos diferentes,
// por isso ficam em naipes separados em vez de um "Percussão" genérico.
export const NAIPES = {
  orquestra: [
    "Violino 1",
    "Violino 2",
    "Violino 3",
    "Violino Estudante",
    "Viola",
    "Violoncelo",
    "Contrabaixo",
    "Piano",
    "Flauta 1",
    "Flauta 2",
    "Flauta Estudante",
    "Clarinete 1",
    "Clarinete 2",
    "Saxofone Alto",
    "Saxofone Tenor",
    "Saxofone Barítono",
    "Trompete 1",
    "Trompete 2",
    "Trompete 3",
    "Trombone 1",
    "Trombone 2",
    "Trompa",
    "Tuba",
    "Bateria",
    "Tímpano",
  ],
  coral: ["Soprano", "Contralto", "Tenor", "Baixo"],
};

// Ícone por naipe do coral: uma pauta de 4 linhas com a nota marcando a
// faixa daquela voz (soprano aguda no topo, baixo grave embaixo) — reusa
// o motivo de pauta/partitura já presente no resto do site em vez de
// inventar um símbolo novo de "voz".
export const ICONES_NAIPE_CORAL = {
  Soprano: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3 5h18M3 10h18M3 15h18M3 20h18"/><circle cx="12" cy="5" r="2.3" fill="currentColor" stroke="none"/></svg>`,
  Contralto: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3 5h18M3 10h18M3 15h18M3 20h18"/><circle cx="12" cy="10" r="2.3" fill="currentColor" stroke="none"/></svg>`,
  Tenor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3 5h18M3 10h18M3 15h18M3 20h18"/><circle cx="12" cy="15" r="2.3" fill="currentColor" stroke="none"/></svg>`,
  Baixo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3 5h18M3 10h18M3 15h18M3 20h18"/><circle cx="12" cy="20" r="2.3" fill="currentColor" stroke="none"/></svg>`,
};
