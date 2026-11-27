// Audio player disabled in public GitHub Pages mirror to avoid hosting copyrighted commercial tracks.
(function () {
  "use strict";
  function hidePlayers() {
    document.querySelectorAll("[data-record-player]").forEach(function (el) {
      el.hidden = true;
      el.style.display = "none";
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hidePlayers);
  } else {
    hidePlayers();
  }
})();
