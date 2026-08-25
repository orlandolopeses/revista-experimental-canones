(function () {
  var year = document.getElementById("ano");
  if (year) year.textContent = String(new Date().getFullYear());

  var nav = document.querySelector("nav.sections");
  if (!nav || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var sentinel = document.createElement("div");
  sentinel.className = "nav-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  nav.parentNode.insertBefore(sentinel, nav);

  if (!("IntersectionObserver" in window)) return;
  var observer = new IntersectionObserver(
    function (entries) {
      nav.classList.toggle("is-stuck", !entries[0].isIntersecting);
    },
    { threshold: 0 }
  );
  observer.observe(sentinel);
})();
