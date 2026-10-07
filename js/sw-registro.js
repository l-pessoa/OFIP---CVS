// Registra o service worker e avisa quando tem versão nova pronta.
// caminhoSw é relativo à página que chama (sw.js na raiz, "../sw.js"
// quando chamado de dentro de pages/).

function ligarAvisoDeAtualizacao(registro) {
  registro.addEventListener("updatefound", () => {
    const novoWorker = registro.installing;
    if (!novoWorker) return;
    novoWorker.addEventListener("statechange", () => {
      if (novoWorker.state === "installed" && navigator.serviceWorker.controller) {
        mostrarAvisoAtualizacao(registro);
      }
    });
  });
}

function escutarTrocaDeControlador() {
  let recarregando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recarregando) return;
    recarregando = true;
    window.location.reload();
  });
}

export function registrarServiceWorker(caminhoSw) {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register(caminhoSw).then(ligarAvisoDeAtualizacao).catch(() => {});
  escutarTrocaDeControlador();
}

// Usado só na página do catálogo: lá o SDK do OneSignal já registra o
// Service Worker sozinho (com uma URL própria, cheia de query string).
// Se a gente TAMBÉM chamasse navigator.serviceWorker.register() aqui, o
// navegador veria duas "versões" concorrentes do mesmo sw.js e ficava
// preso num loop sem fim de "tem atualização nova" — foi exatamente o
// bug que apareceu depois de ligar o OneSignal. Em vez de registrar de
// novo, só escuta a registration que o OneSignal já criou.
export function observarAtualizacaoServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then(ligarAvisoDeAtualizacao).catch(() => {});
  escutarTrocaDeControlador();
}

function mostrarAvisoAtualizacao(registro) {
  if (document.querySelector(".atualizacao-banner")) return;

  const banner = document.createElement("div");
  banner.className = "atualizacao-banner";
  banner.innerHTML = `
    <p class="atualizacao-texto">Tem uma versão nova do app pronta</p>
    <button type="button" class="atualizacao-btn">Atualizar</button>
  `;
  banner.querySelector(".atualizacao-btn").addEventListener("click", () => {
    registro.waiting?.postMessage("pular-espera");
  });
  document.body.appendChild(banner);
}
