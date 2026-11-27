// 全站轻交互：当前导航、返回顶部、纸张面板跟手、生活标签点亮、复制联系方式。
// 包一层 IIFE：SPA 切页会重复执行本文件，顶层 const/let 必须限定作用域，否则第二次执行会报「已声明」。
(function () {
const page = document.body.dataset.page;
document.querySelectorAll("[data-nav]").forEach((link) => {
  if (link.dataset.nav === page) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }
});

const hydrateDeferredImages = (root = document) => {
  root.querySelectorAll("img[data-src]").forEach((image) => {
    image.loading = "eager";
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  });
};

const lifePhotos = [
  { src: "assets/life/life-01.jpg", alt: "随机生活照片：日常", caption: "日常" },
  { src: "assets/life/life-02.jpg", alt: "随机生活照片：夜晚街道", caption: "夜路" },
  { src: "assets/life/life-03.jpg", alt: "随机生活照片：富士山", caption: "富士山" },
  { src: "assets/life/life-04.jpg", alt: "随机生活照片：音乐现场", caption: "现场" },
  { src: "assets/life/life-05.jpg", alt: "随机生活照片：日落海边", caption: "日落" },
  { src: "assets/life/life-06.jpg", alt: "随机生活照片：街区旅行", caption: "街区" },
  { src: "assets/life/life-07.jpg", alt: "随机生活照片：山路红车", caption: "山路" },
  { src: "assets/life/life-08.jpg", alt: "随机生活照片：新加坡夜景", caption: "新加坡" },
  { src: "assets/life/life-09.jpg", alt: "随机生活照片：茶屋", caption: "茶屋" },
  { src: "assets/life/life-10-wilderness.jpg", alt: "随机生活照片：荒野与火山地貌", caption: "荒野" },
  { src: "assets/life/life-12-lake-windmills.jpg", alt: "随机生活照片：湖泊与风车", caption: "湖风" },
  { src: "assets/life/life-13-cloudfield.jpg", alt: "随机生活照片：草原与云层", caption: "云野" },
];

const homePhotos = [
  { src: "assets/profile-hero.jpg", alt: "李宗谦个人照片" },
  ...lifePhotos.map(({ src, alt }) => ({ src, alt })),
];

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const swapImageAfterLoad = (image, photo, caption) => {
  if (!image || !photo) return;
  const apply = () => {
    image.src = photo.src;
    image.alt = photo.alt;
    if (caption) caption.textContent = photo.caption;
  };
  if ((image.currentSrc || image.getAttribute("src"))?.endsWith(photo.src)) {
    apply();
    return;
  }
  const next = new Image();
  next.decoding = "async";
  next.fetchPriority = "high";
  next.onload = apply;
  next.src = photo.src;
};

let lastRandomLifePhotoSrc = "";
const pickRandomLifePhoto = (currentSource = "") => {
  const candidates = lifePhotos.filter(
    (photo) => photo.src !== lastRandomLifePhotoSrc && !currentSource.endsWith(photo.src)
  );
  const pool = candidates.length ? candidates : lifePhotos;
  return pool[Math.floor(Math.random() * pool.length)];
};

const refreshRandomLifePhotos = (root = document) => {
  root.querySelectorAll("[data-random-life-photo]").forEach((image) => {
    const currentSource =
      image.dataset.randomSrc || image.dataset.src || image.currentSrc || image.getAttribute("src") || "";
    const photo = pickRandomLifePhoto(currentSource);
    image.loading = "eager";
    image.fetchPriority = "high";
    image.alt = photo.alt;
    image.dataset.randomSrc = photo.src;
    image.src = photo.src;
    image.removeAttribute("data-src");
    lastRandomLifePhotoSrc = photo.src;
  });
};

const refreshRandomHomePhotos = (root = document) => {
  root.querySelectorAll("[data-random-home-photo]").forEach((image) => {
    const currentSource = image.currentSrc || image.getAttribute("src") || "";
    const candidates = homePhotos.filter((photo) => !currentSource.endsWith(photo.src));
    const pool = candidates.length ? candidates : homePhotos;
    const photo = pool[Math.floor(Math.random() * pool.length)];
    image.loading = "eager";
    image.fetchPriority = "high";
    image.removeAttribute("data-src");
    swapImageAfterLoad(image, photo);
  });
};

refreshRandomHomePhotos();

document.querySelectorAll("[data-life-hero-snaps]").forEach((gallery) => {
  const selected = shuffle(lifePhotos).slice(0, 3);
  gallery.querySelectorAll("figure").forEach((figure, index) => {
    const photo = selected[index];
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (image && photo) {
      image.loading = "eager";
      image.fetchPriority = "high";
      swapImageAfterLoad(image, photo, caption);
    }
  });
});

const loadTravelGlobe = () => {
  if (!document.querySelector("[data-travel-globe]")) return Promise.resolve();
  if (!window.__lzqTravelGlobeLoad) {
    window.__lzqTravelGlobeLoad = import("./globe.js").catch((error) => {
      document.querySelectorAll("[data-travel-globe]").forEach((stage) => {
        stage.classList.add("is-fallback");
      });
      throw error;
    });
  }
  return window.__lzqTravelGlobeLoad;
};

const setupPhotoWall = (track) => {
  if (track.dataset.photoWallReady === "true") return;
  if (!track.dataset.photoWallSource) {
    const sourceFigures = Array.from(track.querySelectorAll("figure")).filter(
      (figure) => !figure.hasAttribute("aria-hidden")
    );
    track.dataset.photoWallSource = sourceFigures.map((figure) => figure.outerHTML).join("");
  }

  const template = document.createElement("template");
  template.innerHTML = track.dataset.photoWallSource;
  const sourceFigures = Array.from(template.content.querySelectorAll("figure"));
  if (sourceFigures.length < 2) return;

  const baseOrder = sourceFigures.map((_, index) => index);
  const initialOffset = Math.floor(Math.random() * baseOrder.length);
  const row = baseOrder.slice(initialOffset).concat(baseOrder.slice(0, initialOffset));
  const order = row;

  const buildFigure = (index, hidden = false) => {
    const figure = sourceFigures[index].cloneNode(true);
    const image = figure.querySelector("img");
    if (image) {
      const width = Number(image.getAttribute("width")) || image.naturalWidth || 3;
      const height = Number(image.getAttribute("height")) || image.naturalHeight || 4;
      figure.style.setProperty("--photo-ratio", `${width} / ${height}`);
      image.loading = "eager";
      image.decoding = "async";
      if (hidden) image.alt = "";
    }
    if (hidden) figure.setAttribute("aria-hidden", "true");
    return figure;
  };

  track.replaceChildren(...order.map((index) => buildFigure(index)), ...order.map((index) => buildFigure(index, true)));

  const wall = track.closest(".life-photo-wall");
  let offset = 0;
  let pointerId = null;
  let pointerStartX = 0;
  let offsetStart = 0;
  let didDrag = false;
  let lastFrame = performance.now();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const loopWidth = () => track.scrollWidth / 2;
  const normalizeOffset = () => {
    const width = loopWidth();
    if (!width) return;
    while (offset <= -width) offset += width;
    while (offset > 0) offset -= width;
  };
  const render = () => {
    normalizeOffset();
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  track.querySelectorAll("img").forEach((image) => {
    image.draggable = false;
  });
  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    offsetStart = offset;
    didDrag = false;
    track.classList.add("is-dragging");
    track.setPointerCapture?.(pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 4) didDrag = true;
    offset = offsetStart + distance;
    render();
    event.preventDefault();
  });
  const endDrag = (event) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture?.(event.pointerId)) track.releasePointerCapture(event.pointerId);
    window.setTimeout(() => {
      didDrag = false;
    }, 0);
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("lostpointercapture", () => {
    pointerId = null;
    track.classList.remove("is-dragging");
  });
  track.addEventListener("click", (event) => {
    if (didDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    offset += event.key === "ArrowLeft" ? 120 : -120;
    render();
  });
  track.tabIndex = 0;
  track.dataset.photoWallReady = "true";

  const animate = (now) => {
    const elapsed = Math.min(now - lastFrame, 80);
    lastFrame = now;
    if (pointerId === null && !reduceMotion.matches) {
      offset -= elapsed * 0.018;
      render();
    }
    window.requestAnimationFrame(animate);
  };
  if (wall) wall.addEventListener("mouseleave", () => track.blur(), { passive: true });
  window.requestAnimationFrame(animate);
};

