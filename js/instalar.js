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
  document.dispatchEvent(new Event("pwa-instalavel"));
});

// Dispara quando o Android instala de fato (ex: pelo prompt nativo do
// Chrome, fora do nosso botão). É o gatilho pra sumir o item do menu sem
// precisar esperar a pessoa recarregar a página.
window.addEventListener("appinstalled", () => {
  promptEvento = null;
  document.dispatchEvent(new Event("pwa-instalado"));
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

function podeInstalar() {
  return !jaInstalado() && (promptEvento !== null || ehIOS());
}

// permanente=true: veio de um clique explícito no menu, não marca o
// convite automático como "já visto" (são coisas independentes).
function criarBanner(permanente) {
  const banner = document.createElement("div");
  banner.className = "instalar-banner";

  function fechar() {
    if (!permanente) localStorage.setItem(CONVITE_KEY, "1");
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

export function convidarInstalar() {
  if (localStorage.getItem(CONVITE_KEY) === "1") return;
  if (!podeInstalar()) return;
  criarBanner(false);
}

// Liga o item "Instalar app" do menu: só aparece se ainda faz sentido
// instalar, e some sozinho assim que a pessoa instala (Android) ou quando
// a página percebe que já está rodando em modo standalone.
export function inicializarBotaoMenuInstalar(botao) {
  function atualizar() {
    botao.hidden = !podeInstalar();
  }
  atualizar();
  document.addEventListener("pwa-instalavel", atualizar);
  document.addEventListener("pwa-instalado", atualizar);

  botao.addEventListener("click", () => criarBanner(true));
}
