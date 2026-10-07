import { listarHinos, API_BASE } from "./api.js";
import { CATEGORIAS, COR_CATEGORIA_PADRAO, MOTIVO_PADRAO, SILHUETA_PADRAO, FAVORITOS, ICONE_ESTRELA } from "./categorias.js";
import { ICONES_NAIPE_CORAL } from "./naipes.js";
import { iniciarTutorial, tutorialVisto } from "./tutorial.js";
import { convidarInstalar } from "./instalar.js";
import { registrarServiceWorker } from "./sw-registro.js";

const USER_KEY = "ofipCvsUsuario";
const THEME_KEY = "ofipCvsTema";
const FAVORITOS_KEY = "ofipCvsFavoritos";
const TUTORIAL_CATALOGO_KEY = "ofipCvsTutorialCatalogo";

const PASSOS_TUTORIAL_CATALOGO = [
  {
    seletor: ".categoria-nav",
    titulo: "Categorias",
    texto: "Cada aba é uma categoria de hinos, com sua própria cor. Toque pra filtrar os hinos daquele grupo.",
  },
  {
    seletor: "#busca",
    titulo: "Buscar",
    texto: "Procure um hino pelo nome ou pelo número da Harpa.",
  },
  {
    seletor: ".hino-card",
    titulo: "Abra um hino",
    texto: "Toque num hino pra ver as partes disponíveis, visualizar a partitura e ouvir o áudio de referência.",
  },
  {
    seletor: ".favorito-btn",
    titulo: "Favoritos",
    texto: "Toque na estrela pra favoritar — o hino passa a aparecer na aba Favoritos, no começo da lista.",
  },
  {
    seletor: "#theme-toggle",
    titulo: "Modo claro e escuro",
    texto: "Toque pra trocar a aparência do app entre claro e escuro.",
  },
  {
    seletor: "#menu-toggle",
    titulo: "Menu",
    texto: "Aqui você encontra a área de Maestros (se tiver acesso), esse tutorial de novo quando quiser, e a opção de sair da conta.",
  },
];

function vibrar(duracao = 10) {
  navigator.vibrate?.(duracao);
}

function getUsuario() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function atualizarCorStatus(tema) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = tema === "dark" ? "#833700" : "#EF6400";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.dataset.theme = saved;
  atualizarCorStatus(saved);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const atual = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = atual;
    localStorage.setItem(THEME_KEY, atual);
    atualizarCorStatus(atual);
  });
}

function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const dropdown = document.getElementById("menu-dropdown");

  toggle.addEventListener("click", (evento) => {
    evento.stopPropagation();
    const aberto = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!aberto));
    dropdown.hidden = aberto;
  });

  document.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    dropdown.hidden = true;
  });

  document.getElementById("menu-sair").addEventListener("click", () => {
    localStorage.removeItem(USER_KEY);
    window.location.href = "../index.html";
  });

  document.getElementById("menu-tutorial").addEventListener("click", () => {
    iniciarTutorial(TUTORIAL_CATALOGO_KEY, PASSOS_TUTORIAL_CATALOGO);
  });
}

function getFavoritoIds() {
  const raw = localStorage.getItem(FAVORITOS_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function toggleFavorito(id) {
  const atuais = getFavoritoIds();
  if (atuais.has(id)) {
    atuais.delete(id);
  } else {
    atuais.add(id);
  }
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...atuais]));
}

function corDaCategoria(nome) {
  if (nome === FAVORITOS.nome) return FAVORITOS.cor;
  const encontrada = CATEGORIAS.find((c) => c.nome === nome);
  return encontrada ? encontrada.cor : COR_CATEGORIA_PADRAO;
}

function motivoDaCategoria(nome) {
  const encontrada = CATEGORIAS.find((c) => c.nome === nome);
  return encontrada ? encontrada.motivo : MOTIVO_PADRAO;
}

function cenaDaCategoria(nome) {
  const encontrada = CATEGORIAS.find((c) => c.nome === nome);
  if (!encontrada?.corCena) return null;
  return { corCena: encontrada.corCena, silhueta: encontrada.silhueta ?? SILHUETA_PADRAO };
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

function svgPartitura() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>';
}