document.querySelectorAll("[data-photo-wall]").forEach(setupPhotoWall);

const backTop = document.querySelector("[data-back-top]");
if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("is-visible", window.scrollY > 420);
  });
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

document.querySelectorAll(".life-tag").forEach((tag) => {
  tag.addEventListener("click", () => tag.classList.toggle("is-lit"));
});

document.querySelectorAll(".photo-frame, .comic-board, .life-index-panel, .talent-radar").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    card.style.setProperty("--tilt-x", `${x}px`);
    card.style.setProperty("--tilt-y", `${y}px`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "已复制";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      button.textContent = text;
    }
  });
});

let downloadToastTimer;
const showDownloadToast = (message) => {
  let toast = document.querySelector("[data-download-toast]");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "download-toast";
    toast.dataset.downloadToast = "";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(downloadToastTimer);
  downloadToastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
};

document.addEventListener("click", async (event) => {
  const link = event.target.closest("a[data-pdf-download]");
  if (!link || event.defaultPrevented || event.button !== 0) return;
  if (link.hasAttribute("data-native-download")) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.classList.contains("is-downloading")) {
    event.preventDefault();
    return;
  }
  const href = link.getAttribute("href");
  const base64Source = link.dataset.pdfBase64;
  if ((!href || href === "#") && !base64Source) return;

  event.preventDefault();
  const filename = link.getAttribute("download") || "李宗谦-香港城市大学.pdf";
  const canSwapText = link.children.length === 0;
  const originalText = canSwapText ? link.textContent : "";
  const status = document.querySelector("[data-status]");
  link.classList.add("is-downloading");
  link.setAttribute("aria-busy", "true");
  if (canSwapText) link.textContent = "准备 PDF...";
  if (status) status.textContent = "正在准备 PDF，文件大时会多等几秒。";
  showDownloadToast("正在准备 PDF，文件大时会多等几秒。");
  try {
    let blob;
    if (base64Source) {
      const response = await fetch(base64Source, { cache: "no-store" });
      if (!response.ok) throw new Error(`PDF base64 request failed: ${response.status}`);
      const base64 = (await response.text()).replace(/\s/g, "");
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      blob = new Blob([bytes], { type: "application/pdf" });
    } else {
      const response = await fetch(href, { cache: "no-store" });
      if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
      const body = await response.blob();
      blob = body.type === "application/pdf" ? body : new Blob([body], { type: "application/pdf" });
    }
    const url = URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
    if (canSwapText) link.textContent = "已开始下载";
    if (status) status.textContent = "下载已开始。";
    showDownloadToast("下载已开始。");
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch {
    const tempLink = document.createElement("a");
    tempLink.href = href;
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
    if (canSwapText) link.textContent = "已交给浏览器";
    if (status) status.textContent = "已交给浏览器处理下载。";
    showDownloadToast("已交给浏览器处理下载。");
  } finally {
    window.setTimeout(() => {
      link.classList.remove("is-downloading");
      link.removeAttribute("aria-busy");
      if (canSwapText) link.textContent = originalText;
    }, 1800);
  }
});

