import { NAIPES } from "./naipes.js";

const THEME_KEY = "ofipCvsTema";
const USER_KEY = "ofipCvsUsuario";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(current);
  });
}

function populateNaipe(departamento) {
  const naipeSelect = document.getElementById("naipe");
  naipeSelect.innerHTML = "";

  const options = departamento === "orquestra" ? NAIPES.orquestra : NAIPES.coral;
  if (!options) {
    naipeSelect.disabled = true;
    naipeSelect.appendChild(new Option("Selecione o departamento primeiro", ""));
    return;
  }

  naipeSelect.disabled = false;
  naipeSelect.appendChild(new Option("Selecione...", ""));
  for (const nome of options) {
    naipeSelect.appendChild(new Option(nome, nome));
  }
}

function showError(fieldId, message) {
  document.querySelector(`[data-error-for="${fieldId}"]`).textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

function initForm() {
  const departamentoSelect = document.getElementById("departamento");
  departamentoSelect.addEventListener("change", () => {
    populateNaipe(departamentoSelect.value);
  });

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const nome = document.getElementById("nome").value.trim();
    const departamento = departamentoSelect.value;
    const naipe = document.getElementById("naipe").value;

    let valid = true;
    if (!nome) {
      showError("nome", "Digite seu nome.");
      valid = false;
    }
    if (!departamento) {
      showError("departamento", "Escolha um departamento.");
      valid = false;
    }
    if (!naipe) {
      showError("naipe", "Escolha seu naipe ou instrumento.");
      valid = false;
    }
    if (!valid) return;

    localStorage.setItem(USER_KEY, JSON.stringify({ nome, departamento, naipe }));
    window.location.href = "pages/principal.html";
  });
}

initTheme();
initForm();