function svgFechar() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
}

function svgBaixar() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>';
}

function svgImprimir() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v7H6z"/></svg>';
}

let pdfjsCarregando = null;
function carregarPdfJs() {
  if (pdfjsCarregando) return pdfjsCarregando;
  pdfjsCarregando = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Não consegui carregar o leitor de PDF."));
    document.head.appendChild(script);
  });
  return pdfjsCarregando;
}

function svgPlay() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function svgPause() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
}

function svgVoltar10() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/></svg>';
}

function svgAvancar10() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/></svg>';
}

function formatarTempo(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function initAudioPlayer(raiz, src) {
  const audio = raiz.querySelector(".audio-elemento");
  const btnPlay = raiz.querySelector(".audio-play");
  const btnVoltar = raiz.querySelector(".audio-voltar");
  const btnAvancar = raiz.querySelector(".audio-avancar");
  const barra = raiz.querySelector(".audio-progresso");
  const preenchido = raiz.querySelector(".audio-progresso-preenchido");
  const tempoAtual = raiz.querySelector(".audio-tempo-atual");
  const tempoTotal = raiz.querySelector(".audio-tempo-total");

  let carregado = false;
  let carregando = false;
  let tocarAoCarregar = false;
  let arrastando = false;

  function fracaoDoEvento(evento) {
    const rect = barra.getBoundingClientRect();
    const x = (evento.touches ? evento.touches[0].clientX : evento.clientX) - rect.left;
    return Math.min(1, Math.max(0, x / rect.width));
  }

  function aplicarFracaoVisual(fracao) {
    preenchido.style.width = `${fracao * 100}%`;
  }

  async function carregarAudio() {
    if (carregado || carregando) return;
    carregando = true;
    btnPlay.classList.add("audio-carregando");
    try {
      const resposta = await fetch(src);
      const total = Number(resposta.headers.get("content-length")) || 0;
      const leitor = resposta.body.getReader();
      const pedacos = [];
      let recebido = 0;
      for (;;) {
        const { done, value } = await leitor.read();
        if (done) break;
        pedacos.push(value);
        recebido += value.length;
        if (total > 0) aplicarFracaoVisual(recebido / total);
      }
      const blob = new Blob(pedacos, { type: "audio/mpeg" });
      audio.src = URL.createObjectURL(blob);
      carregado = true;
      aplicarFracaoVisual(0);
      btnPlay.classList.remove("audio-carregando");
      if (tocarAoCarregar) audio.play();
    } catch {
      btnPlay.classList.remove("audio-carregando");
      carregando = false;
    }
  }

  btnPlay.addEventListener("click", () => {
    if (!carregado) {
      tocarAoCarregar = true;
      carregarAudio();
      return;
    }
    if (audio.paused) audio.play();
    else audio.pause();
  });

  btnVoltar.addEventListener("click", () => {
    if (carregado) audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  btnAvancar.addEventListener("click", () => {
    if (carregado) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  });

  audio.addEventListener("play", () => {
    btnPlay.innerHTML = svgPause();
    btnPlay.setAttribute("aria-label", "Pausar");
  });

  audio.addEventListener("pause", () => {
    btnPlay.innerHTML = svgPlay();
    btnPlay.setAttribute("aria-label", "Tocar");
  });

  audio.addEventListener("loadedmetadata", () => {
    tempoTotal.textContent = formatarTempo(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (arrastando) return;
    tempoAtual.textContent = formatarTempo(audio.currentTime);
    if (audio.duration) aplicarFracaoVisual(audio.currentTime / audio.duration);
  });

  audio.addEventListener("ended", () => {
    aplicarFracaoVisual(0);
    tempoAtual.textContent = "0:00";
  });

  function iniciarArraste(evento) {
    if (!carregado || !audio.duration) return;
    arrastando = true;
    aplicarFracaoVisual(fracaoDoEvento(evento));
  }

  function moverArraste(evento) {
    if (!arrastando) return;
    aplicarFracaoVisual(fracaoDoEvento(evento));
  }

  function soltarArraste(evento) {
    if (!arrastando) return;
    arrastando = false;
    const fracao = fracaoDoEvento(evento);
    audio.currentTime = fracao * audio.duration;
    tempoAtual.textContent = formatarTempo(audio.currentTime);
  }

  barra.addEventListener("pointerdown", (evento) => {
    barra.setPointerCapture(evento.pointerId);
    iniciarArraste(evento);
  });
  barra.addEventListener("pointermove", moverArraste);
  barra.addEventListener("pointerup", soltarArraste);

  return { carregarAudio };
}

function idDoArquivoDrive(link) {
  try {
    return new URL(link).searchParams.get("id");
  } catch {
    return null;
  }
}

function initVisualizador() {
  const modal = document.createElement("div");
  modal.className = "visualizador-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="visualizador-topo">
      <span class="visualizador-titulo" id="visualizador-titulo"></span>
      <button type="button" class="visualizador-imprimir" aria-label="Imprimir">${svgImprimir()}</button>
      <a class="visualizador-baixar" aria-label="Baixar PDF">${svgBaixar()}</a>
      <button type="button" class="visualizador-fechar" aria-label="Fechar">${svgFechar()}</button>
    </div>
    <div class="visualizador-paginas" id="visualizador-paginas"></div>
  `;
  document.body.appendChild(modal);

  const paginas = modal.querySelector("#visualizador-paginas");
  const titulo = modal.querySelector("#visualizador-titulo");
  const linkBaixar = modal.querySelector(".visualizador-baixar");
  const btnImprimir = modal.querySelector(".visualizador-imprimir");
  let wakeLock = null;
  let blobUrlAtual = null;

  btnImprimir.addEventListener("click", () => window.print());

  async function pedirWakeLock() {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
    } catch {
      wakeLock = null;
    }
  }

  function liberarWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !modal.hidden && !wakeLock) {
      pedirWakeLock();
    }
  });

  function iniciarFechamento() {
    modal.classList.remove("aberto");
    liberarWakeLock();
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      modal.hidden = true;
      paginas.innerHTML = "";
    }, semMovimento ? 0 : 300);
  }

  function fechar() {
    const estavaAberto = !modal.hidden;
    iniciarFechamento();
    if (estavaAberto && history.state && history.state.visualizador) {
      history.back();
    }
  }

  modal.querySelector(".visualizador-fechar").addEventListener("click", fechar);

  window.addEventListener("popstate", () => {
    if (!modal.hidden) {
      iniciarFechamento();
    }
  });

  const topo = modal.querySelector(".visualizador-topo");
  let arrastoInicioY = null;

  topo.addEventListener("pointerdown", (evento) => {
    arrastoInicioY = evento.clientY;
    modal.style.transition = "none";
    topo.setPointerCapture(evento.pointerId);
  });

  topo.addEventListener("pointermove", (evento) => {
    if (arrastoInicioY === null) return;
    const delta = evento.clientY - arrastoInicioY;
    if (delta > 0) modal.style.transform = `translateY(${delta}px)`;
  });

  function soltarArrastoModal(evento) {
    if (arrastoInicioY === null) return;
    const delta = evento.clientY - arrastoInicioY;
    arrastoInicioY = null;
    modal.style.transition = "";
    modal.style.transform = "";
    if (delta > 120) {
      fechar();
    }
  }

  topo.addEventListener("pointerup", soltarArrastoModal);
  topo.addEventListener("pointercancel", soltarArrastoModal);

  async function renderizarPdf(urlPdf, tituloHino) {
    paginas.innerHTML = '<p class="visualizador-carregando">Carregando partitura...</p>';
    linkBaixar.removeAttribute("href");
    try {
      const resposta = await fetch(urlPdf);
      if (!resposta.ok) throw new Error("pdf indisponível");
      const bytes = await resposta.arrayBuffer();

      if (blobUrlAtual) URL.revokeObjectURL(blobUrlAtual);
      blobUrlAtual = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      linkBaixar.href = blobUrlAtual;
      linkBaixar.download = `${tituloHino}.pdf`;

      const pdfjsLib = await carregarPdfJs();
      const documento = await pdfjsLib.getDocument({ data: bytes }).promise;
      paginas.innerHTML = "";
      const larguraAlvo = paginas.clientWidth - 24;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let i = 1; i <= documento.numPages; i++) {
        const pagina = await documento.getPage(i);
        const base = pagina.getViewport({ scale: 1 });
        const viewport = pagina.getViewport({ scale: (larguraAlvo / base.width) * dpr });
        const canvas = document.createElement("canvas");
        canvas.className = "visualizador-pagina";
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${larguraAlvo}px`;
        paginas.appendChild(canvas);
        await pagina.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      }
    } catch {
      paginas.innerHTML = '<p class="visualizador-carregando">Não deu pra carregar a partitura aqui. Confira sua conexão e tenta de novo.</p>';
    }
  }

  return function abrir(idArquivo, tituloHino) {
    titulo.textContent = tituloHino;
    const urlPdf = `${API_BASE}/pdf?id=${idArquivo}`;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("aberto"));
    history.pushState({ visualizador: true }, "");
    pedirWakeLock();
    renderizarPdf(urlPdf, tituloHino);
  };
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
      const icone = ICONES_NAIPE_CORAL[p.naipe] ?? "";
      return `<span class="naipe-chip${destaque}">${icone}${p.naipe}</span>`;
    })
    .join("");
  const mais = resto > 0 ? `<span class="naipe-chip naipe-chip-mais">+${resto}</span>` : "";
  return chips + mais;
}

