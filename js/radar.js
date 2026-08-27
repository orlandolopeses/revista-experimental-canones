(function () {
  var CONTINENTES = {
    "america-do-sul": "América do Sul",
    "america-do-norte": "América do Norte",
    europa: "Europa",
    africa: "África",
    asia: "Ásia",
    oceania: "Oceania",
  };

  var rootEntradas = document.getElementById("radar-entradas");
  var rootFiltros = document.getElementById("radar-filtros");
  var rootClips = document.getElementById("radar-clips");
  var meta = document.getElementById("radar-meta");
  var nota = document.getElementById("radar-nota");
  if (!rootEntradas) return;

  function formatDate(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
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
          "Varredura de " +
          formatStamp(data.gerado) +
          ". As entradas abaixo levam o trecho que o veículo já publicou no feed. Não substituem a leitura.";
      }
      var tecnicos = (data.sinais || []).filter(function (s) {
        return s.tipo === "tecnico" || s.tipo === "silencio";
      });
      if (nota && tecnicos.length) {
        nota.hidden = false;
        nota.textContent = tecnicos
          .map(function (s) {
            return s.titulo + ": " + s.texto;
          })
          .join(" ");
      }

      var entradas = data.entradas || [];
      entradas.forEach(function (entrada) {
        var article = el("article", "entrada");
        article.appendChild(
          el("p", "eyebrow", CONTINENTES[entrada.continente] + " · " + entrada.fonte)
        );
        var h2 = el("h2", "");
        var a = document.createElement("a");
        a.href = entrada.href;
        a.textContent = entrada.titulo;
        h2.appendChild(a);
        article.appendChild(h2);
        article.appendChild(el("p", "byline", (entrada.pais || "") + (entrada.data ? " · " + formatDate(entrada.data) : "")));
        if (entrada.glosa) article.appendChild(el("p", "entrada-glosa", entrada.glosa));
        if (entrada.resumo) {
          var quote = document.createElement("blockquote");
          quote.appendChild(el("p", "", entrada.resumo));
          article.appendChild(quote);
        }
        var links = el("p", "entrada-links");
        var original = document.createElement("a");
        original.href = entrada.url;
        original.rel = "noopener noreferrer";
        original.textContent = "Ler no original";
        var permalink = document.createElement("a");
        permalink.href = entrada.href;
        permalink.textContent = "Abrir a entrada";
        links.appendChild(original);
        links.appendChild(document.createTextNode(" · "));
        links.appendChild(permalink);
        article.appendChild(links);
        rootEntradas.appendChild(article);
      });
      if (!entradas.length) {
        rootEntradas.appendChild(el("p", "prose", "Nenhuma entrada nesta varredura."));
      }

      if (!rootClips || !rootFiltros) return;
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
        var ids = {};
        entradas.forEach(function (e) {
          ids[e.id] = true;
        });
        var lista = (data.clippings || []).filter(function (clip) {
          if (ids[clip.id]) return false;
          return filtroAtivo === "todos" || clip.continente === filtroAtivo;
        });
        lista.forEach(function (clip) {
          var row = el("article", "note-row");
          var time = document.createElement("time");
          time.dateTime = clip.data || "";
          time.textContent = formatDate(clip.data).slice(0, 5) || clip.canal;
          row.appendChild(time);
          var body = document.createElement("div");
          body.appendChild(el("p", "note-kicker", CONTINENTES[clip.continente] + " · " + clip.fonte));
          var h = el("h2", "");
          var link = document.createElement("a");
          link.href = clip.url;
          link.rel = "noopener noreferrer";
          link.textContent = clip.titulo;
          h.appendChild(link);
          body.appendChild(h);
          row.appendChild(body);
          rootClips.appendChild(row);
        });
        if (!lista.length) {
          rootClips.appendChild(el("p", "prose", "Nenhum outro clipping neste recorte."));
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
      rootEntradas.appendChild(
        el("p", "prose", "O radar não carregou. Rode python3 miner/minerar.py e recarregue.")
      );
    });
})();
