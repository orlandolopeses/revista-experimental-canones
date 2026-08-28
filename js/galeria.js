(function () {
  var root = document.querySelector("[data-galeria]");
  if (!root) return;

  var src = root.getAttribute("data-galeria");
  var kind = root.getAttribute("data-kind") || "video";

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function playMark() {
    var play = el("span", "galeria-play");
    play.setAttribute("aria-hidden", "true");
    return play;
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function renderVideo(item) {
    var card = el("article", "galeria-card");
    var media = document.createElement("a");
    media.className = "galeria-media";
    media.href = item.href;
    media.setAttribute("aria-label", "Abrir " + item.titulo);
    var img = document.createElement("img");
    img.src = item.cover || ("https://i.ytimg.com/vi/" + item.youtube + "/hqdefault.jpg");
    img.alt = "";
    img.width = 480;
    img.height = 360;
    img.loading = "lazy";
    media.appendChild(img);
    media.appendChild(playMark());
    card.appendChild(media);
    card.appendChild(el("p", "eyebrow", item.kicker + (item.data ? " · " + formatDate(item.data) : "")));
    var h2 = el("h2");
    var title = document.createElement("a");
    title.href = item.href;
    title.textContent = item.titulo;
    h2.appendChild(title);
    card.appendChild(h2);
    if (item.glosa) card.appendChild(el("p", "", item.glosa));
    return card;
  }

  function renderPodcast(item) {
    var card = el("article", "galeria-card is-podcast");
    var media = document.createElement(item.href ? "a" : "div");
    media.className = "galeria-media";
    if (item.href) {
      media.href = item.href;
      if (/^https?:/.test(item.href)) media.rel = "noopener noreferrer";
      media.setAttribute("aria-label", "Abrir " + item.titulo + " no original");
    }
    if (item.cover) {
      var img = document.createElement("img");
      img.src = item.cover;
      img.alt = "";
      img.width = 400;
      img.height = 400;
      img.loading = "lazy";
      media.appendChild(img);
    }
    media.appendChild(playMark());
    card.appendChild(media);
    card.appendChild(el("p", "eyebrow", item.kicker + (item.data ? " · " + formatDate(item.data) : "")));
    var h2 = el("h2");
    if (item.href) {
      var title = document.createElement("a");
      title.href = item.href;
      if (/^https?:/.test(item.href)) title.rel = "noopener noreferrer";
      title.textContent = item.titulo;
      h2.appendChild(title);
    } else {
      h2.textContent = item.titulo;
    }
    card.appendChild(h2);
    if (item.glosa) card.appendChild(el("p", "", item.glosa));
    if (item.audio) {
      var audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = item.audio;
      card.appendChild(audio);
    }
    return card;
  }

  fetch(src)
    .then(function (res) {
      if (!res.ok) throw new Error("galeria");
      return res.json();
    })
    .then(function (data) {
      var itens = data.itens || [];
      root.replaceChildren();
      if (!itens.length) {
        root.appendChild(el("p", "galeria-status", "A mesa ainda está vazia. A redação espera a próxima indicação."));
        return;
      }
      itens.forEach(function (item) {
        root.appendChild(kind === "podcast" ? renderPodcast(item) : renderVideo(item));
      });
    })
    .catch(function () {
      root.replaceChildren();
      root.appendChild(
        el("p", "galeria-status", "A galeria não carregou. Recarregue a página ou volte pela edição zero.")
      );
    });
})();