function renderCard(hino, naipeDoUsuario, favoritoIds, onToggleFavorito, abrirVisualizador) {
  const cor = corDaCategoria(hino.hino_categoria);
  const ehFavorito = favoritoIds.has(hino.id);
  const article = document.createElement("article");
  article.className = "hino-card";
  article.style.setProperty("--spine-cor", cor);

  article.innerHTML = `
    <div class="hino-card-motivo" aria-hidden="true">${motivoDaCategoria(hino.hino_categoria)}</div>
    <div class="hino-card-header">
      <button type="button" class="hino-card-toggle" aria-expanded="false">
        <span class="hino-titulo">${hino.hino_titulo}</span>
        ${hino.hino_numero_harpa ? `<span class="hino-numero">${hino.hino_numero_harpa}</span>` : ""}
      </button>
      <button type="button" class="favorito-btn${ehFavorito ? " is-favorito" : ""}" aria-pressed="${ehFavorito}" aria-label="Favoritar hino">
        ${ICONE_ESTRELA}
      </button>
    </div>
    <div class="hino-naipes">${renderNaipeChips(hino, naipeDoUsuario)}</div>
    <div class="hino-detalhes" hidden>
      <div class="hino-detalhes-inner">
        ${hino.link_pdf ? `<button type="button" class="hino-link hino-link-visualizar">${svgPartitura()}Visualizar partitura</button>` : ""}
        ${
          hino.link_mp3
            ? `<div class="audio-player">
                <audio class="audio-elemento" preload="none"></audio>
                <div class="audio-progresso" role="slider" aria-label="Posição do áudio" aria-valuemin="0" aria-valuemax="100">
                  <div class="audio-progresso-preenchido"></div>
                </div>
                <div class="audio-tempos">
                  <span class="audio-tempo-atual">0:00</span>
                  <span class="audio-tempo-total">0:00</span>
                </div>
                <div class="audio-controles">
                  <button type="button" class="audio-btn audio-voltar" aria-label="Voltar 10 segundos">${svgVoltar10()}</button>
                  <button type="button" class="audio-btn audio-play" aria-label="Tocar">${svgPlay()}</button>
                  <button type="button" class="audio-btn audio-avancar" aria-label="Avançar 10 segundos">${svgAvancar10()}</button>
                </div>
              </div>`
            : ""
        }
      </div>
    </div>
  `;

  const toggle = article.querySelector(".hino-card-toggle");
  const detalhes = article.querySelector(".hino-detalhes");
  const audioPlayerEl = article.querySelector(".audio-player");
  const audioPlayer = audioPlayerEl
    ? initAudioPlayer(audioPlayerEl, `${API_BASE}/audio?id=${idDoArquivoDrive(hino.link_mp3)}`)
    : null;
  toggle.addEventListener("click", () => {
    const aberto = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!aberto));
    detalhes.hidden = aberto;
    if (!aberto && audioPlayer) audioPlayer.carregarAudio();
  });

  const btnFavorito = article.querySelector(".favorito-btn");
  btnFavorito.addEventListener("click", () => {
    const agoraFavorito = !btnFavorito.classList.contains("is-favorito");
    btnFavorito.classList.toggle("is-favorito", agoraFavorito);
    btnFavorito.setAttribute("aria-pressed", String(agoraFavorito));
    vibrar();
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (agoraFavorito && !semMovimento) {
      btnFavorito.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
        { duration: 260, easing: "cubic-bezier(.34,1.56,.64,1)" }
      );
    }
    onToggleFavorito(hino.id);
  });

  const btnVisualizar = article.querySelector(".hino-link-visualizar");
  if (btnVisualizar) {
    btnVisualizar.addEventListener("click", () => {
      const idArquivo = idDoArquivoDrive(hino.link_pdf);
      if (idArquivo) abrirVisualizador(idArquivo, hino.hino_titulo);
    });
  }

  return article;
}

