
(function () {
  "use strict";

  var STORAGE_KEY = "controle-carrinhos:registros";
  var LAST_COPY_KEY = "controle-carrinhos:ultima-copia";
  var COLLECTION = "registros";

  var cartOptionsEl = document.getElementById("cartOptions");
  var selectedCart = null;
  var activeTab = "hoje";
  var searchTerm = "";
  var records = [];
  var isOnline = false;
  var db = null;

  // ---------- mode detection: Firebase (online) vs localStorage (local) ----------
  function firebaseConfigured() {
    var c = window.FIREBASE_CONFIG;
    return !!(c && c.apiKey && c.apiKey.indexOf("COLE_AQUI") === -1 && c.projectId && c.projectId.indexOf("COLE_AQUI") === -1);
  }
function initStorage() {
  if (firebaseConfigured() && window.firebase) {
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);

      firebase.auth().signInAnonymously()
        .then(function () {
          db = firebase.firestore();
          isOnline = true;
          applyModeUI();

          db.collection(COLLECTION).orderBy("saidaEm", "desc").onSnapshot(
            function (snapshot) {
              records = snapshot.docs.map(function (d) {
                var data = d.data();
                data.id = d.id;
                return data;
              });

              localStorage.setItem(LAST_COPY_KEY, new Date().toISOString());
              render();
            },
            function (err) {
              console.error("Erro ao ler Firestore.", err);
              isOnline = false;
              applyModeUI();
              records = loadLocal();
              render();
            }
          );
        })
        .catch(function (err) {
          console.error("Falha na autenticação anônima.", err);
          isOnline = false;
          applyModeUI();
          records = loadLocal();
          render();
        });

      return;
    } catch (e) {
      console.error("Falha ao iniciar Firebase.", e);
    }
  }

  isOnline = false;
  applyModeUI();
  records = loadLocal();
  render();
}
  

  function applyModeUI() {
    var banner = document.getElementById("configBanner");
    var line1 = document.getElementById("footerLine1");
    var line2 = document.getElementById("footerLine2");
    var dayPanelText = document.getElementById("dayPanelText");
    if (isOnline) {
      banner.style.display = "none";
      line1.textContent = "Portaria · Registros compartilhados";
      line2.textContent = "Acesso livre pelo link. Requer internet.";
      dayPanelText.textContent = "Dados salvos online e sincronizados em tempo real entre todos os aparelhos que acessarem este link.";
    } else {
      banner.style.display = "block";
      line1.textContent = "Portaria · Registros neste aparelho";
      line2.textContent = "Funciona sem internet depois de instalado.";
      dayPanelText.textContent = "Dados salvos neste aparelho e cópias por movimentação, organizadas por dia. A mudança de data nunca apaga empréstimos.";
    }
  }

  // ---------- local storage fallback ----------
  function loadLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(LAST_COPY_KEY, new Date().toISOString());
  }

  // ---------- helpers ----------
  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function fmtDateTime(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtTime(iso) {
    var d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDayLabel(iso) {
    var d = new Date(iso);
    var today = todayKey();
    var yestKey = todayKey(new Date(Date.now() - 86400000));
    var key = todayKey(d);
    if (key === today) return "Hoje";
    if (key === yestKey) return "Ontem";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function showToast(msg) {
    var toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  // ---------- cart option selection ----------
  cartOptionsEl.addEventListener("click", function (e) {
    var opt = e.target.closest(".cart-option");
    if (!opt) return;
    Array.prototype.forEach.call(cartOptionsEl.children, function (c) {
      c.classList.remove("selected");
    });
    opt.classList.add("selected");
    selectedCart = opt.getAttribute("data-value");
  });

  // ---------- tabs ----------
  document.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeTab = btn.getAttribute("data-tab");
      render();
    });
  });

  // ---------- search ----------
  document.getElementById("searchInput").addEventListener("input", function (e) {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  // ---------- refresh ----------
  document.getElementById("refreshBtn").addEventListener("click", function () {
    var icon = document.getElementById("refreshBtn");
    icon.classList.add("spin");
    if (!isOnline) records = loadLocal();
    render();
    setTimeout(function () { icon.classList.remove("spin"); }, 650);
  });

  // ---------- form submit ----------
  document.getElementById("loanForm").addEventListener("submit", function (e) {
    e.preventDefault();

    if (!selectedCart) {
      showToast("Selecione qual carrinho está saindo.");
      return;
    }
    var entregador = document.getElementById("entregador").value.trim();
    var destino = document.getElementById("destino").value.trim();
    var telefone = document.getElementById("telefone").value.trim();
    var colaborador = document.getElementById("colaborador").value.trim();
    var quantidade = parseInt(document.getElementById("quantidade").value, 10);
    if (!quantidade || quantidade < 1) quantidade = 1;

    if (!entregador || !destino || !colaborador) {
      showToast("Preencha os campos obrigatórios.");
      return;
    }

    var record = {
      carrinho: selectedCart,
      quantidade: quantidade,
      quantidadeDevolvida: 0,
      entregador: entregador,
      destino: destino,
      telefone: telefone,
      colaborador: colaborador,
      saidaEm: new Date().toISOString(),
      devolvidoEm: null
    };

    if (isOnline) {
      db.collection(COLLECTION).add(record).catch(function (err) {
        console.error(err);
        showToast("Não foi possível salvar online agora.");
      });
    } else {
      record.id = uid();
      records.unshift(record);
      saveLocal();
      render();
    }

    e.target.reset();
    document.getElementById("quantidade").value = 1;
    selectedCart = null;
    Array.prototype.forEach.call(cartOptionsEl.children, function (c) {
      c.classList.remove("selected");
    });

    showToast("Empréstimo registrado.");
  });

  // ---------- return carts (supports partial returns) ----------
  function registerReturn(id, qty) {
    var rec = records.find(function (r) { return r.id === id; });
    if (!rec) return;

    var total = rec.quantidade || 1;
    var jaDevolvido = rec.quantidadeDevolvida || 0;
    var restante = total - jaDevolvido;

    qty = parseInt(qty, 10);
    if (!qty || qty < 1) qty = restante;
    if (qty > restante) qty = restante;

    var novaQtdDevolvida = jaDevolvido + qty;
    var completo = novaQtdDevolvida >= total;
    var now = new Date().toISOString();

    var updates = { quantidadeDevolvida: novaQtdDevolvida };
    if (completo) updates.devolvidoEm = now;

    if (isOnline) {
      db.collection(COLLECTION).doc(id).update(updates).catch(function (err) {
        console.error(err);
        showToast("Não foi possível registrar a devolução agora.");
      });
    } else {
      rec.quantidadeDevolvida = novaQtdDevolvida;
      if (completo) rec.devolvidoEm = now;
      saveLocal();
      render();
    }

    if (completo) {
      showToast("Devolução concluída.");
    } else {
      showToast(qty + " carrinho(s) devolvido(s). Restam " + (total - novaQtdDevolvida) + ".");
    }
  }

  // ---------- download history (CSV) ----------
  document.getElementById("downloadBtn").addEventListener("click", function () {
    if (!records.length) {
      showToast("Ainda não há registros para baixar.");
      return;
    }
    var header = ["Carrinho", "Quantidade", "Devolvidos", "Restam", "Entregador", "Destino", "Telefone", "Colaborador", "Saída", "Devolução concluída", "Status"];
    var rows = records.map(function (r) {
      var total = r.quantidade || 1;
      var devolvidos = r.quantidadeDevolvida || 0;
      var restante = total - devolvidos;
      var status = restante <= 0 ? "Devolvido" : (devolvidos > 0 ? "Parcial" : "Aguardando devolução");
      return [
        r.carrinho,
        total,
        devolvidos,
        restante,
        r.entregador,
        r.destino,
        r.telefone || "",
        r.colaborador,
        fmtDateTime(r.saidaEm),
        r.devolvidoEm ? fmtDateTime(r.devolvidoEm) : "",
        status
      ];
    });
    var csv = [header].concat(rows).map(function (row) {
      return row.map(function (v) {
        v = String(v).replace(/"/g, '""');
        return '"' + v + '"';
      }).join(";");
    }).join("\r\n");

    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "historico-carrinhos-" + todayKey().replace(/-/g, "") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ---------- icons for empty state / list ----------
  var boxIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="m12 13 4.5-2.5M9 6l6 3.4"/><path d="m9.5 15.5 2 2 3.5-3.5"/></svg>';

  // ---------- filtering per tab ----------
  function getFiltered() {
    var todK = todayKey();
    var list = records.slice();

    if (activeTab === "hoje") {
      list = list.filter(function (r) { return todayKey(new Date(r.saidaEm)) === todK; });
    } else if (activeTab === "pendentes") {
      list = list.filter(function (r) { return !r.devolvidoEm; });
    } else if (activeTab === "historico") {
      list = list.filter(function (r) { return !!r.devolvidoEm; });
    }

    if (searchTerm) {
      list = list.filter(function (r) {
        return (r.entregador + " " + r.destino + " " + r.carrinho + " " + r.colaborador)
          .toLowerCase()
          .indexOf(searchTerm) !== -1;
      });
    }

    return list;
  }

  function recordCard(r) {
    var total = r.quantidade || 1;
    var devolvidos = r.quantidadeDevolvida || 0;
    var restante = total - devolvidos;
    var completo = restante <= 0;

    var badge = completo
      ? '<span class="badge done">Devolvido</span>'
      : (devolvidos > 0
        ? '<span class="badge partial">Parcial</span>'
        : '<span class="badge waiting">Aguardando</span>');

    var qtyLabel = total > 1 ? (total + ' carrinhos') : '1 carrinho';

    var meta = '<b>' + escapeHtml(r.entregador) + '</b> · ' + escapeHtml(r.destino);
    if (r.telefone) meta += ' · ' + escapeHtml(r.telefone);
    meta += '<br/>Saída às ' + fmtTime(r.saidaEm) + ' — registrado por ' + escapeHtml(r.colaborador);
    if (devolvidos > 0 && !completo) meta += '<br/>Devolvidos: ' + devolvidos + ' de ' + total + ' — restam ' + restante;
    if (completo) meta += '<br/>Devolução concluída às ' + fmtTime(r.devolvidoEm);

    var controls = completo
      ? ""
      : '<div class="return-row">' +
          '<input type="number" class="return-qty" data-id="' + r.id + '" min="1" max="' + restante + '" value="' + restante + '" />' +
          '<button class="return-btn" data-id="' + r.id + '">Registrar devolução</button>' +
        '</div>';

    return (
      '<div class="record">' +
      '<div class="record-top"><span class="record-cart">' + escapeHtml(r.carrinho) + ' · ' + qtyLabel + '</span>' + badge + '</div>' +
      '<div class="record-meta">' + meta + '</div>' +
      controls +
      '</div>'
    );
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var listArea = document.getElementById("listArea");
    var list = getFiltered();

    // stats (contam CARRINHOS, não apenas registros — um registro pode ter várias unidades)
    var todK = todayKey();
    var today = records.filter(function (r) { return todayKey(new Date(r.saidaEm)) === todK; });
    var totalToday = today.reduce(function (sum, r) { return sum + (r.quantidade || 1); }, 0);

    var waitingRecords = records.filter(function (r) { return (r.quantidadeDevolvida || 0) < (r.quantidade || 1); });
    var totalWaiting = waitingRecords.reduce(function (sum, r) { return sum + ((r.quantidade || 1) - (r.quantidadeDevolvida || 0)); }, 0);

    var pendingOldRecords = waitingRecords.filter(function (r) { return todayKey(new Date(r.saidaEm)) !== todK; });
    var totalPendingOld = pendingOldRecords.reduce(function (sum, r) { return sum + ((r.quantidade || 1) - (r.quantidadeDevolvida || 0)); }, 0);

    document.getElementById("statToday").textContent = totalToday;
    document.getElementById("statWaiting").textContent = totalWaiting;
    document.getElementById("statPending").textContent = totalPendingOld;
    document.getElementById("pendingSub").textContent = totalPendingOld
      ? totalPendingOld + " carrinho(s) de dias anteriores ainda não voltou(aram)"
      : "Nenhuma pendência anterior confirmada";

    // list
    if (!list.length) {
      var emptyCopy = {
        hoje: ["O dia começa aqui", "Preencha o formulário para registrar a retirada de um carrinho."],
        pendentes: ["Nada pendente", "Todos os carrinhos emprestados já foram devolvidos."],
        historico: ["Sem histórico ainda", "As devoluções registradas vão aparecer aqui."]
      }[activeTab];
      listArea.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-icon">' + boxIconSvg + '</div>' +
        '<div class="empty-title">' + emptyCopy[0] + '</div>' +
        '<p class="empty-sub">' + emptyCopy[1] + '</p>' +
        '</div>';
    } else if (activeTab === "historico") {
      var groups = [];
      var byKey = {};
      list.forEach(function (r) {
        var k = todayKey(new Date(r.devolvidoEm));
        if (!byKey[k]) {
          byKey[k] = { label: fmtDayLabel(r.devolvidoEm), items: [] };
          groups.push(byKey[k]);
        }
        byKey[k].items.push(r);
      });
      listArea.innerHTML = groups.map(function (g) {
        return '<div class="day-header">' + g.label.toUpperCase() + '</div>' +
          '<div class="record-list">' + g.items.map(recordCard).join("") + '</div>';
      }).join("");
    } else {
      listArea.innerHTML = '<div class="record-list">' + list.map(recordCard).join("") + '</div>';
    }

    listArea.querySelectorAll(".return-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var qtyInput = listArea.querySelector('.return-qty[data-id="' + id + '"]');
        var qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
        registerReturn(id, qty);
      });
    });

    document.getElementById("listCount").textContent = list.length + " registro" + (list.length === 1 ? "" : "s") + " nesta lista";

    var lastCopy = localStorage.getItem(LAST_COPY_KEY);
    document.getElementById("lastCopyMeta").textContent = lastCopy
      ? "Última movimentação copiada: " + fmtDateTime(lastCopy)
      : "Última movimentação copiada: —";
  }

  // auto refresh every 30s only needed for local mode (online mode updates live via onSnapshot)
  setInterval(function () {
    if (!isOnline) {
      records = loadLocal();
      render();
    }
  }, 30000);

  // ---------- install prompt ----------
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  document.getElementById("installBtn").addEventListener("click", function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () { deferredPrompt = null; });
    } else {
      showToast("Use o menu do navegador para instalar o app.");
    }
  });

  initStorage();
})();

  
 
