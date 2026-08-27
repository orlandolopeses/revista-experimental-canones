(function () {
  var CONTINENTES = {
    "america-do-sul": "América do Sul",
    "america-do-norte": "América do Norte",
    europa: "Europa",
    africa: "África",
    asia: "Ásia",
    oceania: "Oceania",
  };

  var rootSinais = document.getElementById("radar-sinais");
  var rootFiltros = document.getElementById("radar-filtros");
  var rootClips = document.getElementById("radar-clips");
  var meta = document.getElementById("radar-meta");
  if (!rootClips) return;

  function formatDate(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1];
  }

  function formatStamp(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  fetch("sinais.json")
    .then(function (res) {
      if (!res.ok) throw new Error("sinais");
      return res.json();
    })
    .then(function (data) {
      if (meta) {
        meta.textContent =
          data.clippings_n +
          " clippings de " +
          data.fontes_ok +
          " feeds, gerados em " +
          formatStamp(data.gerado) +
          ". Só o que o veículo já publicou no RSS. TLS, LARB, Sydney Review e Australian Book Review seguem leitura no site.";
      }

      rootSinais.hidden = false;
      (data.sinais || []).forEach(function (sinal) {
        var card = el("article", "radar-sinal is-" + sinal.tipo);
        card.appendChild(el("p", "eyebrow", sinal.tipo));
        card.appendChild(el("h2", "", sinal.titulo));
        card.appendChild(el("p", "", sinal.texto));
        rootSinais.appendChild(card);
      });

      var filtroAtivo = "todos";
      var filtros = [{ id: "todos", label: "Todos" }].concat(
        Object.keys(CONTINENTES).map(function (id) {
          return { id: id, label: CONTINENTES[id] };
        })
      );

      function pintar() {
        rootFiltros.querySelectorAll("button").forEach(function (btn) {
          btn.setAttribute("aria-pressed", btn.dataset.filtro === filtroAtivo ? "true" : "false");
        });
        rootClips.innerHTML = "";
        var lista = (data.clippings || []).filter(function (clip) {
          return filtroAtivo === "todos" || clip.continente === filtroAtivo;
        });
        lista.forEach(function (clip) {
          var row = el("article", "note-row");
          var time = document.createElement("time");
          time.dateTime = clip.data || "";
          time.textContent = formatDate(clip.data) || clip.canal;
          row.appendChild(time);
          var body = document.createElement("div");
          body.appendChild(el("p", "note-kicker", CONTINENTES[clip.continente] + " · " + clip.fonte));
          var h2 = el("h2", "");
          var a = document.createElement("a");
          a.href = clip.url;
          a.rel = "noopener noreferrer";
          a.textContent = clip.titulo;
          h2.appendChild(a);
          body.appendChild(h2);
          if (clip.resumo) body.appendChild(el("p", "", clip.resumo));
          var gestos = el("p", "radar-gestos");
          (clip.gestos || []).forEach(function (g) {
            gestos.appendChild(el("span", "", g));
          });
          body.appendChild(gestos);
          row.appendChild(body);
          rootClips.appendChild(row);
        });
        if (!lista.length) {
          rootClips.appendChild(el("p", "prose", "Nenhum clipping neste recorte."));
        }
      }

      rootFiltros.hidden = false;
      filtros.forEach(function (item) {
        var btn = el("button", "", item.label);
        btn.type = "button";
        btn.dataset.filtro = item.id;
        btn.addEventListener("click", function () {
          filtroAtivo = item.id;
          pintar();
        });
        rootFiltros.appendChild(btn);
      });
      pintar();
    })
    .catch(function () {
      rootClips.appendChild(
        el("p", "prose", "O radar não carregou. Rode python3 miner/minerar.py e recarregue.")
      );
    });
})();