function svgMais() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>';
}

const LIMITE_ABAS_PRIMARIAS = 3;

function renderCategoriaNav(categoriasComHinos, categoriaAtiva, onSelecionar) {
  const nav = document.getElementById("categoria-nav");
  nav.innerHTML = "";

  function criarChip(classeExtra, cor, icone, texto, ativa) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "categoria-chip" + classeExtra + (ativa ? " is-ativa" : "");
    btn.innerHTML = `${icone}<span>${texto}</span>`;
    btn.style.setProperty("--chip-cor", cor);
    return btn;
  }

  const favBtn = criarChip(" categoria-chip-favoritos", FAVORITOS.cor, FAVORITOS.icone, FAVORITOS.nome, categoriaAtiva === FAVORITOS.nome);
  favBtn.addEventListener("click", () => {
    vibrar();
    onSelecionar(FAVORITOS.nome);
  });
  nav.appendChild(favBtn);

  const primarias = categoriasComHinos.slice(0, LIMITE_ABAS_PRIMARIAS);
  const resto = categoriasComHinos.slice(LIMITE_ABAS_PRIMARIAS);

  for (const nome of primarias) {
    const btn = criarChip("", corDaCategoria(nome), motivoDaCategoria(nome), nome, nome === categoriaAtiva);
    btn.addEventListener("click", () => {
      vibrar();
      onSelecionar(nome);
    });
    nav.appendChild(btn);
  }

  if (resto.length === 0) return;

  const restoAtivo = resto.includes(categoriaAtiva);
  const maisWrap = document.createElement("div");
  maisWrap.className = "categoria-mais-wrap";

  const maisBtn = criarChip("", "var(--text-secondary)", svgMais(), "Mais", restoAtivo);
  maisWrap.appendChild(maisBtn);

  const dropdown = document.createElement("div");
  dropdown.className = "categoria-mais-dropdown";
  dropdown.hidden = true;
  for (const nome of resto) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "categoria-mais-item" + (nome === categoriaAtiva ? " is-ativa" : "");
    item.innerHTML = `${motivoDaCategoria(nome)}<span>${nome}</span>`;
    item.style.setProperty("--chip-cor", corDaCategoria(nome));
    item.addEventListener("click", () => {
      vibrar();
      dropdown.hidden = true;
      onSelecionar(nome);
    });
    dropdown.appendChild(item);
  }
  maisWrap.appendChild(dropdown);

  maisBtn.addEventListener("click", (evento) => {
    evento.stopPropagation();
    dropdown.hidden = !dropdown.hidden;
  });
  document.addEventListener("click", () => {
    dropdown.hidden = true;
  });

  nav.appendChild(maisWrap);
}

