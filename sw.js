// O SDK do OneSignal (notificação push de hino novo) precisa injetar os
// próprios listeners de "push"/"notificationclick" nesse mesmo arquivo —
// eles não brigam com os listeners abaixo porque escutam eventos diferentes.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// Service Worker do OFIP & CVS.
//
// Três caches, cada um com uma lógica diferente porque os dados são
// diferentes:
// - "shell" (versionado): HTML/CSS/JS/ícones do app. Cache primeiro,
//   porque só muda quando a gente publica uma versão nova — e quando
//   muda, o nome do cache muda junto, então o antigo é descartado sozinho.
// - "dados" (estável, nunca é limpo automaticamente): resposta do
//   listar_hinos. Rede primeiro — se tiver sinal, sempre busca a lista
//   atualizada; se não tiver, usa a última lista que o naipe da pessoa
//   já viu.
// - "arquivos" (estável): PDFs e áudios já abertos pelo menos uma vez.
//   Cache primeiro, porque um PDF/áudio não muda depois de publicado —
//   uma vez aberto, fica disponível pra sempre, mesmo sem internet no
//   ensaio.

// IMPORTANTE: o navegador só percebe que existe uma versão nova do SW
// quando os BYTES deste arquivo mudam. Se eu editar catalogo.css/js e
// esquecer de bumpar essa versão aqui, o aviso de "tem versão nova"
// nunca aparece — quem já instalou fica preso na versão antiga pra
// sempre. Bumpar esse número a cada push que mexe em algo do shell.
const VERSAO_SHELL = "ofip-cvs-shell-v9";
const CACHE_DADOS = "ofip-cvs-dados";
const CACHE_ARQUIVOS = "ofip-cvs-arquivos";

const HOST_XANO = "x8ki-letl-twmt.n7.xano.io";
const HOSTS_EXTERNOS_ESTATICOS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"];

const ARQUIVOS_SHELL = [
  "./",
  "./index.html",
  "./pages/principal.html",
  "./pages/admin.html",
  "./css/tokens.css",
  "./css/base.css",
  "./css/login.css",
  "./css/catalogo.css",
  "./css/admin.css",
  "./js/login.js",
  "./js/catalogo.js",
  "./js/admin.js",
  "./js/api.js",
  "./js/categorias.js",
  "./js/naipes.js",
  "./js/tutorial.js",
  "./js/instalar.js",
  "./js/sw-registro.js",
  "./manifest.json",
  "./assets/logo/logo-combinado.png",
  "./assets/icons/cursor-note.svg",
  "./assets/icons/app/icon-192.png",
  "./assets/icons/app/icon-512.png",
  "./assets/icons/app/apple-touch-icon.png",
  "./assets/icons/app/favicon-32.png",
  "./assets/icons/app/favicon-16.png",
  "./assets/patterns/instrumentos-fundo.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO_SHELL)
      .then((cache) => cache.addAll(ARQUIVOS_SHELL))
      .catch((erro) => console.error("Falha ao preparar o cache do app:", erro))
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome.startsWith("ofip-cvs-shell-") && nome !== VERSAO_SHELL)
            .map((nome) => caches.delete(nome))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (evento) => {
  if (evento.data === "pular-espera") self.skipWaiting();
});

async function cachePrimeiro(requisicao, nomeCache) {
  const doCache = await caches.match(requisicao);
  if (doCache) return doCache;
  try {
    const daRede = await fetch(requisicao);
    if (daRede.ok) {
      const cache = await caches.open(nomeCache);
      cache.put(requisicao, daRede.clone());
    }
    return daRede;
  } catch (erro) {
    if (requisicao.mode === "navigate") {
      const paginaInicial = await caches.match("./index.html");
      if (paginaInicial) return paginaInicial;
    }
    throw erro;
  }
}

async function redePrimeiro(requisicao, nomeCache) {
  try {
    const daRede = await fetch(requisicao);
    if (daRede.ok) {
      const cache = await caches.open(nomeCache);
      cache.put(requisicao, daRede.clone());
    }
    return daRede;
  } catch (erro) {
    const doCache = await caches.match(requisicao);
    if (doCache) return doCache;
    throw erro;
  }
}

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  const url = new URL(evento.request.url);

  if (url.hostname === HOST_XANO) {
    if (url.pathname.includes("/listar_hinos")) {
      evento.respondWith(redePrimeiro(evento.request, CACHE_DADOS));
    } else if (url.pathname.includes("/pdf") || url.pathname.includes("/audio")) {
      evento.respondWith(cachePrimeiro(evento.request, CACHE_ARQUIVOS));
    }
    // admin_listar_hinos, adicionar_hino, editar_hino, excluir_hino: nunca
    // intercepta — sempre precisa ir na rede de verdade, com senha fresca.
    return;
  }

  if (HOSTS_EXTERNOS_ESTATICOS.includes(url.hostname) || url.origin === self.location.origin) {
    evento.respondWith(cachePrimeiro(evento.request, VERSAO_SHELL));
  }
});
