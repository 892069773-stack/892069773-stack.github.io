// Works 作品展馆：原生轴向锁定横向吸附画廊（上下正常滚页面、左右独立滑展品，互不干扰）
(function () {
  "use strict";

  if (typeof window.__lzqSanctumDestroy === "function") {
    window.__lzqSanctumDestroy();
    window.__lzqSanctumDestroy = null;
  }

  if (document.body.dataset.page !== "works") return;
  const root = document.querySelector("[data-wb-root]");
  if (!root) return;

  const EXHIBITS = [
    {
      id: "future-goose",
      num: "01",
      shortTitle: "未来鹅",
      kicker: "01 / 06 · 腾讯 AI-HR 训练营实践",
      badgeTop: "Exhibit 01 / 06",
      badgeMain: "大学生成长路径 × 校招前置人才观察",
      title: "未来鹅 AI 成长陪伴平台",
      summary: "面向大学生成长轨迹与招聘方人才观察的双视角平台：让长期项目积累被持续看见，也让校招团队比单次静态简历多一层连续判断上下文。",
      role: "平台概念设计 / 双端用户路径拆解 / 招聘方视角建模",
      highlight: "把阶段性项目产出沉淀为可追踪的能力信号曲线，连接学生自我复盘与校招前置储备。",
      tags: ["AI 成长陪伴", "校招人才池前置", "游戏化成长体系", "双视角原型"],
      image: "assets/future-goose-preview.jpg",
      alt: "未来鹅 AI 成长陪伴平台界面预览",
      actions: [
        { label: "打开在线 Demo", href: "https://johnny-shelby-d9g6l5n3f923ce359-1436004313.tcloudbaseapp.com/future-goose/", external: true, primary: true },
        { label: "下载方案 PDF", href: "downloads/future-goose.dat", download: "未来鹅-AI成长陪伴平台方案.pdf", pdf: true }
      ]
    },
    {
      id: "aihr",
      num: "02",
      shortTitle: "智能猎聘系统",
      kicker: "02 / 06 · 核心代表作 · 线上 v29",
      badgeTop: "Exhibit 02 / 06",
      badgeMain: "学术证据溯源 × 方向优先同名消歧",
      title: "AI-HR 智能招聘与猎聘系统",
      summary: "证据优先的人才发现与招聘管理双子系统：先检索公开论文与网页线索、校验同名学者与机构归属，再输出带来源、置信度与后续动作的猎聘判断。",
      role: "需求拆解 / 猎聘流程建模 / 信息架构 / Vibe Coding 全栈实现",
      highlight: "接入 Semantic Scholar、OpenAlex、arXiv 与 Google Scholar，证据不足自动降级留痕，69 项单元测试覆盖全链路。",
      tags: ["Semantic Scholar", "OpenAlex & arXiv", "水下人才挖掘", "Vue 3", "69 项单测"],
      image: "assets/aihr-preview.jpg",
      alt: "AI-HR 智能招聘与猎聘系统界面截图",
      actions: [
        { label: "打开在线 Demo", href: "https://johnny-shelby-d9g6l5n3f923ce359-1436004313.tcloudbaseapp.com", external: true, primary: true },
        { label: "下载 V9.0 方案 PDF", href: "downloads/ai-hr-system.dat", download: "AI-HR-智能招聘与猎聘系统-V9.0方案.pdf", pdf: true }
      ]
    },
    {
      id: "ord001",
      num: "03",
      shortTitle: "外卖客服 Agent",
      kicker: "03 / 06 · AI Agent · 港城大 IS5542",
      badgeTop: "Exhibit 03 / 06 · NEW",
      badgeMain: "LangGraph 规则护栏 × 双端人机协同审核",
      title: "配送关怀 · 外卖延误补偿客服 Agent",
      summary: "顾客端对话查单与商家/主管审核台双端协同系统：生成式 AI 辅助识别订单诉求，服务端确定性规则精算超时阈值，严守人工审批与一单一赔边界。",
      role: "原型与基线开发（显式规则 Agent C / 基础工具基线 B / 商家与主管重审台）",
      highlight: "实现一单一赔 SQLite 原子锁、R001 标准审批与 R002 主管有理由重审改额（实付上限拦截），完成 120 次在线模型受控对照试跑。",
      tags: ["LangGraph", "Starlette + SQLite", "DeepSeek", "一单一赔原子锁", "120 次受控评测"],
      image: "assets/ord001-preview.jpg",
      alt: "配送关怀外卖延误补偿客服 Agent 实机界面截图",
      actions: [
        { label: "打开在线 Demo", href: "https://892069773-stack.github.io/delivery-care-agent/", external: true, primary: true },
        { label: "商家审核台 Demo", href: "https://892069773-stack.github.io/delivery-care-agent/review/", external: true }
      ]
    },
    {
      id: "campusflow",
      num: "04",
      shortTitle: "CampusFlow",
      kicker: "04 / 06 · 校招现场扫码体验 · 2026.09",
      badgeTop: "Exhibit 04 / 06",
      badgeMain: "三视角岗位目录 × 零留存邮箱直投 HR",
      title: "CampusFlow · 校园招聘体验场",
      summary: "面向小红书校园招聘现场的扫码互动工作台：同一份官网岗位目录打通候选人浏览、招聘方配置与面试练习三视角，投递由本人邮箱直发 HR。",
      role: "产品定位 / 投递动线与合规边界设计 / React + Vite 纯静态实现",
      highlight: "10 个岗位、5 个方向、4 座城市按官网原文拆解；站内零后端、不收简历、不建账号、不做埋点。",
      tags: ["React + Vite", "三视角工作台", "零后端留存", "邮箱直投 HR"],
      image: "assets/campusflow-preview.jpg",
      alt: "CampusFlow 校园招聘体验场界面截图",
      actions: [
        { label: "打开在线 Demo", href: "https://campusflow-xiaohongshu-demo-20260923.surge.sh", external: true, primary: true }
      ]
    },
    {
      id: "origin-atlas",
      num: "05",
      shortTitle: "源作 Origin Atlas",
      kicker: "05 / 06 · 视觉方向决策台",
      badgeTop: "Exhibit 05 / 06",
      badgeMain: "先定配色与字阶方向，再统一交付实现",
      title: "源作 Origin Atlas 视觉决策台",
      summary: "没有专职设计团队时，在动工前先选定配色系统、字体与界面气质，自动生成一份可直接交给编码 Agent 或设计师的视觉方向说明。",
      role: "产品定位 / 视觉方向决策流程建模 / Vibe Coding 实现",
      highlight: "把「先选方向、再交付」固化成一条可复用的前置决策链路，减少反复返工。",
      tags: ["视觉方向决策", "配色系统", "字阶规范", "Vercel"],
      image: "assets/origin-atlas-preview.jpg",
      alt: "源作 Origin Atlas 视觉决策台界面截图",
      actions: [
        { label: "打开在线 Demo", href: "https://origin-vercel-site.vercel.app", external: true, primary: true }
      ]
    },
    {
      id: "interview-checkup",
      num: "06",
      shortTitle: "面试体检",
      kicker: "06 / 06 · 招聘效度分析 SaaS",
      badgeTop: "Exhibit 06 / 06",
      badgeMain: "相关系数 r 量化诊断 · 只体检不裁决",
      title: "面试体检 InterviewCheckup",
      summary: "把「各轮面试打分到底准不准」量化成相关系数 r，快速识别与入职表现脱节的无效面试轮次。只做流程体检，不替代人工裁决。",
      role: "产品定位 / 招聘效度统计建模 / React + FastAPI 全栈实现",
      highlight: "用直观的数据分布和相关性分析，30 秒讲清楚哪一轮面试打分与入职绩效脱节。",
      tags: ["效度相关系数 r", "ECharts", "FastAPI", "CloudBase Run"],
      image: "assets/interview-checkup-preview.jpg",
      alt: "面试体检 InterviewCheckup 界面截图",
      actions: [
        { label: "打开在线 Demo", href: "https://interview-checkup-306390-11-1436004313.sh.run.tcloudbase.com", external: true, primary: true }
      ]
    },
    {
      id: "academic-archive",
      num: "07",
      shortTitle: "论文 & 推荐信",
      kicker: "07 · 学术发表与沃顿教授推荐信",
      badgeTop: "Academic & Wharton Reference",
      badgeMain: "ICBMMC 2025 一作录用 · Jonah Berger 推荐信",
      title: "ICBMMC 2025 录用论文 & 沃顿教授推荐信",
      summary: "第一作者英文论文《Analysis of the Causes of Sales Stagnation in Naruto Mobile Game》获国际会议录用；附宾夕法尼亚大学沃顿商学院教授推荐信。",
      role: "论文独立第一作者 / 沃顿商学院 STEPPS 营销科研课题项目组长",
      highlight: "从产品生态、文化本地化、技术体验与商业化机制四维剖析《火影忍者手游》运营痛点；带领组员完成迪士尼 STEPPS 研究并获推荐信。",
      tags: ["ICBMMC 2025 第一作者", "CPCI / SCOPUS 待检", "Wharton 课题组长", "Jonah Berger 推荐信"],
      image: "assets/covers/anime-naruto.jpg",
      isArchive: true,
      alt: "ICBMMC 2025 录用论文与沃顿商学院教授推荐信",
      actions: [
        { label: "查看录用论文", href: "paper.html", primary: true },
        { label: "查看教授推荐信", href: "reference.html" },
        { label: "联系索取签字版", href: "contact.html" }
      ]
    }
  ];

  const ac = new AbortController();
  const sig = ac.signal;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const gallerySection = root.querySelector("[data-wb-gallery]");
  const gridSection = root.querySelector("[data-wb-grid]");
  const corridor = root.querySelector("[data-wb-corridor]");
  const tabsWrap = root.querySelector("[data-wb-tabs]");
  const prevBtn = root.querySelector("[data-wb-prev]");
  const nextBtn = root.querySelector("[data-wb-next]");
  const modal = root.querySelector("[data-wb-modal]");
  const modalImg = root.querySelector("[data-wb-modal-img]");
  const modalCap = root.querySelector("[data-wb-modal-cap]");

  let isGridView = false;
  let activeIndex = 0;
  let scrollRAF = 0;

  function findIndexByHash(hashStr) {
    const clean = (hashStr || "").replace(/^#/, "").trim();
    if (!clean) return -1;
    return EXHIBITS.findIndex((item) => item.id === clean);
  }

  function buildVisualBox(ex) {
    if (ex.isArchive) {
      return `
        <div class="wb-archive-visual">
          <div class="wb-archive-pane">
            <span class="wb-archive-tag">ICBMMC 2025 · 第一作者</span>
            <strong>Analysis of the Causes of Sales Stagnation in Naruto Mobile Game</strong>
            <p>通过同行评审被国际会议录用，将提交 CPCI / SCOPUS 索引；独立完成消费者行为与商业化分析。</p>
          </div>
          <div class="wb-archive-pane">
            <span class="wb-archive-tag">Wharton · 教授推荐信</span>
            <strong>宾夕法尼亚大学沃顿商学院 Jonah Berger 教授推荐信</strong>
            <p>担任科研项目组长，带领团队运用 STEPPS 理论拆解迪士尼市场营销策略并产出英文论文。</p>
          </div>
          <figcaption class="wb-glass-caption">
            <span>${ex.badgeTop}</span>
            <strong>${ex.badgeMain}</strong>
          </figcaption>
        </div>
      `;
    }
    return `
      <figure class="wb-preview-figure" data-zoom-trigger title="点击放大查看高清预览">
        <img src="${ex.image}" alt="${ex.alt}" draggable="false" loading="eager" decoding="async" />
        <figcaption class="wb-glass-caption">
          <span>${ex.badgeTop}</span>
          <strong>${ex.badgeMain}</strong>
        </figcaption>
      </figure>
    `;
  }

  function createActionBtn(act) {
    const a = document.createElement("a");
    a.className = "wb-btn" + (act.primary ? " wb-btn--primary" : "");
    a.href = act.href;
    a.textContent = act.label;
    if (act.external) {
      a.target = "_blank";
      a.rel = "noreferrer";
    }
    if (act.download) {
      a.setAttribute("download", act.download);
    }
    if (act.pdf) {
      a.setAttribute("data-pdf-download", "");
    }
    return a;
  }

  const slideNodes = EXHIBITS.map((ex, idx) => {
    const slide = document.createElement("article");
    slide.className = "wb-bento-slide";
    slide.dataset.index = String(idx);

    const tagsHTML = ex.tags.map((t) => `<span>${t}</span>`).join("");
    slide.innerHTML = `
      <div class="wb-bento-grid">
        <div class="wb-visual-col">
          ${buildVisualBox(ex)}
        </div>
        <div class="wb-copy-col">
          <div class="wb-kicker-row">
            <span class="wb-kicker-pill"><i></i>${ex.kicker}</span>
          </div>
          <h2 class="wb-slide-title">${ex.title}</h2>
          <p class="wb-slide-summary">${ex.summary}</p>
          <div class="wb-detail-stack">
            <div class="wb-accent-note">
              <strong>担任角色</strong>
              <span>${ex.role}</span>
            </div>
            <div class="wb-accent-note">
              <strong>核心看点</strong>
              <span>${ex.highlight}</span>
            </div>
          </div>
          <div class="wb-slide-tags">${tagsHTML}</div>
          <div class="wb-actions" data-slide-actions></div>
        </div>
      </div>
    `;

    const actWrap = slide.querySelector("[data-slide-actions]");
    ex.actions.forEach((act) => actWrap.appendChild(createActionBtn(act)));

    if (!ex.isArchive) {
      const zoomBtn = document.createElement("button");
      zoomBtn.type = "button";
      zoomBtn.className = "wb-btn";
      zoomBtn.textContent = "放大预览";
      zoomBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(ex);
      });
      actWrap.appendChild(zoomBtn);

      const fig = slide.querySelector("[data-zoom-trigger]");
      if (fig) {
        fig.addEventListener("click", () => {
          if (activeIndex === idx) openLightbox(ex);
        });
      }
    }

    slide.addEventListener("click", (e) => {
      if (activeIndex !== idx && !e.target.closest("a, button")) {
        scrollToSlide(idx, true);
      }
    }, { signal: sig });

    corridor.appendChild(slide);

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "wb-dock-pill";
    tab.setAttribute("role", "tab");
    tab.innerHTML = `<span class="wb-dock-num">${ex.num}</span><span>${ex.shortTitle}</span>`;
    tab.addEventListener("click", () => scrollToSlide(idx, true), { signal: sig });
    tabsWrap.appendChild(tab);

    return slide;
  });

  function applyActiveUI(idx) {
    activeIndex = idx;
    slideNodes.forEach((n, i) => n.classList.toggle("is-active", i === idx));
    Array.from(tabsWrap.children).forEach((tab, i) => {
      const on = i === idx;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === EXHIBITS.length - 1;
  }

  function updateSpatialTransforms() {
    scrollRAF = 0;
    if (isGridView) return;

    const viewCenter = corridor.scrollLeft + corridor.clientWidth / 2;
    let closestIdx = 0;
    let minDistance = Infinity;

    slideNodes.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = slideCenter - viewCenter;
      const absDist = Math.abs(dist);
      if (absDist < minDistance) {
        minDistance = absDist;
        closestIdx = i;
      }

      if (reduceMotion) {
        slide.style.transform = "";
        slide.style.opacity = "";
        return;
      }

      const norm = Math.min(1.5, absDist / Math.max(1, slide.offsetWidth));
      const scale = 1 - norm * 0.065;
      const opacity = Math.max(0.45, 1 - norm * 0.38);
      slide.style.transform = `scale(${scale.toFixed(4)})`;
      slide.style.opacity = opacity.toFixed(3);
    });

    if (closestIdx !== activeIndex) {
      applyActiveUI(closestIdx);
    }
  }

  function scrollToSlide(idx, smooth) {
    const clamped = Math.max(0, Math.min(EXHIBITS.length - 1, idx));
    const target = slideNodes[clamped];
    if (!target) return;
    const left = target.offsetLeft - (corridor.clientWidth - target.offsetWidth) / 2;
    corridor.scrollTo({
      left: Math.max(0, left),
      behavior: smooth && !reduceMotion ? "smooth" : "auto"
    });
    applyActiveUI(clamped);
  }

  corridor.addEventListener("scroll", () => {
    if (!scrollRAF) {
      scrollRAF = window.requestAnimationFrame(updateSpatialTransforms);
    }
  }, { passive: true, signal: sig });

  window.addEventListener("resize", () => {
    scrollToSlide(activeIndex, false);
    updateSpatialTransforms();
  }, { signal: sig });

  // Desktop Mouse Click-and-Drag (strictly mouse-only & strictly horizontal axis lock; touch & trackpad use native OS scroll-snap)
  let mouseDown = false;
  let dragLockedX = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;

  corridor.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest("a, button")) return;
    mouseDown = true;
    dragLockedX = false;
    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = corridor.scrollLeft;
  }, { signal: sig });

  window.addEventListener("pointermove", (e) => {
    if (!mouseDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!dragLockedX) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        mouseDown = false;
        return;
      }
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragLockedX = true;
        corridor.classList.add("is-dragging");
      }
    }

    if (dragLockedX) {
      e.preventDefault();
      corridor.scrollLeft = startScrollLeft - dx * 1.15;
    }
  }, { passive: false, signal: sig });

  const finishMouseDrag = () => {
    if (!mouseDown) return;
    const wasDragging = dragLockedX;
    mouseDown = false;
    dragLockedX = false;
    corridor.classList.remove("is-dragging");
    if (wasDragging) {
      scrollToSlide(activeIndex, true);
    }
  };
  window.addEventListener("pointerup", finishMouseDrag, { signal: sig });
  window.addEventListener("pointercancel", finishMouseDrag, { signal: sig });

  corridor.addEventListener("click", (e) => {
    if (Math.abs(corridor.scrollLeft - startScrollLeft) > 12 && e.pointerType === "mouse") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true, signal: sig });

  // Lightbox
  function openLightbox(ex) {
    modalImg.src = ex.image;
    modalImg.alt = ex.alt;
    modalCap.textContent = `${ex.title} — ${ex.badgeMain}`;
    modal.hidden = false;
  }
  function closeLightbox() {
    modal.hidden = true;
  }
  root.querySelector("[data-wb-modal-close]").addEventListener("click", closeLightbox, { signal: sig });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  }, { signal: sig });

  // Prev / Next Arrows & Keyboard Left / Right
  prevBtn.addEventListener("click", () => scrollToSlide(activeIndex - 1, true), { signal: sig });
  nextBtn.addEventListener("click", () => scrollToSlide(activeIndex + 1, true), { signal: sig });

  window.addEventListener("keydown", (e) => {
    if (!modal.hidden) {
      if (e.key === "Escape") closeLightbox();
      return;
    }
    if (isGridView || document.body.classList.contains("guide-open")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToSlide(activeIndex + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToSlide(activeIndex - 1, true);
    }
  }, { signal: sig });

  // Hash & TOC integration
  window.addEventListener("hashchange", () => {
    const idx = findIndexByHash(window.location.hash);
    if (idx >= 0) scrollToSlide(idx, true);
  }, { signal: sig });

  document.addEventListener("click", (e) => {
    const tocBtn = e.target.closest(".toc-section-link");
    if (!tocBtn || isGridView) return;
    const numSpan = tocBtn.querySelector(".toc-section-index");
    if (!numSpan) return;
    const idx = parseInt(numSpan.textContent, 10) - 1;
    if (idx >= 0 && idx < EXHIBITS.length) scrollToSlide(idx, true);
  }, { signal: sig });

  // View Switcher
  const viewBtns = root.querySelectorAll("[data-wb-view]");
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      isGridView = btn.dataset.wbView === "grid";
      gallerySection.hidden = isGridView;
      gridSection.hidden = !isGridView;
      viewBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (!isGridView) {
        window.requestAnimationFrame(() => {
          scrollToSlide(activeIndex, false);
          updateSpatialTransforms();
        });
      }
    }, { signal: sig });
  });

  // Initial position
  const startIdx = Math.max(0, findIndexByHash(window.location.hash));
  applyActiveUI(startIdx);
  window.requestAnimationFrame(() => {
    scrollToSlide(startIdx, false);
    updateSpatialTransforms();
  });

  window.__lzqSanctumDestroy = function () {
    ac.abort();
    if (scrollRAF) window.cancelAnimationFrame(scrollRAF);
  };
})();