function renderLista(hinos, naipeDoUsuario, categoriaAtiva, favoritoIds, onToggleFavorito, abrirVisualizador) {
  const lista = document.getElementById("hino-lista");
  lista.innerHTML = "";
  if (hinos.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "hino-vazio";
    vazio.textContent =
      categoriaAtiva === FAVORITOS.nome
        ? "Você ainda não favoritou nenhum hino — toque na estrela de um hino pra guardar ele aqui."
        : categoriaAtiva
        ? `Ainda não tem partitura de ${naipeDoUsuario} em "${categoriaAtiva}".`
        : `Ainda não tem partitura de ${naipeDoUsuario} cadastrada.`;
    lista.appendChild(vazio);
    return;
  }
  for (const hino of hinos) {
    lista.appendChild(renderCard(hino, naipeDoUsuario, favoritoIds, onToggleFavorito, abrirVisualizador));
  }
}

async function init() {
  const usuario = getUsuario();
  if (!usuario) {
    window.location.href = "../index.html";
    return;
  }

  initTheme();
  initMenu();
  const abrirVisualizador = initVisualizador();
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
  let ordenacaoAtual = null;

  function ordenarHinos(lista) {
    const copia = [...lista];
    if (ordenacaoAtual === "alfabetica") {
      copia.sort((a, b) => a.hino_titulo.localeCompare(b.hino_titulo, "pt-BR"));
    } else if (ordenacaoAtual === "recentes") {
      copia.sort((a, b) => b.created_at - a.created_at);
    } else if (ordenacaoAtual === "antigos") {
      copia.sort((a, b) => a.created_at - b.created_at);
    } else if (categoriaAtiva === "Harpa") {
      copia.sort((a, b) => (a.hino_numero_harpa ?? Infinity) - (b.hino_numero_harpa ?? Infinity));
    }
    return copia;
  }

  function atualizar() {
    renderCategoriaNav(categoriasComHinos, categoriaAtiva, (nome) => {
      categoriaAtiva = nome;
      atualizar();
    });

    const marcaDagua = document.getElementById("categoria-marca-dagua");
    const pauta = document.querySelector(".catalogo-pauta");
    const cena = categoriaAtiva && categoriaAtiva !== FAVORITOS.nome ? cenaDaCategoria(categoriaAtiva) : null;

    const buscaWrap = document.querySelector(".catalogo-busca");
    if (cena) {
      document.body.style.setProperty("--cena-cor", cena.corCena);
      pauta.classList.add("tem-cena");
      buscaWrap.classList.add("tem-categoria");
      marcaDagua.className = "categoria-marca-dagua tem-cena";
      marcaDagua.innerHTML = `
        <span class="cena-icone cena-icone-eco">${motivoDaCategoria(categoriaAtiva)}</span>
        <span class="cena-icone">${motivoDaCategoria(categoriaAtiva)}</span>
        <svg class="cena-silhueta" viewBox="0 0 200 24" preserveAspectRatio="none">${cena.silhueta}</svg>
        <div class="cena-topo">
          <span class="cena-icone-mini">${motivoDaCategoria(categoriaAtiva)}</span>
          <span class="cena-nome">${categoriaAtiva}</span>
        </div>
      `;
    } else {
      document.body.style.removeProperty("--cena-cor");
      pauta.classList.remove("tem-cena");
      buscaWrap.classList.remove("tem-categoria");
      marcaDagua.className = "categoria-marca-dagua";
      marcaDagua.innerHTML = categoriaAtiva === FAVORITOS.nome ? FAVORITOS.icone : motivoDaCategoria(categoriaAtiva);
    }

    document.querySelector(".catalogo-header-top").hidden = !!cena;
    document.querySelector(".catalogo-header").classList.toggle("tem-cena", !!cena);

    const favoritoIds = getFavoritoIds();
    const onToggleFavorito = (id) => {
      toggleFavorito(id);
      if (categoriaAtiva === FAVORITOS.nome) atualizar();
    };

    const termoBusca = document.getElementById("busca").value.trim().toLowerCase();
    const hinosDaCategoria =
      categoriaAtiva === FAVORITOS.nome
        ? todosOsHinos.filter((h) => favoritoIds.has(h.id))
        : categoriaAtiva
        ? grupos.get(categoriaAtiva) ?? []
        : [];
    const filtrados = termoBusca
      ? hinosDaCategoria.filter(
          (h) =>
            h.hino_titulo.toLowerCase().includes(termoBusca) ||
            String(h.hino_numero_harpa ?? "").includes(termoBusca)
        )
      : hinosDaCategoria;
    renderLista(ordenarHinos(filtrados), usuario.naipe, categoriaAtiva, favoritoIds, onToggleFavorito, abrirVisualizador);

    document.querySelectorAll(".ordenar-item").forEach((item) => {
      item.classList.toggle("is-ativo", item.dataset.ordenar === ordenacaoAtual);
    });
    document.getElementById("btn-ordenar").classList.toggle("is-ativo", !!ordenacaoAtual);
  }

  document.getElementById("busca").addEventListener("input", atualizar);

  const btnOrdenar = document.getElementById("btn-ordenar");
  const ordenarDropdown = document.getElementById("ordenar-dropdown");

  btnOrdenar.addEventListener("click", (evento) => {
    evento.stopPropagation();
    const aberto = btnOrdenar.getAttribute("aria-expanded") === "true";
    btnOrdenar.setAttribute("aria-expanded", String(!aberto));
    ordenarDropdown.hidden = aberto;
  });

  document.addEventListener("click", () => {
    btnOrdenar.setAttribute("aria-expanded", "false");
    ordenarDropdown.hidden = true;
  });

  document.querySelectorAll(".ordenar-item").forEach((item) => {
    item.addEventListener("click", () => {
      const escolha = item.dataset.ordenar;
      ordenacaoAtual = ordenacaoAtual === escolha ? null : escolha;
      ordenarDropdown.hidden = true;
      btnOrdenar.setAttribute("aria-expanded", "false");
      atualizar();
    });
  });

  function irParaAba(direcao) {
    const abas = [FAVORITOS.nome, ...categoriasComHinos];
    const indiceAtual = abas.indexOf(categoriaAtiva);
    if (indiceAtual === -1) return;
    const proximoIndice = indiceAtual + direcao;
    if (proximoIndice < 0 || proximoIndice >= abas.length) return;
    categoriaAtiva = abas[proximoIndice];
    vibrar();
    atualizar();
  }

  const areaSwipe = document.getElementById("hino-lista");
  let swipeInicioX = null;
  let swipeInicioY = null;
  let swipeEhHorizontal = null;

  areaSwipe.addEventListener("pointerdown", (evento) => {
    if (evento.pointerType === "mouse" || evento.target.closest(".audio-progresso")) return;
    swipeInicioX = evento.clientX;
    swipeInicioY = evento.clientY;
    swipeEhHorizontal = null;
  });

  areaSwipe.addEventListener("pointermove", (evento) => {
    if (swipeInicioX === null) return;
    const deltaX = evento.clientX - swipeInicioX;
    const deltaY = evento.clientY - swipeInicioY;
    if (swipeEhHorizontal === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      swipeEhHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    }
  });

  function soltarSwipeCategoria(evento) {
    if (swipeInicioX === null) return;
    const deltaX = evento.clientX - swipeInicioX;
    if (swipeEhHorizontal && Math.abs(deltaX) > 70) {
      irParaAba(deltaX < 0 ? 1 : -1);
    }
    swipeInicioX = null;
    swipeInicioY = null;
    swipeEhHorizontal = null;
  }

  areaSwipe.addEventListener("pointerup", soltarSwipeCategoria);
  areaSwipe.addEventListener("pointercancel", soltarSwipeCategoria);

  atualizar();

  if (!tutorialVisto(TUTORIAL_CATALOGO_KEY)) {
    iniciarTutorial(TUTORIAL_CATALOGO_KEY, PASSOS_TUTORIAL_CATALOGO, convidarInstalar);
  } else {
    convidarInstalar();
  }
}

registrarServiceWorker("../sw.js");
init();
