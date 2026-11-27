// 新访客使用指南 + 页面小目录：首次访问弹一次引导，之后可从右下角目录里重看。
(function () {
  "use strict";

  var GUIDE_KEY = "lzq-guide-seen-v1";
  var HEADER_OFFSET = 88;

  var steps = [
    {
      icon: "👋",
      title: "欢迎来看我的主页",
      text: "这里是李宗谦的个人主页：招聘实战、作品材料、完整履历和下班后的生活都在里面。花二十秒看完这份指南，就知道东西都放在哪。"
    },
    {
      icon: "🧭",
      title: "七个页面，一条主线",
      text: "首页看概览 → 关于看方向 → 实战看怎么做事 → 作品看成果 → 履历看完整 CV → 生活看下班后 → 联系找我。电脑上导航在顶部，手机上在底部。"
    },
    {
      icon: "📑",
      title: "右下角有目录",
      text: "点右下角的「目录」，能看到当前页面的所有板块，一键跳过去，不用一直往下滑。"
    },
    {
      icon: "🌗",
      title: "首页可以切两面",
      text: "首页右上角的「生活模式」：工作区讲招聘和 AI，生活面讲游戏、吉他、旅行和歌单。"
    },
    {
      icon: "📄",
      title: "简历随时能拿走",
      text: "「查看 CV」在线看完整履历，作品页里可以下载 PDF 简历、推荐信和方案说明。"
    }
  ];

  var pages = [
    { href: "index.html", label: "首页", note: "概览与两种模式" },
    { href: "about.html", label: "关于", note: "目标方向" },
    { href: "experience.html", label: "实战", note: "案例与做法" },
    { href: "works.html", label: "作品", note: "作品与材料" },
    { href: "cv.html", label: "履历", note: "完整 CV" },
    { href: "life.html", label: "生活", note: "下班后" },
    { href: "contact.html", label: "联系", note: "联系方式" }
  ];

  var currentFile = (function () {
    var name = window.location.pathname.split("/").pop();
    return name || "index.html";
  })();

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- 页面小目录 ---------- */

  function tocRoot() {
    var main = document.querySelector("main");
    if (!main) return null;
    var activeView = main.querySelector("[data-mode-view]:not([hidden])");
    return activeView || main;
  }

  function shorten(text) {
    var label = (text || "").trim().replace(/\s+/g, " ");
    // 内页有些标题是整句话，目录里只留前半段
    label = label.split(/[｜|]/)[0].trim();
    return label.length > 16 ? label.slice(0, 16) + "…" : label;
  }

  function anchorId(node, order) {
    if (node.id) return node.id;
    var owner = node.closest("article[id], section[id]");
    if (owner && owner.id !== "main") return owner.id;
    node.id = "toc-anchor-" + order;
    return node.id;
  }

  function collectSections() {
    var root = tocRoot();
    if (!root) return [];
    var selector = "section.profile-section, section.section, section.cv-section";
    var blocks = Array.prototype.filter.call(root.querySelectorAll(selector), function (block) {
      if (block.closest("[hidden]")) return false;
      if (block.classList.contains("page-hero")) return false;
      // 外层容器里若还包着别的候选区块，只取里层，避免目录出现重复层级
      return !block.querySelector(selector);
    });

    var items = [];
    blocks.forEach(function (block, order) {
      var heading = block.querySelector("h2, h1");
      if (!heading) return;
      var label = shorten(heading.textContent);
      if (!label) return;
      items.push({ id: anchorId(block, order), label: label });
    });

    // 内页只有一屏正文时，退回用三级标题（案例、作品条目）当目录
    if (items.length < 2) {
      items = [];
      Array.prototype.forEach.call(root.querySelectorAll("h3"), function (heading, order) {
        if (heading.closest("[hidden]")) return;
        var label = shorten(heading.textContent);
        if (!label) return;
        items.push({ id: anchorId(heading, order), label: label });
      });
    }

    return items.length < 2 ? [] : items;
  }

  function scrollToId(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top: top < 0 ? 0 : top, behavior: "smooth" });
  }

  function buildToc(openGuide) {
    var button = el("button", "toc-fab");
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "打开页面目录");
    button.appendChild(el("span", "toc-fab-icon", "☰"));
    button.appendChild(el("span", "toc-fab-text", "目录"));

    var panel = el("div", "toc-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "页面目录");
    panel.hidden = true;

    var head = el("div", "toc-panel-head");
    head.appendChild(el("strong", null, "目录"));
    var close = el("button", "toc-panel-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "关闭目录");
    head.appendChild(close);
    panel.appendChild(head);

    var sectionGroup = el("div", "toc-group");
    panel.appendChild(sectionGroup);

    var pageGroup = el("div", "toc-group");
    pageGroup.appendChild(el("span", "toc-group-title", "其他页面"));
    var pageList = el("div", "toc-page-list");
    pages.forEach(function (page) {
      if (page.href === currentFile) return;
      var link = el("a", "toc-page-link");
      link.href = page.href;
      link.appendChild(el("strong", null, page.label));
      link.appendChild(el("em", null, page.note));
      pageList.appendChild(link);
    });
    pageGroup.appendChild(pageList);
    panel.appendChild(pageGroup);

    var guideButton = el("button", "toc-guide-link", "重新看一遍使用指南");
    guideButton.type = "button";
    guideButton.addEventListener("click", function () {
      setOpen(false);
      openGuide(true);
    });
    panel.appendChild(guideButton);

    function renderSections() {
      sectionGroup.replaceChildren();
      var items = collectSections();
      // 短页面没有可拆的板块时，按钮直接叫“导航”，面板只列其他页面
      button.querySelector(".toc-fab-text").textContent = items.length ? "目录" : "导航";
      button.setAttribute("aria-label", items.length ? "打开页面目录" : "打开站点导航");
      if (!items.length) {
        sectionGroup.hidden = true;
        return;
      }
      sectionGroup.hidden = false;
      sectionGroup.appendChild(el("span", "toc-group-title", "本页板块"));
      var list = el("div", "toc-section-list");
      items.forEach(function (item, order) {
        var entry = el("button", "toc-section-link");
        entry.type = "button";
        entry.appendChild(el("span", "toc-section-index", String(order + 1).padStart(2, "0")));
        entry.appendChild(el("span", "toc-section-label", item.label));
        entry.addEventListener("click", function () {
          setOpen(false);
          scrollToId(item.id);
        });
        list.appendChild(entry);
      });
      sectionGroup.appendChild(list);
    }

    function setOpen(open) {
      panel.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.classList.toggle("is-open", open);
      if (open) {
        renderSections();
        close.focus();
      }
    }

    button.addEventListener("click", function () {
      setOpen(panel.hidden);
    });
    close.addEventListener("click", function () {
      setOpen(false);
      button.focus();
    });
    document.addEventListener("click", function (event) {
      if (panel.hidden) return;
      if (panel.contains(event.target) || button.contains(event.target)) return;
      setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) setOpen(false);
    });
    document.addEventListener("home-mode-change", function () {
      if (!panel.hidden) renderSections();
    });

    document.body.appendChild(button);
    document.body.appendChild(panel);
    renderSections();
  }

  /* ---------- 首次访问使用指南 ---------- */

  function buildGuide() {
    var overlay = el("div", "guide-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "使用指南");
    overlay.hidden = true;

    var card = el("div", "guide-card");
    var icon = el("span", "guide-icon");
    var title = el("strong", "guide-title");
    var text = el("p", "guide-text");
    var dots = el("div", "guide-dots");
    dots.setAttribute("aria-hidden", "true");
    var actions = el("div", "guide-actions");
    var skip = el("button", "guide-skip", "跳过");
    skip.type = "button";
    var back = el("button", "guide-back", "上一步");
    back.type = "button";
    var next = el("button", "guide-next", "下一步");
    next.type = "button";
    actions.appendChild(skip);
    actions.appendChild(back);
    actions.appendChild(next);

    var counter = el("span", "guide-counter");

    card.appendChild(icon);
    card.appendChild(counter);
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(dots);
    card.appendChild(actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    var index = 0;
    var lastFocus = null;

    function render() {
      var step = steps[index];
      icon.textContent = step.icon;
      title.textContent = step.title;
      text.textContent = step.text;
      counter.textContent = index + 1 + " / " + steps.length;
      back.hidden = index === 0;
      next.textContent = index === steps.length - 1 ? "开始浏览" : "下一步";
      skip.hidden = index === steps.length - 1;
      dots.replaceChildren();
      steps.forEach(function (_, order) {
        var dot = el("i", order === index ? "is-active" : null);
        dots.appendChild(dot);
      });
    }

    function open(reset) {
      if (reset) index = 0;
      lastFocus = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add("guide-open");
      render();
      next.focus();
    }

    function closeGuide() {
      overlay.hidden = true;
      document.body.classList.remove("guide-open");
      try {
        window.localStorage.setItem(GUIDE_KEY, "1");
      } catch (error) {
        /* 隐私模式下写不了就算了 */
      }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    next.addEventListener("click", function () {
      if (index === steps.length - 1) {
        closeGuide();
        return;
      }
      index += 1;
      render();
    });
    back.addEventListener("click", function () {
      if (index > 0) index -= 1;
      render();
    });
    skip.addEventListener("click", closeGuide);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeGuide();
    });
    document.addEventListener("keydown", function (event) {
      if (overlay.hidden) return;
      if (event.key === "Escape") closeGuide();
      if (event.key === "ArrowRight") next.click();
      if (event.key === "ArrowLeft" && index > 0) back.click();
    });

    return open;
  }

  function hasSeenGuide() {
    try {
      return window.localStorage.getItem(GUIDE_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function boot() {
    // SPA 切页会重复执行本文件：先清掉旧目录/指南元素，避免重复挂载。
    document.querySelectorAll(".toc-fab, .toc-panel, .guide-overlay").forEach(function (n) {
      n.remove();
    });
    var openGuide = buildGuide();
    buildToc(openGuide);
    if (!hasSeenGuide()) {
      window.setTimeout(function () {
        openGuide(true);
      }, 700);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