document.querySelectorAll("[data-signal-board]").forEach((board) => {
  const tabs = board.querySelectorAll("[data-signal-tab]");
  const copy = board.querySelector("[data-signal-copy]");
  tabs.forEach((tab) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", tab.classList.contains("is-active") ? "true" : "false");
    tab.addEventListener("click", () => {
      tabs.forEach((item) => {
        item.classList.toggle("is-active", item === tab);
        item.setAttribute("aria-selected", item === tab ? "true" : "false");
      });
      if (copy) copy.textContent = tab.dataset.signalText || "";
    });
  });
});

const modeToggle = document.querySelector("[data-mode-toggle]");
if (modeToggle) {
  const views = document.querySelectorAll("[data-mode-view]");
  const label = modeToggle.querySelector("[data-mode-label]");
  const icon = modeToggle.querySelector("[data-mode-icon]");
  const flash = document.querySelector("[data-mode-flash]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const preloadedSources = new Set();
  const preloadedImages = [];
  const preloadPromises = new Map();
  let hasSetInitialMode = false;

  const preloadImageSource = (source, priority = "low") => {
    if (!source) return Promise.resolve();
    if (preloadPromises.has(source)) return preloadPromises.get(source);
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    const promise = new Promise((resolve) => {
      image.onload = resolve;
      image.onerror = resolve;
    });
    image.src = source;
    preloadedSources.add(source);
    preloadedImages.push(image);
    preloadPromises.set(source, promise);
    return promise;
  };

  const preloadModeImages = (mode, priority = "low", selector = "img") => {
    const sources = new Set();
    views.forEach((view) => {
      if (view.dataset.modeView !== mode) return;
      view.querySelectorAll(selector).forEach((image) => {
        if (image.currentSrc || image.src) sources.add(image.currentSrc || image.src);
        if (image.dataset?.src) sources.add(image.dataset.src);
      });
    });
    return Promise.allSettled(Array.from(sources, (source) => preloadImageSource(source, priority)));
  };

  const waitForDomImage = (image) =>
    new Promise((resolve) => {
      image.loading = "eager";
      image.fetchPriority = "high";
      if (image.dataset?.src && image.getAttribute("src")?.startsWith("data:")) {
        image.src = image.dataset.src;
        image.removeAttribute("data-src");
      }
      const finish = () => {
        window.clearTimeout(timer);
        if (image.decode) {
          image.decode().catch(() => null).finally(resolve);
        } else {
          resolve();
        }
      };
      const timer = window.setTimeout(resolve, 7000);
      if (image.complete && image.naturalWidth > 0) {
        finish();
        return;
      }
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    });

  const waitForModeDomImages = (mode, selector) => {
    const waits = [];
    views.forEach((view) => {
      if (view.dataset.modeView !== mode) return;
      hydrateDeferredImages(view);
      view.querySelectorAll(selector).forEach((image) => waits.push(waitForDomImage(image)));
    });
    return Promise.allSettled(waits);
  };

  const prepareLifeMode = async () => {
    const selector = ".profile-hero-card img, .profile-life-gallery img, .game-cover-row img";
    views.forEach((view) => {
      if (view.dataset.modeView !== "life") return;
      refreshRandomLifePhotos(view);
      view.querySelectorAll("[data-photo-wall]").forEach(setupPhotoWall);
    });
    await preloadModeImages("life", "high", selector);
    await waitForModeDomImages("life", selector);
  };

  const setMode = (mode) => {
    const isLife = mode === "life";
    document.body.classList.toggle("life-mode", isLife);
    modeToggle.setAttribute("aria-pressed", String(isLife));
    modeToggle.setAttribute("aria-label", isLife ? "切回工作模式" : "打开生活模式");
    if (label) label.textContent = isLife ? "工作模式" : "生活模式";
    if (icon) icon.textContent = isLife ? "W" : "L";
    views.forEach((view) => {
      const active = view.dataset.modeView === mode;
      view.hidden = !active;
      view.inert = !active;
      view.setAttribute("aria-hidden", String(!active));
      view.classList.toggle("is-entering", active);
      if (active) {
        window.setTimeout(() => view.classList.remove("is-entering"), 420);
      }
    });
    if (themeColor) themeColor.setAttribute("content", isLife ? "#fff6e7" : "#f5f5f7");
    if (isLife) {
      views.forEach((view) => {
        if (view.dataset.modeView === "life") hydrateDeferredImages(view);
      });
      loadTravelGlobe();
      if (hasSetInitialMode) preloadModeImages("life");
    } else if (hasSetInitialMode) {
      views.forEach((view) => {
        if (view.dataset.modeView === "work") refreshRandomHomePhotos(view);
      });
    }
    if (flash && hasSetInitialMode && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flash.classList.remove("is-active");
      void flash.offsetWidth;
      flash.classList.add("is-active");
    }
    document.dispatchEvent(new CustomEvent("home-mode-change", { detail: { mode } }));
    hasSetInitialMode = true;
  };

  // 每次打开默认工作模式;只有手动点击才切到生活模式,不做记忆(不读写 localStorage)。
  setMode("work");
  window.setTimeout(() => preloadModeImages("life"), 700);
  let isPreparingLifeMode = false;
  modeToggle.addEventListener("click", () => {
    const nextMode = document.body.classList.contains("life-mode") ? "work" : "life";
    setMode(nextMode);
    if (nextMode === "life") {
      if (isPreparingLifeMode) return;
      isPreparingLifeMode = true;
      modeToggle.classList.add("is-loading");
      prepareLifeMode().finally(() => {
        modeToggle.classList.remove("is-loading");
        isPreparingLifeMode = false;
      });
    }
  });
}

if (page === "life") {
  loadTravelGlobe();
}

// 苹果式滚动字体：hero 大标题随滚动「后退」（缩小 + 上移 + 淡出），章节进入视口时渐显。
// 只用 transform / opacity，跑在合成线程上，不触发重排。
const setupAppleScrollTypography = () => {
  const workShell = document.querySelector('[data-mode-view="work"]');
  if (!workShell) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) hero 大标题随滚动后退
  const heroName = workShell.querySelector(".profile-hero-copy h1");
  if (heroName && !reduceMotion) {
    let ticking = false;
    const renderHero = () => {
      ticking = false;
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.85));
      const translateY = (progress * 26).toFixed(2);
      const scale = (1 - progress * 0.06).toFixed(3);
      const opacity = (1 - progress * 0.5).toFixed(3);
      heroName.style.transform = `translateY(${translateY}px) scale(${scale})`;
      heroName.style.opacity = opacity;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(renderHero);
        }
      },
      { passive: true }
    );
    renderHero();
  }

  // 2) 章节滚动渐显
  const sections = workShell.querySelectorAll(".profile-section");
  if (sections.length && !reduceMotion) {
    sections.forEach((section) => section.classList.add("reveal"));
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }
};

