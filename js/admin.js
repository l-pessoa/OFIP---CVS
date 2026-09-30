import { NAIPES } from "./naipes.js";
import { CATEGORIAS } from "./categorias.js";

const THEME_KEY = "ofipCvsTema";
const SENHA_KEY = "ofipCvsAdminSenha";
const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:u6Bs9PZE";
const CATEGORIA_CORAL = "Coral Vozes de Sião";
const MARCAS_DIACRITICAS = /[\u0300-\u036f]/g;

function slugCampo(nome) {
  return nome
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
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

function mostrarFormulario() {
  document.getElementById("tela-senha").hidden = true;
  document.getElementById("tela-formulario").hidden = false;
}

function mostrarTelaSenha(comErro) {
  document.getElementById("tela-formulario").hidden = true;
  document.getElementById("tela-senha").hidden = false;
  document.getElementById("senha-erro").hidden = !comErro;
}

function popularCategorias() {
  const select = document.getElementById("categoria");
  for (const categoria of CATEGORIAS) {
    select.appendChild(new Option(categoria.nome, categoria.nome));
  }
}

function popularNaipes(containerId, lista) {
  const container = document.getElementById(containerId);
  for (const nome of lista) {
    const campo = slugCampo(nome);
    const label = document.createElement("label");
    label.className = "naipe-campo";
    label.innerHTML = `<span>${nome}</span>`;
    const input = document.createElement("input");
    input.type = "file";
    input.name = campo;
    input.accept = "application/pdf";
    label.appendChild(input);
    container.appendChild(label);
  }
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
  if (sessionStorage.getItem(SENHA_KEY)) {
    mostrarFormulario();
  }

  document.getElementById("btn-entrar").addEventListener("click", () => {
    const senha = document.getElementById("senha-admin").value;
    if (!senha) return;
    sessionStorage.setItem(SENHA_KEY, senha);
    mostrarFormulario();
  });
}

function initFormulario() {
  const form = document.getElementById("form-hino");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const status = document.getElementById("form-status");
    status.textContent = "Salvando...";

    const dados = new FormData(form);
    dados.set("senha", sessionStorage.getItem(SENHA_KEY) || "");

    try {
      const resposta = await fetch(`${API_BASE}/adicionar_hino`, {
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

      status.textContent = "Hino salvo!";
      form.reset();
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
initSenha();
initFormulario();
