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

// No iPhone a barra do Safari (com o botão Compartilhar) fica embaixo; no
// iPad fica em cima. Usado só pra decidir pra qual lado a seta aponta.
function ehIPad() {
  return /ipad/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function svgSetaBaixo() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
}

function podeInstalar() {
  return !jaInstalado() && (promptEvento !== null || ehIOS());
}

// permanente=true: veio de um clique explícito no menu, não marca o
// convite automático como "já visto" (são coisas independentes).
function criarBanner(permanente) {
  const banner = document.createElement("div");
  banner.className = "instalar-banner";

  let elementosGuia = [];
  function fechar() {
    if (!permanente) localStorage.setItem(CONVITE_KEY, "1");
    banner.remove();
    elementosGuia.forEach((el) => el.remove());
  }

  if (promptEvento) {
    // Instalação de verdade (vira um app separado, com ícone próprio e
    // sem a barra do navegador) — por isso o título diz "Instalar", igual
    // ao botão do menu, e não "adicionar" (que é outra coisa: um atalho
    // que ainda abre dentro do navegador).
    banner.innerHTML = `
      <p class="instalar-titulo">Instalar o app</p>
      <p class="instalar-texto">Vira um app de verdade na sua tela inicial, sem a barra do navegador e sem precisar abrir o Chrome toda vez.</p>
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
    // A Apple não deixa nenhum site disparar a instalação por código — só
    // dá pra indicar onde a pessoa precisa tocar. O Compartilhar fica na
    // barra do Safari, embaixo no iPhone e em cima no iPad, então a seta
    // escurece o resto da tela e aponta pro lado certo, como um tutorial.
    const paraCima = ehIPad();
    banner.innerHTML = `
      <p class="instalar-titulo">Adiciona na tela inicial</p>
      <p class="instalar-texto">Toque em <strong>Compartilhar</strong> (o quadrado com a seta pra cima) e depois em <strong>"Adicionar à Tela de Início"</strong> pra ter acesso rápido.</p>
      <div class="instalar-acoes">
        <button type="button" class="instalar-btn">Entendi</button>
      </div>
    `;
    banner.querySelector(".instalar-btn").addEventListener("click", fechar);

    const fundo = document.createElement("div");
    fundo.className = "instalar-guia-fundo";
    fundo.addEventListener("click", fechar);

    const seta = document.createElement("div");
    seta.className = `instalar-guia-seta ${paraCima ? "instalar-guia-seta--cima" : "instalar-guia-seta--baixo"}`;
    seta.setAttribute("aria-hidden", "true");
    seta.innerHTML = svgSetaBaixo();

    elementosGuia = [fundo, seta];
    document.body.appendChild(fundo);
    document.body.appendChild(seta);
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