setupAppleScrollTypography();

// ===== 工作区叙事开场（仅首页工作模式；可跳过，兼容 reduced-motion）=====
const setupWorkIntro = () => {
  const intro = document.querySelector("[data-work-intro]");
  if (!intro) return;
  if (document.body.classList.contains("life-mode")) {
    intro.remove();
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    intro.remove();
    return;
  }

  // 检查 sessionStorage：本次会话已播放过，直接跳过
  const INTRO_SEEN_KEY = "lzq-intro-seen";
  if (window.sessionStorage && window.sessionStorage.getItem(INTRO_SEEN_KEY) === "true") {
    intro.remove();
    return;
  }

  let exited = false;
  const dismiss = () => exit();
  const onKey = (event) => {
    if (["Escape", "ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      exit();
    }
  };
  const finish = () => {
    document.body.classList.remove("is-intro-locked");
    document.documentElement.classList.remove("is-intro-locked");
    window.removeEventListener("wheel", dismiss);
    window.removeEventListener("touchmove", dismiss);
    window.removeEventListener("keydown", onKey);
    intro.remove();
    // 标记本次会话已播放
    if (window.sessionStorage) {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, "true");
    }
  };
  const exit = () => {
    if (exited) return;
    exited = true;
    intro.dataset.phase = "exit";
    window.setTimeout(finish, 950);
  };

  document.body.classList.add("is-intro-locked");
  document.documentElement.classList.add("is-intro-locked");

  // 入场节奏：米白加载 → 品牌整屏 → 主视觉揭示（此后停留，等交互才撤走）
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  const scale = isMobile ? 0.6 : 1;
  window.setTimeout(() => {
    intro.dataset.phase = "brand";
  }, Math.round(1100 * scale));
  window.setTimeout(() => {
    intro.dataset.phase = "stage";
  }, Math.round(2100 * scale));

  // —— 交互撤走 ——
  window.addEventListener("wheel", dismiss, { passive: true });
  window.addEventListener("touchmove", dismiss, { passive: true });
  window.addEventListener("keydown", onKey);

  const view = intro.querySelector("[data-wi-view]");
  if (view) {
    view.addEventListener("click", (event) => {
      event.preventDefault();
      exit();
    });
  }

  // 下载简历也视作一次交互，撤走开场（不阻止默认下载逻辑）
  const download = intro.querySelector("[data-pdf-download]");
  if (download) download.addEventListener("click", () => exit());

  // 切到生活模式时也退出开场
  const toggle = document.querySelector("[data-mode-toggle]");
  if (toggle) toggle.addEventListener("click", exit);
};

