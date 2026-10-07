// Notificação push de hino novo (via OneSignal). O SDK deles já foi
// carregado por uma tag <script> direto no HTML da página — aqui só liga
// o botão do menu que pede permissão, usando o OneSignalDeferred que o
// próprio SDK deles recomenda pra não depender de ordem de carregamento.

export function inicializarBotaoNotificacoes(botao) {
  if (!("Notification" in window)) return; // navegador não suporta

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push((OneSignal) => {
    function atualizar() {
      botao.hidden = OneSignal.Notifications.permission === true;
    }
    atualizar();

    botao.addEventListener("click", async () => {
      await OneSignal.Notifications.requestPermission();
      atualizar();
    });
  });
}
