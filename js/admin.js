import { NAIPES } from "./naipes.js";
import { CATEGORIAS } from "./categorias.js";

const THEME_KEY = "ofipCvsTema";
const SENHA_KEY = "ofipCvsAdminSenha";
const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:u6Bs9PZE";
const CATEGORIA_CORAL = "Coral Vozes de Sião";
const MARCAS_DIACRITICAS = /[\u0300-\u036f]/g;

let hinosCache = [];

function slugCampo(nome) {
  return nome
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function senhaSalva() {
  return sessionStorage.getItem(SENHA_KEY) || "";
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

function mostrarTelaSenha(comErro) {
  document.getElementById("tela-lista").hidden = true;
  document.getElementById("tela-formulario").hidden = true;
  document.getElementById("tela-senha").hidden = false;
  document.getElementById("senha-erro").hidden = !comErro;
}

function mostrarLista() {
  document.getElementById("tela-senha").hidden = true;
  document.getElementById("tela-formulario").hidden = true;
  document.getElementById("tela-lista").hidden = false;
}

function mostrarFormulario() {
  document.getElementById("tela-senha").hidden = true;
  document.getElementById("tela-lista").hidden = true;
  document.getElementById("tela-formulario").hidden = false;
}

function popularCategorias() {
  const select = document.getElementById("categoria");
  for (const categoria of CATEGORIAS) {
    select.appendChild(new Option(categoria.nome, categoria.nome));
  }
}

function iconeUpload() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>';
}

function popularNaipes(containerId, lista) {
  const container = document.getElementById(containerId);
  for (const nome of lista) {
    const campo = slugCampo(nome);
    const inputId = `arquivo-${campo}`;
    const wrapper = document.createElement("div");
    wrapper.className = "naipe-campo";
    wrapper.dataset.naipe = nome;
    wrapper.innerHTML = `
      <span class="naipe-campo-nome">${nome}</span>
      <input type="file" id="${inputId}" name="${campo}" accept="application/pdf" class="arquivo-input" />
      <label class="arquivo-btn" for="${inputId}">${iconeUpload()}<span>Escolher arquivo</span></label>
      <span class="arquivo-status"></span>
    `;
    container.appendChild(wrapper);
  }
}

function initNomesArquivo() {
  document.getElementById("form-hino").addEventListener("change", (evento) => {
    const input = evento.target;
    if (input.type !== "file") return;
    const nomeArquivo = input.files[0]?.name ?? "";
    const status =
      input.id === "audio_referencia"
        ? document.getElementById("audio-arquivo-status")
        : input.closest(".naipe-campo")?.querySelector(".arquivo-status");
    if (status) status.textContent = nomeArquivo;
  });
}

function initCategoriaAutomatica() {
  const campoCategoria = document.getElementById("campo-categoria");
  const categoria = document.getElementById("categoria");
  const avisoCoral = document.getElementById("aviso-categoria-coral");

  function arquivosEm(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="file"]`));
  }

  function atualizar() {
    const temOrquestra = arquivosEm("naipes-orquestra").some((input) => input.files.length > 0);
    const temCoral = arquivosEm("naipes-coral").some((input) => input.files.length > 0);

    if (temCoral && !temOrquestra) {
      categoria.value = CATEGORIA_CORAL;
      campoCategoria.hidden = true;
      avisoCoral.hidden = false;
    } else {
      campoCategoria.hidden = false;
      avisoCoral.hidden = true;
    }
  }

  document.getElementById("form-hino").addEventListener("change", (evento) => {
    if (evento.target.type === "file") atualizar();
  });

  document.getElementById("form-hino").addEventListener("reset", () => {
    setTimeout(atualizar, 0);
  });

  atualizar();
}

function initSenha() {
  if (senhaSalva()) {
    carregarLista();
  }

  document.getElementById("btn-entrar").addEventListener("click", () => {
    const senha = document.getElementById("senha-admin").value;
    if (!senha) return;
    sessionStorage.setItem(SENHA_KEY, senha);
    carregarLista();
  });
}

async function carregarLista() {
  const status = document.getElementById("lista-status");
  mostrarLista();
  status.textContent = "Carregando...";

  try {
    const resposta = await fetch(`${API_BASE}/admin_listar_hinos?senha=${encodeURIComponent(senhaSalva())}`);

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      if (erro.message === "Senha incorreta.") {
        sessionStorage.removeItem(SENHA_KEY);
        mostrarTelaSenha(true);
        return;
      }
      status.textContent = `Erro ao carregar: ${erro.message || "tenta de novo."}`;
      return;
    }

    hinosCache = await resposta.json();
    status.textContent = "";
    renderizarLista();
  } catch {
    status.textContent = "Erro de conexão. Tenta de novo.";
  }
}

function renderizarLista() {
  const container = document.getElementById("lista-hinos");
  container.innerHTML = "";

  if (hinosCache.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "admin-status";
    vazio.textContent = "Nenhum hino cadastrado ainda.";
    container.appendChild(vazio);
    return;
  }

  for (const hino of hinosCache) {
    const item = document.createElement("div");
    item.className = "hino-admin-item";
    item.innerHTML = `
      <div class="hino-admin-info">
        <span class="hino-admin-titulo">${hino.titulo}${hino.numero_harpa ? ` (${hino.numero_harpa})` : ""}</span>
        <span class="hino-admin-categoria">${hino.categoria}</span>
      </div>
      <div class="hino-admin-acoes">
        <button type="button" class="btn-editar">Editar</button>
        <button type="button" class="btn-excluir">Excluir</button>
      </div>
    `;
    item.querySelector(".btn-editar").addEventListener("click", () => iniciarEdicao(hino));
    item.querySelector(".btn-excluir").addEventListener("click", () => confirmarExclusao(hino));
    container.appendChild(item);
  }
}

function limparMarcasExistentes() {
  document.querySelectorAll(".naipe-campo").forEach((campo) => {
    campo.classList.remove("tem-arquivo");
    campo.querySelector(".arquivo-status").textContent = "";
  });
  document.getElementById("audio-arquivo-status").textContent = "";
  document.getElementById("aviso-audio-existente").hidden = true;
}

function marcarArquivosExistentes(hino) {
  const porNaipe = new Map((hino.partes ?? []).map((p) => [p.naipe, p]));

  document.querySelectorAll(".naipe-campo").forEach((campo) => {
    const nomeNaipe = campo.dataset.naipe;
    if (porNaipe.has(nomeNaipe)) {
      campo.classList.add("tem-arquivo");
      campo.querySelector(".arquivo-status").textContent = "já tem arquivo";
    }
  });

  document.getElementById("aviso-audio-existente").hidden = !hino.link_mp3;
}

function iniciarNovoHino() {
  const form = document.getElementById("form-hino");
  form.reset();
  document.getElementById("hino_id").value = "";
  document.getElementById("form-titulo-secao").textContent = "Adicionar novo hino";
  document.getElementById("form-status").textContent = "";
  limparMarcasExistentes();
  mostrarFormulario();
}

function iniciarEdicao(hino) {
  const form = document.getElementById("form-hino");
  form.reset();
  limparMarcasExistentes();

  document.getElementById("hino_id").value = hino.id;
  document.getElementById("titulo").value = hino.titulo;
  document.getElementById("numero_harpa").value = hino.numero_harpa ?? "";
  document.getElementById("categoria").value = hino.categoria;
  document.getElementById("form-titulo-secao").textContent = "Editar hino";
  document.getElementById("form-status").textContent = "";

  marcarArquivosExistentes(hino);
  mostrarFormulario();
}

async function confirmarExclusao(hino) {
  const confirmou = window.confirm(`Excluir "${hino.titulo}"? Isso apaga o hino e os arquivos do Drive, sem volta.`);
  if (!confirmou) return;

  const status = document.getElementById("lista-status");
  status.textContent = "Excluindo...";

  try {
    const resposta = await fetch(`${API_BASE}/excluir_hino`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha: senhaSalva(), hino_id: hino.id }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      if (erro.message === "Senha incorreta.") {
        sessionStorage.removeItem(SENHA_KEY);
        mostrarTelaSenha(true);
        return;
      }
      status.textContent = `Erro ao excluir: ${erro.message || "tenta de novo."}`;
      return;
    }

    status.textContent = "Hino excluído.";
    await carregarLista();
  } catch {
    status.textContent = "Erro de conexão. Tenta de novo.";
  }
}

function initListaBotoes() {
  document.getElementById("btn-novo-hino").addEventListener("click", iniciarNovoHino);
  document.getElementById("btn-voltar-lista").addEventListener("click", carregarLista);
}

function initFormulario() {
  const form = document.getElementById("form-hino");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const status = document.getElementById("form-status");
    status.textContent = "Salvando...";

    const hinoId = document.getElementById("hino_id").value;
    const endpoint = hinoId ? "editar_hino" : "adicionar_hino";

    const dados = new FormData(form);
    dados.set("senha", senhaSalva());
    if (!hinoId) dados.delete("hino_id");

    for (const input of form.querySelectorAll('input[type="file"]')) {
      if (input.files.length === 0) dados.delete(input.name);
    }

    try {
      const resposta = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        body: dados,
      });

      if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}));
        if (erro.message === "Senha incorreta.") {
          sessionStorage.removeItem(SENHA_KEY);
          mostrarTelaSenha(true);
          return;
        }
        status.textContent = `Erro ao salvar: ${erro.message || "tenta de novo."}`;
        return;
      }

      await carregarLista();
      document.getElementById("lista-status").textContent = "Hino salvo!";
    } catch {
      status.textContent = "Erro de conexão. Tenta de novo.";
    }
  });
}

initTheme();
popularCategorias();
popularNaipes("naipes-orquestra", NAIPES.orquestra);
popularNaipes("naipes-coral", NAIPES.coral);
initCategoriaAutomatica();
initNomesArquivo();
initListaBotoes();
initSenha();
initFormulario();
