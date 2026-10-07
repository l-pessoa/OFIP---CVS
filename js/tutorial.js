// Tutorial guiado reutilizável: destaca um elemento real da tela por vez
// (sombra enorme ao redor dele cria o efeito de "spotlight", sem precisar
// de canvas nem biblioteca) e mostra um cartãozinho explicando o que é.
// Usado tanto no catálogo quanto na página de Maestros.

function svgSeta() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
}

export function tutorialVisto(chave) {
  return localStorage.getItem(chave) === "1";
}

export function marcarTutorialVisto(chave) {
  localStorage.setItem(chave, "1");
}

export function iniciarTutorial(chave, passos, aoFinalizar) {
  if (!passos || passos.length === 0) return;

  const overlay = document.createElement("div");
  overlay.className = "tutorial-overlay";

  const cartao = document.createElement("div");
  cartao.className = "tutorial-cartao";

  document.body.appendChild(overlay);
  document.body.appendChild(cartao);

  let indice = 0;
  let alvoAtual = null;

  function limparAlvo() {
    if (alvoAtual) alvoAtual.classList.remove("tutorial-alvo");
    alvoAtual = null;
  }

  function posicionar() {
    const margem = 12;
    const rect = alvoAtual
      ? alvoAtual.getBoundingClientRect()
      : { top: window.innerHeight / 2 - 20, bottom: window.innerHeight / 2 + 20, left: window.innerWidth / 2 - 140, right: window.innerWidth / 2 + 140 };

    const larguraCartao = cartao.offsetWidth;
    const alturaCartao = cartao.offsetHeight;

    let top = rect.bottom + margem;
    if (top + alturaCartao > window.innerHeight - margem) {
      top = rect.top - alturaCartao - margem;
    }
    top = Math.min(Math.max(top, margem), window.innerHeight - alturaCartao - margem);

    let left = rect.left;
    left = Math.min(Math.max(left, margem), window.innerWidth - larguraCartao - margem);

    cartao.style.top = `${top}px`;
    cartao.style.left = `${left}px`;
  }

  function aoRedimensionar() {
    posicionar();
  }

  function finalizar() {
    limparAlvo();
    overlay.remove();
    cartao.remove();
    window.removeEventListener("resize", aoRedimensionar);
    marcarTutorialVisto(chave);
    aoFinalizar?.();
  }

  function mostrarPasso() {
    limparAlvo();
    const passo = passos[indice];
    let alvo = passo.seletor ? document.querySelector(passo.seletor) : null;
    if (alvo) {
      const rect = alvo.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) alvo = null; // escondido no momento (ex: cabeçalho some com a cena)
    }

    if (alvo) {
      alvo.scrollIntoView({ block: "center", behavior: "auto" });
      alvo.classList.add("tutorial-alvo");
      alvoAtual = alvo;
    }

    const ultimo = indice === passos.length - 1;
    cartao.innerHTML = `
      <p class="tutorial-contador">${indice + 1} de ${passos.length}</p>
      <h3 class="tutorial-titulo">${passo.titulo}</h3>
      <p class="tutorial-texto">${passo.texto}</p>
      <div class="tutorial-acoes">
        <button type="button" class="tutorial-pular">Pular tutorial</button>
        <button type="button" class="tutorial-proximo">${ultimo ? "Entendi" : "Próximo"}${ultimo ? "" : svgSeta()}</button>
      </div>
    `;

    cartao.querySelector(".tutorial-pular").addEventListener("click", finalizar);
    cartao.querySelector(".tutorial-proximo").addEventListener("click", () => {
      if (ultimo) {
        finalizar();
      } else {
        indice++;
        mostrarPasso();
      }
    });

    requestAnimationFrame(posicionar);
  }

  window.addEventListener("resize", aoRedimensionar);
  mostrarPasso();
}
