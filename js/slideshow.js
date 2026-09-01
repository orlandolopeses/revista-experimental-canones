(function () {
  var root = document.querySelector("[data-slideshow]");
  if (!root) return;

  var src = root.getAttribute("data-slideshow");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var INTERVAL = 6500;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function coverUrl(item) {
    if (item.cover) return String(item.cover).replace(/^\.\.\//, "");
    return "img/instagram/" + item.id + ".jpg";
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function pad(n, total) {
    var width = String(total).length;
    var s = String(n);
    while (s.length < width) s = "0" + s;
    return s;
  }

  fetch(src)
    .then(function (res) {
      if (!res.ok) throw new Error("slideshow");
      return res.json();
    })
    .then(function (data) {
      var itens = (data.itens || []).filter(function (item) {
        return item && (item.cover || item.id);
      });
      if (!itens.length) {
        root.replaceChildren(el("p", "galeria-status", "O arquivo da coleção ainda não carregou."));
        return;
      }

      var index = 0;
      var timer = null;
      var stage = el("div", "slideshow-stage");
      var media = document.createElement("a");
      media.className = "slideshow-media";
      media.rel = "noopener noreferrer";
      media.target = "_blank";
      var img = document.createElement("img");
      img.alt = "";
      img.width = 720;
      img.height = 900;
      media.appendChild(img);
      stage.appendChild(media);

      var copy = el("div", "slideshow-copy");
      var eyebrow = el("p", "eyebrow");
      var title = document.createElement("h2");
      var titleLink = document.createElement("a");
      titleLink.rel = "noopener noreferrer";
      titleLink.target = "_blank";
      title.appendChild(titleLink);
      var trecho = el("p", "slideshow-trecho");
      var live = el("p", "visually-hidden");
      live.setAttribute("aria-live", "polite");

      var controls = el("div", "slideshow-controls");
      var prev = document.createElement("button");
      prev.type = "button";
      prev.textContent = "Anterior";
      var next = document.createElement("button");
      next.type = "button";
      next.textContent = "Seguinte";
      var counter = el("p", "slideshow-count");
      controls.appendChild(prev);
      controls.appendChild(counter);
      controls.appendChild(next);

      var archive = document.createElement("a");
      archive.className = "slideshow-more";
      archive.href = "pecas/arquivo.html";
      archive.textContent = "Ver os 34 recortes no arquivo";

      copy.appendChild(eyebrow);
      copy.appendChild(title);
      copy.appendChild(trecho);
      copy.appendChild(controls);
      copy.appendChild(archive);
      copy.appendChild(live);

      root.replaceChildren();
      root.appendChild(stage);
      root.appendChild(copy);

      function show(i) {
        index = (i + itens.length) % itens.length;
        var item = itens[index];
        var href = item.href || "pecas/arquivo.html";
        img.src = coverUrl(item);
        media.href = href;
        media.setAttribute("aria-label", "Abrir o original de " + (item.kicker || "") + " no Instagram");
        titleLink.href = href;
        titleLink.textContent = item.titulo || item.kicker || "Coleção Crítica";
        eyebrow.textContent =
          (item.kicker || "Arquivo") + (item.data ? " · " + formatDate(item.data) : "");
        trecho.textContent = item.trecho || "";
        counter.textContent = pad(index + 1, itens.length) + " / " + itens.length;
        live.textContent = titleLink.textContent + ". " + (item.kicker || "");
        var ahead = itens[(index + 1) % itens.length];
        var preload = new Image();
        preload.src = coverUrl(ahead);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      function start() {
        stop();
        if (reduced || itens.length < 2) return;
        timer = window.setInterval(function () {
          show(index + 1);
        }, INTERVAL);
      }

      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);
      root.addEventListener("focusin", stop);
      root.addEventListener("focusout", function (ev) {
        if (!root.contains(ev.relatedTarget)) start();
      });
      root.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowLeft") {
          ev.preventDefault();
          show(index - 1);
          start();
        }
        if (ev.key === "ArrowRight") {
          ev.preventDefault();
          show(index + 1);
          start();
        }
      });
      root.tabIndex = 0;

      show(0);
      start();
    })
    .catch(function () {
      root.replaceChildren(
        el("p", "galeria-status", "O slideshow não carregou. O arquivo completo está em Crítica.")
      );
    });
})();
