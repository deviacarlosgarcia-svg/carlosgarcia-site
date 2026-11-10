// carlosgarcia.tech — simulador de fluxos (ilustrativo, roda só no navegador, nada é enviado)
(function () {
  "use strict";

  var CENARIOS = {
    orcamento: {
      titulo: "Orçamentos no WhatsApp",
      passos: [
        ["WhatsApp", "Mensagem chega", "“Quanto fica alugar 2 malas por 10 dias?”"],
        ["IA", "Entende o pedido", "2 itens · 10 dias · bairro informado"],
        ["Planilha", "Calcula preço e frete", "Tabela de preços + taxa da região"],
        ["WhatsApp", "Responde o cliente", "Orçamento com link de pagamento"],
        ["Telegram", "Avisa você", "Novo orçamento registrado"]
      ],
      resultado: "Cliente respondido sem ninguém digitar nada."
    },
    leads: {
      titulo: "Leads do site",
      passos: [
        ["Formulário", "Contato chega pelo site", "“Preciso de um sistema para agendar consultas”"],
        ["IA", "Lê a necessidade", "Clínica · urgência alta · pediu orçamento"],
        ["IA", "Classifica o lead", "Lead quente"],
        ["Planilha", "Registra o contato", "Nome, necessidade e classificação"],
        ["E-mail", "Avisa a equipe", "Ligar hoje: lead quente"]
      ],
      resultado: "Sua equipe fala primeiro com quem está pronto para comprar."
    },
    relatorio: {
      titulo: "Relatório semanal",
      passos: [
        ["Agenda", "Toda segunda às 8h", "Execução programada"],
        ["ERP", "Busca as vendas da semana", "Pedidos, valores e vendedores"],
        ["n8n", "Calcula os indicadores", "Total, ticket médio e variação"],
        ["Planilha", "Atualiza o painel", "Gráficos da semana atualizados"],
        ["E-mail", "Envia para a diretoria", "Relatório pronto às 8h01"]
      ],
      resultado: "O relatório chega pronto, sem ninguém montar planilha."
    },
    cobranca: {
      titulo: "Cobrança de clientes",
      passos: [
        ["Agenda", "3 dias antes do vencimento", "Verificação diária"],
        ["Financeiro", "Busca boletos em aberto", "Clientes com vencimento próximo"],
        ["WhatsApp", "Envia o lembrete", "Mensagem com o link de pagamento"],
        ["Webhook", "Pagamento confirmado", "Aviso automático do banco"],
        ["Financeiro", "Baixa o título", "Conta marcada como paga"]
      ],
      resultado: "Menos atraso e nenhuma cobrança feita à mão."
    },
    nota: {
      titulo: "Nota fiscal automática",
      passos: [
        ["Loja/ERP", "Venda fechada", "Pedido aprovado e pago"],
        ["n8n", "Monta os dados da nota", "Cliente, itens, impostos e CFOP"],
        ["API", "Emite a NF-e", "Emissor fiscal autoriza na Sefaz"],
        ["E-mail", "Envia ao cliente", "PDF e XML da nota"],
        ["Financeiro", "Registra a venda", "Nota vinculada ao pedido"]
      ],
      resultado: "A nota sai junto com a venda, sem digitação."
    },
    cadastro: {
      titulo: "Cadastro entre sistemas",
      passos: [
        ["CRM", "Venda fechada no CRM", "Novo cliente cadastrado"],
        ["n8n", "Valida os dados", "CPF/CNPJ, e-mail e endereço conferidos"],
        ["ERP", "Cria o cliente no ERP", "Sem digitar duas vezes"],
        ["Planilha", "Registra o histórico", "Quem, quando e de onde veio"],
        ["E-mail", "Confirma para a equipe", "Cadastro concluído nos dois sistemas"]
      ],
      resultado: "Os dados passam de um sistema para o outro sem retrabalho."
    }
  };

  var REGRAS = [
    [/nota fiscal|nf-?e|\bnfs?\b|emitir nota/i, "nota"],
    [/cobr|boleto|inadimpl|venciment|fatura/i, "cobranca"],
    [/relat|indicador|dashboard|painel|semanal|mensal/i, "relatorio"],
    [/whats|orçament|orcament|cotaç|cotac|preço|preco/i, "orcamento"],
    [/cadastr|erp|crm|sistema|integr|digit|planilha/i, "cadastro"],
    [/lead|formul|contato|site|cliente novo|qualific|atendiment/i, "leads"]
  ];

  function generico(texto) {
    var t = texto.length > 60 ? texto.slice(0, 57) + "…" : texto;
    return {
      titulo: t,
      passos: [
        ["Gatilho", "O evento acontece", "“" + t + "”"],
        ["IA", "Entende o que fazer", "Interpreta o pedido e os dados"],
        ["n8n", "Executa a tarefa", "Nos sistemas que você já usa"],
        ["Planilha", "Registra o resultado", "Histórico para acompanhar"],
        ["E-mail", "Avisa você", "Só quando precisar de uma pessoa"]
      ],
      resultado: "Um fluxo assim é montado depois de entender a sua rotina."
    };
  }

  var form = document.getElementById("sim-form");
  if (!form) return;
  var input = document.getElementById("sim-input");
  var flow = document.getElementById("sim-flow");
  var title = document.getElementById("sim-title");
  var result = document.getElementById("sim-result");
  var chips = form.querySelectorAll("[data-cenario]");
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];
  var iniciado = false;

  function limpar() { timers.forEach(clearTimeout); timers = []; }

  function marcar(chave) {
    Array.prototype.forEach.call(chips, function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-cenario") === chave ? "true" : "false");
    });
  }

  function no(passo) {
    var li = document.createElement("li");
    li.className = "sim__node";
    var tag = document.createElement("span"); tag.className = "node-tag"; tag.textContent = passo[0];
    var body = document.createElement("span"); body.className = "sim__body";
    var b = document.createElement("strong"); b.textContent = passo[1];
    var d = document.createElement("span"); d.className = "sim__detail"; d.textContent = passo[2];
    var st = document.createElement("span"); st.className = "sim__status"; st.setAttribute("aria-hidden", "true");
    body.appendChild(b); body.appendChild(d);
    li.appendChild(tag); li.appendChild(body); li.appendChild(st);
    return li;
  }

  function rodar(c, chave) {
    limpar();
    marcar(chave || "");
    title.textContent = c.titulo;
    flow.innerHTML = "";
    result.hidden = true;
    var itens = c.passos.map(no);
    itens.forEach(function (li) { flow.appendChild(li); });

    if (calmo) {
      itens.forEach(function (li) { li.classList.add("is-done"); });
      mostrarResultado(c, itens.length);
      return;
    }
    var passo = 650;
    itens.forEach(function (li, i) {
      timers.push(setTimeout(function () { li.classList.add("is-on", "is-run"); }, i * passo));
      timers.push(setTimeout(function () { li.classList.remove("is-run"); li.classList.add("is-done"); }, i * passo + passo - 120));
    });
    timers.push(setTimeout(function () { mostrarResultado(c, itens.length); }, itens.length * passo));
  }

  function mostrarResultado(c, n) {
    result.textContent = n + " etapas concluídas. " + c.resultado;
    result.hidden = false;
  }

  function escolher(texto) {
    var t = (texto || "").trim();
    if (!t) return rodar(CENARIOS.orcamento, "orcamento");
    for (var i = 0; i < REGRAS.length; i++) {
      if (REGRAS[i][0].test(t)) {
        var k = REGRAS[i][1];
        var c = CENARIOS[k];
        return rodar({ titulo: t.length > 60 ? c.titulo : t, passos: c.passos, resultado: c.resultado }, k);
      }
    }
    rodar(generico(t), "");
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); iniciado = true; escolher(input.value); });
  Array.prototype.forEach.call(chips, function (c) {
    c.addEventListener("click", function () {
      var k = c.getAttribute("data-cenario");
      input.value = "";
      iniciado = true;
      rodar(CENARIOS[k], k);
    });
  });

  // Primeira execução: começa quando o simulador aparece na tela (se o visitante ainda não usou)
  var alvo = document.getElementById("simulador");
  function iniciar() { if (!iniciado) { iniciado = true; rodar(CENARIOS.orcamento, "orcamento"); } }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { iniciar(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(alvo);
  } else { iniciar(); }
})();
