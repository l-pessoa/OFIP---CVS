import { listarHinos, API_BASE } from "./api.js";
import { CATEGORIAS, COR_CATEGORIA_PADRAO, MOTIVO_PADRAO, FAVORITOS, ICONE_ESTRELA } from "./categorias.js";

const USER_KEY = "ofipCvsUsuario";
const THEME_KEY = "ofipCvsTema";
const FAVORITOS_KEY = "ofipCvsFavoritos";

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

function svgFechar() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
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
      <button type="button" class="visualizador-fechar" aria-label="Fechar">${svgFechar()}</button>
    </div>
    <iframe class="visualizador-iframe" title="Partitura" allow="fullscreen"></iframe>
  `;
  document.body.appendChild(modal);

  const iframe = modal.querySelector(".visualizador-iframe");
  const titulo = modal.querySelector("#visualizador-titulo");

  function fechar() {
    modal.hidden = true;
    iframe.src = "";
  }

  modal.querySelector(".visualizador-fechar").addEventListener("click", fechar);

  return function abrir(idArquivo, tituloHino) {
    titulo.textContent = tituloHino;
    iframe.src = `https://drive.google.com/file/d/${idArquivo}/preview`;
    modal.hidden = false;
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
      return `<span class="naipe-chip${destaque}">${p.naipe}</span>`;
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
      ${hino.link_pdf ? `<button type="button" class="hino-link hino-link-visualizar">Visualizar partitura</button>` : ""}
      ${hino.link_mp3 ? `<audio class="hino-audio" controls preload="none" src="${API_BASE}/audio?id=${idDoArquivoDrive(hino.link_mp3)}"></audio>` : ""}
    </div>
  `;

  const toggle = article.querySelector(".hino-card-toggle");
  const detalhes = article.querySelector(".hino-detalhes");
  const audio = article.querySelector(".hino-audio");
  toggle.addEventListener("click", () => {
    const aberto = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!aberto));
    detalhes.hidden = aberto;
    if (!aberto && audio && audio.preload !== "auto") {
      audio.preload = "auto";
      audio.load();
    }
  });

  article.querySelector(".favorito-btn").addEventListener("click", () => {
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

function renderCategoriaNav(categoriasComHinos, categoriaAtiva, onSelecionar) {
  const nav = document.getElementById("categoria-nav");
  nav.innerHTML = "";

  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "categoria-chip categoria-chip-favoritos" + (categoriaAtiva === FAVORITOS.nome ? " is-ativa" : "");
  favBtn.style.setProperty("--chip-cor", FAVORITOS.cor);
  favBtn.innerHTML = `${FAVORITOS.icone}<span>${FAVORITOS.nome}</span>`;
  favBtn.addEventListener("click", () => onSelecionar(FAVORITOS.nome));
  nav.appendChild(favBtn);

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

  function atualizar() {
    renderCategoriaNav(categoriasComHinos, categoriaAtiva, (nome) => {
      categoriaAtiva = nome;
      atualizar();
    });

    const favoritoIds = getFavoritoIds();
    const onToggleFavorito = (id) => {
      toggleFavorito(id);
      atualizar();
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
    renderLista(filtrados, usuario.naipe, categoriaAtiva, favoritoIds, onToggleFavorito, abrirVisualizador);
  }

  document.getElementById("busca").addEventListener("input", atualizar);
  atualizar();
}

init();
