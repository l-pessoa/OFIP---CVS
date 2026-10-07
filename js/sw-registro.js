// Registra o service worker e avisa quando tem versão nova pronta.
// caminhoSw é relativo à página que chama (sw.js na raiz, "../sw.js"
// quando chamado de dentro de pages/).

export function registrarServiceWorker(caminhoSw) {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register(caminhoSw).then((registro) => {
    registro.addEventListener("updatefound", () => {
      const novoWorker = registro.installing;
      if (!novoWorker) return;
      novoWorker.addEventListener("statechange", () => {
        if (novoWorker.state === "installed" && navigator.serviceWorker.controller) {
          mostrarAvisoAtualizacao(registro);
        }
      });
    });
  }).catch(() => {});

  let recarregando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recarregando) return;
    recarregando = true;
    window.location.reload();
  });
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
