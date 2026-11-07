// carlosgarcia.tech — menu mobile e formulário de contato
(function () {
  "use strict";

  // Menu mobile
  var toggle = document.querySelector(".nav__toggle");
  var nav = document.getElementById("menu");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Ano no rodapé
  var year = document.getElementById("ano");
  if (year) year.textContent = new Date().getFullYear();

  // Formulário de contato
  var form = document.getElementById("form-contato");
  if (!form) return;
  var status = form.querySelector(".form__status");
  var button = form.querySelector('button[type="submit"]');
  var webhook = (form.getAttribute("data-webhook") || "").trim();
  var fallbackEmail = form.getAttribute("data-email") || "";

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = "form__status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var data = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      mensagem: form.mensagem.value.trim(),
      website: form.website.value, // honeypot: humanos deixam vazio
      consentimento: form.consentimento.checked,
      origem: "carlosgarcia.tech",
      enviado_em: new Date().toISOString()
    };

    // Robô preencheu o campo invisível: finge sucesso e não envia nada
    if (data.website) { setStatus("Mensagem enviada. Obrigado!", "ok"); form.reset(); return; }

    // Sem webhook configurado: abre o e-mail do visitante com a mensagem pronta
    if (!webhook) {
      var assunto = encodeURIComponent("Contato pelo site — " + data.nome);
      var corpo = encodeURIComponent(data.mensagem + "\n\n" + data.nome + " — " + data.email);
      window.location.href = "mailto:" + fallbackEmail + "?subject=" + assunto + "&body=" + corpo;
      setStatus("Abrimos seu aplicativo de e-mail com a mensagem pronta.", "ok");
      return;
    }

    button.disabled = true;
    setStatus("Enviando...", "");
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) {
        if (r.status === 400) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            setStatus(j.erro || "Confira os campos e tente de novo.", "err");
            return "handled";
          });
        }
        if (!r.ok) throw new Error("HTTP " + r.status);
        return "ok";
      })
      .then(function (res) {
        if (res === "handled") return;
        setStatus("Mensagem enviada. Obrigado! Retorno em breve.", "ok");
        form.reset();
      })
      .catch(function () {
        setStatus("Não foi possível enviar agora. Tente pelo WhatsApp ou e-mail abaixo.", "err");
      })
      .finally(function () { button.disabled = false; });
  });
})();
