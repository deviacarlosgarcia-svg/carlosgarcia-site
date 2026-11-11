// carlosgarcia.tech — métricas sem cookies (11/11/2026)
// Envia só: página, origem da campanha (utm), site de onde veio e o tipo de evento.
// Não usa cookies, não guarda nada no navegador e respeita "Não rastrear" e o controle global de privacidade.
(function () {
  "use strict";
  var URL_EVENTO = "https://n8n.carlosgarcia.tech/webhook/site-evento";
  var nav = window.navigator || {};
  if (nav.globalPrivacyControl === true || nav.doNotTrack === "1" || window.doNotTrack === "1") {
    window.cgEvento = function () {};
    return;
  }
  var q = new URLSearchParams(location.search);
  var base = {
    pagina: location.pathname,
    utm_source: q.get("utm_source") || "",
    utm_medium: q.get("utm_medium") || "",
    utm_campaign: q.get("utm_campaign") || "",
    referrer: document.referrer && document.referrer.indexOf(location.host) === -1 ? document.referrer : ""
  };

  function enviar(evento, detalhe) {
    var corpo = JSON.stringify({
      evento: evento, detalhe: detalhe || "", pagina: base.pagina,
      utm_source: base.utm_source, utm_medium: base.utm_medium, utm_campaign: base.utm_campaign, referrer: base.referrer
    });
    try {
      fetch(URL_EVENTO, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body: corpo });
    } catch (e) { /* métricas nunca atrapalham o site */ }
  }
  window.cgEvento = enviar;

  enviar("visita");

  // Cliques que levam ao assistente de IA
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="https://chat.carlosgarcia.tech"]') : null;
    if (a) enviar("assistente", a.getAttribute("data-onde") || "link");
  });
})();
