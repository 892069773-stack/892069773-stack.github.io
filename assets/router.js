// 单页导航：外观仍是多页，底层就地替换内容，音乐引擎常驻不断。
(function () {
  "use strict";

  var SCRIPTS = ["assets/app.js", "assets/works-sanctum.js", "assets/guide.js", "assets/record-player.js"];
  var INTRO_SEEN_KEY = "lzq-intro-seen";

  function isInternalPage(link) {
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
    if (link.hasAttribute("data-pdf-download")) return false;
    var href = link.getAttribute("href");
    if (!href) return false;
    if (href.charAt(0) === "#" || /^(javascript:|mailto:|tel:)/i.test(href)) return false;
    var url;
    try { url = new URL(href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    var path = url.pathname;
    return path === "/" || /\.html?$/i.test(path);
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.body.appendChild(s);
    });
  }

  function applyPage(doc) {
    var newBody = doc.body;
    document.body.dataset.page = newBody.dataset.page || "";
    document.body.className = newBody.className || "";

    document.title = doc.title;
    ["theme-color", "description"].forEach(function (name) {
      var meta = doc.querySelector('meta[name="' + name + '"]');
      var current = document.querySelector('meta[name="' + name + '"]');
      if (meta && current) current.setAttribute("content", meta.getAttribute("content") || "");
    });

    // 去掉新页里不会执行的 <script>，再整体替换 body 内容
    doc.querySelectorAll("script").forEach(function (s) { s.remove(); });
    document.body.innerHTML = newBody.innerHTML;

    // 开场动画只在整页首次进入时播放；SPA 切回首页时若本会话已看过就直接撤掉
    try {
      if (sessionStorage.getItem(INTRO_SEEN_KEY) === "true") {
        var intro = document.querySelector("[data-work-intro]");
        if (intro) intro.remove();
      }
    } catch (e) { /* 忽略 */ }
  }

  function navigate(url, push) {
    return fetch(url.href)
      .then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        applyPage(doc);
        if (push !== false) {
          history.pushState({ url: url.pathname + url.search + url.hash }, "", url.pathname + url.search + url.hash);
        }
        // 带锚点时滚到对应板块，否则回到顶部（scroll-padding-top: 88px 自动留白）。
        if (url.hash && url.hash.length > 1) {
          var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (target) {
            target.scrollIntoView({ behavior: "auto" });
          } else {
            window.scrollTo(0, 0);
          }
        } else {
          window.scrollTo(0, 0);
        }
        var chain = Promise.resolve();
        SCRIPTS.forEach(function (src) {
          chain = chain.then(function () { return loadScript(src); });
        });
        return chain;
      })
      .catch(function () {
        location.href = url.href; // 网络异常等兜底：整页跳转
      });
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest("a");
    if (!link) return;
    if (!isInternalPage(link)) return;
    event.preventDefault();
    navigate(new URL(link.getAttribute("href"), location.href), true);
  });

  window.addEventListener("popstate", function () {
    navigate(new URL(location.href), false);
  });
})();
