// Convite pra adicionar o app na tela inicial. No Android/Chrome dá pra
// instalar com um botão de verdade (captura o beforeinstallprompt, que
// precisa ser guardado cedo — por isso o listener fica aqui no topo do
// módulo, não dentro de uma função). No iOS o Safari não deixa disparar
// a instalação via código, então só mostra o passo a passo manual.

const CONVITE_KEY = "ofipCvsConviteInstalar";

let promptEvento = null;
window.addEventListener("beforeinstallprompt", (evento) => {
  evento.preventDefault();
  promptEvento = evento;
});

function jaInstalado() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function ehIOS() {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  // iPadOS 13+ manda user-agent de Mac por padrão — só dá pra diferenciar
  // de um Mac de verdade pela tela sensível ao toque.
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function convidarInstalar() {
  if (jaInstalado()) return;
  if (localStorage.getItem(CONVITE_KEY) === "1") return;
  if (!promptEvento && !ehIOS()) return;

  const banner = document.createElement("div");
  banner.className = "instalar-banner";

  function fechar() {
    localStorage.setItem(CONVITE_KEY, "1");
    banner.remove();
  }

  if (promptEvento) {
    banner.innerHTML = `
      <p class="instalar-titulo">Adiciona na tela inicial</p>
      <p class="instalar-texto">Acesso mais rápido, sem precisar abrir o navegador toda vez.</p>
      <div class="instalar-acoes">
        <button type="button" class="instalar-agora-nao">Agora não</button>
        <button type="button" class="instalar-btn">Instalar</button>
      </div>
    `;
    banner.querySelector(".instalar-agora-nao").addEventListener("click", fechar);
    banner.querySelector(".instalar-btn").addEventListener("click", async () => {
      const evento = promptEvento;
      promptEvento = null;
      fechar();
      evento.prompt();
    });
  } else {
    banner.innerHTML = `
      <p class="instalar-titulo">Adiciona na tela inicial</p>
      <p class="instalar-texto">Toque em <strong>Compartilhar</strong> (o quadrado com a seta pra cima) e depois em <strong>"Adicionar à Tela de Início"</strong> pra ter acesso rápido.</p>
      <div class="instalar-acoes">
        <button type="button" class="instalar-btn">Entendi</button>
      </div>
    `;
    banner.querySelector(".instalar-btn").addEventListener("click", fechar);
  }

  document.body.appendChild(banner);
}
