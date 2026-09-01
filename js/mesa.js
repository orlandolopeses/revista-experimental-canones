(function () {
  var LOGIN = document.getElementById("mesa-login");
  var EDITOR = document.getElementById("mesa-editor");
  var PECA = document.getElementById("mesa-peca");
  if (!LOGIN || !EDITOR || !PECA) return;

  var SENHA =
    "fdb391df9c9b3182dd255f457b530f43ada901b0f84dc8eb9bd721a1a493f2b9";
  var SESSION = "revista-mesa-sessao";
  var DRAFT = "revista-mesa-rascunho";
  var ENDPOINT = "https://formsubmit.co/ajax/orlando.albertino@ufes.br";

  var loginStatus = document.getElementById("login-status");
  var pecaStatus = document.getElementById("peca-status");
  var bylineEl = document.getElementById("mesa-byline");
  var campoYoutube = document.getElementById("campo-youtube");

  function setStatus(el, state, text) {
    el.dataset.state = state || "";
    el.textContent = text || "";
  }

  function hex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function hashSenha(texto) {
    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(texto))
      .then(hex);
  }

  function sessao() {
    try {
      return JSON.parse(localStorage.getItem(SESSION) || "null");
    } catch (err) {
      return null;
    }
  }

  function guardarSessao(byline) {
    localStorage.setItem(
      SESSION,
      JSON.stringify({ byline: byline, em: Date.now() })
    );
  }

  function slugify(texto) {
    var mapa = {
      á: "a",
      à: "a",
      ã: "a",
      â: "a",
      é: "e",
      ê: "e",
      í: "i",
      ó: "o",
      ô: "o",
      õ: "o",
      ú: "u",
      ç: "c",
    };
    return String(texto || "peca")
      .toLowerCase()
      .replace(/[áàãâéêíóôõúç]/g, function (ch) {
        return mapa[ch] || ch;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "peca";
  }

  function hoje() {
    return new Date().toISOString().slice(0, 10);
  }

  function dados() {
    var tipo = PECA.tipo.value || "peca";
    return {
      tipo: tipo,
      title: PECA.title.value.trim(),
      deck: PECA.deck.value.trim(),
      byline: (sessao() || {}).byline || "",
      equipe: PECA.equipe.value,
      youtube: PECA.youtube.value.trim(),
      body: PECA.body.value.trim(),
      date: hoje(),
    };
  }

  function markdown(d) {
    var secao = d.tipo === "indicacao" ? "indicacoes" : "pecas";
    var nav = d.tipo === "indicacao" ? "videos" : "critica";
    var linhas = [
      "---",
      'title: "' + d.title.replace(/"/g, '\\"') + '"',
      'eyebrow: "' + (d.tipo === "indicacao" ? "Indicação" : "Crítica") + '"',
      'deck: "' + d.deck.replace(/"/g, '\\"') + '"',
      'byline: "' + d.byline.replace(/"/g, '\\"') + '"',
      "date: " + d.date,
      "equipe: " + d.equipe,
      "nav: " + nav,
    ];
    if (d.youtube) linhas.push("youtube: " + d.youtube);
    linhas.push("---", "", d.body, "");
    return { secao: secao, slug: d.date + "-" + slugify(d.title), texto: linhas.join("\n") };
  }

  function aplicarRascunho() {
    try {
      var r = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (!r) return;
      if (r.tipo) PECA.tipo.value = r.tipo;
      if (r.title) PECA.title.value = r.title;
      if (r.deck) PECA.deck.value = r.deck;
      if (r.equipe) PECA.equipe.value = r.equipe;
      if (r.youtube) PECA.youtube.value = r.youtube;
      if (r.body) PECA.body.value = r.body;
      mostrarYoutube();
    } catch (err) {
      /* rascunho ilegível: ignora */
    }
  }

  function salvarRascunho() {
    localStorage.setItem(
      DRAFT,
      JSON.stringify({
        tipo: PECA.tipo.value,
        title: PECA.title.value,
        deck: PECA.deck.value,
        equipe: PECA.equipe.value,
        youtube: PECA.youtube.value,
        body: PECA.body.value,
      })
    );
  }

  function mostrarYoutube() {
    var on = PECA.tipo.value === "indicacao";
    campoYoutube.hidden = !on;
    if (!on) PECA.youtube.value = PECA.youtube.value;
  }

  function abrirEditor(byline) {
    LOGIN.hidden = true;
    EDITOR.hidden = false;
    bylineEl.textContent = byline;
    aplicarRascunho();
    PECA.title.focus();
  }

  function fecharEditor() {
    localStorage.removeItem(SESSION);
    EDITOR.hidden = true;
    LOGIN.hidden = false;
    LOGIN.login_senha.value = "";
    LOGIN.login_assinatura.focus();
  }

  var atual = sessao();
  if (atual && atual.byline) abrirEditor(atual.byline);

  LOGIN.addEventListener("submit", function (event) {
    event.preventDefault();
    var byline = LOGIN.login_assinatura.value.trim();
    var senha = LOGIN.login_senha.value;
    if (!byline || !senha) return;
    hashSenha(senha)
      .then(function (digest) {
        if (digest !== SENHA) {
          setStatus(loginStatus, "err", "Senha da redação não confere.");
          return;
        }
        guardarSessao(byline);
        setStatus(loginStatus, "", "");
        abrirEditor(byline);
      })
      .catch(function () {
        setStatus(
          loginStatus,
          "err",
          "Este navegador não consegue abrir a mesa. Tente outro, ou o e-mail da disciplina."
        );
      });
  });

  document.getElementById("sair").addEventListener("click", fecharEditor);
  PECA.tipo.addEventListener("change", mostrarYoutube);
  PECA.addEventListener("input", salvarRascunho);

  document.getElementById("baixar-md").addEventListener("click", function () {
    var d = dados();
    if (!d.title || !d.body) {
      setStatus(pecaStatus, "err", "Título e texto são obrigatórios para baixar.");
      return;
    }
    var md = markdown(d);
    var blob = new Blob([md.texto], { type: "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = md.slug + ".md";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus(pecaStatus, "ok", "Arquivo baixado. Pode mandar pelo e-mail da disciplina se o envio falhar.");
  });

  PECA.addEventListener("submit", function (event) {
    event.preventDefault();
    if (PECA.website && PECA.website.value) return;
    var d = dados();
    var md = markdown(d);
    var enviar = document.getElementById("enviar-peca");
    var payload = {
      _subject:
        (d.tipo === "indicacao" ? "Indicação" : "Peça") +
        " — " +
        d.title +
        " — Revista Experimental (DLT13973)",
      _template: "box",
      _captcha: "false",
      tipo: d.tipo,
      title: d.title,
      deck: d.deck,
      byline: d.byline,
      equipe: d.equipe,
      youtube: d.youtube,
      arquivo: md.secao + "/" + md.slug + ".md",
      markdown: md.texto,
    };
    enviar.disabled = true;
    setStatus(pecaStatus, "wait", "Enviando à redação…");
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        var data = result.data || {};
        var activated = data.success === true || data.success === "true";
        if (!result.ok || !activated) {
          if (String(data.message || "").toLowerCase().indexOf("activation") !== -1) {
            throw new Error("activation");
          }
          throw new Error("Falha no envio");
        }
        localStorage.removeItem(DRAFT);
        PECA.reset();
        mostrarYoutube();
        setStatus(
          pecaStatus,
          "ok",
          "Chegou à redação. O texto só entra no ar depois do editor aceitar."
        );
      })
      .catch(function (err) {
        var mailto =
          "mailto:orlando.albertino@ufes.br?subject=" +
          encodeURIComponent(payload._subject) +
          "&body=" +
          encodeURIComponent(md.texto);
        var prefix =
          err && err.message === "activation"
            ? "O canal de e-mail ainda está sendo ativado. Enquanto isso, envie pelo link."
            : "Não foi possível enviar pelo formulário. Use o e-mail da disciplina — o markdown já vai no link.";
        pecaStatus.dataset.state = "err";
        pecaStatus.innerHTML =
          prefix +
          ' <a href="' +
          mailto +
          '">Abrir e-mail para orlando.albertino@ufes.br</a>.';
      })
      .finally(function () {
        enviar.disabled = false;
      });
  });
})();