setupWorkIntro();

// ===== 内页通用滚动渐入 + 卡点（保留漫趣风格，只加动效）=====
const setupPageReveal = () => {
  if (document.body.dataset.page === "home") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const selector = [
    ".page-hero",
    ".timeline-item",
    ".output-panel",
    ".mini-metrics",
    ".comic-board",
    ".proof-board",
    ".card",
    ".note-panel",
    ".speech-bubble",
    ".paper-stack",
    ".flagship-work",
    ".console-panel",
    ".cv-section",
    ".cv-row",
    ".culture-block",
    ".cover-card",
    ".game-cover-card",
    ".friend-card",
    ".contact-card",
    ".contact-row",
    ".material-list"
  ].join(",");

  const targets = Array.from(document.querySelectorAll(selector));
  if (!targets.length) return;

  targets.forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.remove("reveal"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-revealed");
        obs.unobserve(el);
        // 只清掉 .reveal（隐藏态），保留 .is-revealed —— 否则 .timeline-item/.cv-section
        // 的基础 opacity:0 会在 950ms 后把已显示的内容重新藏起来。
        window.setTimeout(() => el.classList.remove("reveal"), 950);
      });
    },
    { threshold: 0, rootMargin: "0px 0px 8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));

  // 兜底：短暂延迟后，凡已进入视口却仍未显示的内容，强制显示，保证稳定加载。
  window.setTimeout(() => {
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-revealed");
        el.classList.remove("reveal");
      }
    });
  }, 1200);
};

setupPageReveal();

// ===== 全站章节滚动渐入 =====
const setupScrollReveal = () => {
  const targets = document.querySelectorAll(".section, .profile-section, .cv-section, .timeline-item");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px 8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));

  // 兜底：保证已进入视口的内容稳定显示，不被观察器时序遗漏。
  window.setTimeout(() => {
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-revealed");
      }
    });
  }, 1200);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupScrollReveal);
} else {
  setupScrollReveal();
}
})();
