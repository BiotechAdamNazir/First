// Poster Studio editor: gallery, form, live preview, PNG export, save/load.
(function () {
  "use strict";

  const { TEMPLATES, CATEGORIES, ICON, esc, initials } = window.POSTER;
  const SIZES = {
    square: { w: 1080, h: 1080, label: "1:1 Square", hint: "Instagram / Facebook feed · 1080 × 1080" },
    portrait: { w: 1080, h: 1350, label: "4:5 Portrait", hint: "Instagram feed (biggest in the feed) · 1080 × 1350" },
    story: { w: 1080, h: 1920, label: "9:16 Story", hint: "IG / FB Story, WhatsApp Status, TikTok · 1080 × 1920" },
  };
  const STORE = "poster-studio-v1";
  const $ = (id) => document.getElementById(id);

  // ---------------------------------------------------------------- state
  const fresh = () => ({ templateId: TEMPLATES[0].id, size: "square", brand: { ...window.BRAND_DEFAULTS }, values: {} });

  function normalise(s) {
    const d = fresh();
    if (!s || typeof s !== "object") return d;
    return {
      templateId: TEMPLATES.some((t) => t.id === s.templateId) ? s.templateId : d.templateId,
      size: SIZES[s.size] ? s.size : d.size,
      brand: { ...d.brand, ...(s.brand || {}) },
      values: s.values && typeof s.values === "object" ? s.values : {},
    };
  }

  let state;
  try {
    state = normalise(JSON.parse(localStorage.getItem(STORE)));
  } catch (e) {
    state = fresh();
  }
  function persist() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch (e) {
      toast("Couldn't remember changes in this browser (storage full or blocked). Use “Save file”.");
    }
  }

  const tplById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
  function valuesFor(t, overrides) {
    const saved = (overrides || state.values[t.id]) || {};
    const v = {};
    t.fields.forEach((f) => (v[f.key] = saved[f.key] != null ? saved[f.key] : f.value));
    return v;
  }

  // ---------------------------------------------------------------- colour
  function colorsFor(brand) {
    const p = window.PALETTES.find((x) => x.id === brand.palette);
    return p && p.primary ? { primary: p.primary, accent: p.accent } : { primary: brand.primary, accent: brand.accent };
  }
  function luminance(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return 0;
    const n = parseInt(m[1], 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  // Pick white or near-black text, whichever contrasts more.
  const onColor = (hex) => (1.05 / (luminance(hex) + 0.05) >= (luminance(hex) + 0.05) / 0.05 ? "#ffffff" : "#15181e");

  // ---------------------------------------------------------------- poster
  function buildPoster(t, size, values, brand) {
    const c = colorsFor(brand);
    const el = document.createElement("div");
    el.className = `poster size-${size} theme-${t.theme} tpl-${t.id}`;
    el.style.cssText = `--primary:${c.primary};--accent:${c.accent};--on-primary:${onColor(c.primary)};--on-accent:${onColor(c.accent)}`;

    const logo = brand.logo
      ? `<div class="logo has-img"><img src="${esc(brand.logo)}" alt=""></div>`
      : `<div class="logo">${esc(brandInitials(brand.name))}</div>`;
    const contacts = [
      [brand.phone, ICON.chat],
      [brand.social, ICON.camera],
      [brand.website, ICON.globe],
      [brand.address, ICON.pin],
    ].filter(([v]) => v && String(v).trim());

    el.innerHTML = `
      <div class="p-deco"></div>
      <header class="p-head">${logo}<div class="brand"><b>${esc(brand.name)}</b>${brand.tagline ? `<small>${esc(brand.tagline)}</small>` : ""}</div></header>
      <main class="p-main"><div class="p-content">${t.render(values)}</div></main>
      ${contacts.length ? `<footer class="p-foot">${contacts.map(([v, ic]) => `<span>${ic}${esc(v)}</span>`).join("")}</footer>` : ""}`;

    // Decorations are written inline by templates for convenience; move them
    // to the background layer so they sit behind the header and footer too.
    const deco = el.querySelector(".p-deco");
    el.querySelectorAll(".p-content > [class^='deco-'], .p-content > .confetti").forEach((d) => deco.appendChild(d));
    return el;
  }

  // "Pusat Tuisyen Cahaya Ilmu" -> "CI": skip the generic words.
  const GENERIC = /^(pusat|tuisyen|tuition|centre|center|akademi|academy|learning|education|pendidikan|sdn|bhd|the|&)$/i;
  function brandInitials(name) {
    const words = String(name || "").trim().split(/\s+/).filter((w) => !GENERIC.test(w));
    return words.length ? initials(words.join(" ")) : initials(name);
  }

  // Scale the text block so it fills the space without overflowing.
  // Must be called while the poster is in the document.
  function fit(el) {
    const main = el.querySelector(".p-main");
    const content = el.querySelector(".p-content");
    main.style.fontSize = "";
    const base = parseFloat(getComputedStyle(main).fontSize);
    const fits = (px) => {
      main.style.fontSize = px + "px";
      return content.offsetHeight <= main.clientHeight * 0.97 && content.scrollWidth <= main.clientWidth + 1;
    };
    let lo = 12, hi = base * 1.22;
    if (fits(hi)) return;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    main.style.fontSize = lo.toFixed(2) + "px";
  }

  function imagesReady(el) {
    return Promise.all(
      [...el.querySelectorAll("img")].map((img) =>
        img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })
      )
    );
  }

  async function mountFitted(container, t, size, values, brand) {
    const el = buildPoster(t, size, values, brand);
    container.replaceChildren(el);
    await imagesReady(el);
    fit(el);
    return el;
  }

  // ---------------------------------------------------------------- export
  // The poster's own HTML + the real poster CSS + the embedded fonts go into an
  // SVG <foreignObject>, which the browser lays out afresh and we paint onto a
  // canvas. Because the CSS is re-applied (not frozen pixel sizes), line breaks
  // in the PNG match the preview.
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not render the poster image"));
      img.src = src;
    });

  async function toPng(t, size, values, brand) {
    const { w, h } = SIZES[size];
    const off = $("offscreen");
    const el = await mountFitted(off, t, size, values, brand);
    try {
      const css = ($("embedded-fonts") || {}).textContent + "\n" + window.POSTER_CSS;
      const html = new XMLSerializer().serializeToString(el);
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="100%" height="100%">` +
        `<div xmlns="http://www.w3.org/1999/xhtml"><style><![CDATA[${css}]]></style>${html}</div></foreignObject></svg>`;
      const img = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
      if (img.decode) await img.decode().catch(() => {});
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      // Draw twice: the first paint can happen before the embedded fonts are decoded.
      ctx.drawImage(img, 0, 0);
      await new Promise((r) => setTimeout(r, 60));
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } finally {
      off.replaceChildren();
    }
  }

  function download(dataUrl, name) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  const stamp = () => new Date().toISOString().slice(0, 10);

  async function exportSizes(sizes, btn) {
    const t = tplById(state.templateId);
    const buttons = [$("dl"), $("dl-all")];
    buttons.forEach((b) => (b.disabled = true));
    const label = btn.textContent;
    try {
      for (const s of sizes) {
        btn.textContent = `Rendering ${SIZES[s].label}…`;
        const url = await toPng(t, s, valuesFor(t), state.brand);
        download(url, `${t.id}-${s}-${stamp()}.png`);
      }
      toast(sizes.length > 1 ? "3 PNGs downloaded" : "PNG downloaded");
    } catch (e) {
      console.error(e);
      toast("Export failed. Try Chrome or Edge, or see README → Troubleshooting.");
    } finally {
      btn.textContent = label;
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  // ---------------------------------------------------------------- preview
  let renderQueued = false;
  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(async () => {
      renderQueued = false;
      const t = tplById(state.templateId);
      await mountFitted($("frame"), t, state.size, valuesFor(t), state.brand);
      scalePreview();
    });
  }
  function scalePreview() {
    const { w, h } = SIZES[state.size];
    const stage = $("stage");
    const cs = getComputedStyle(stage);
    const aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.max(0.1, Math.min(aw / w, ah / h, 1));
    const frame = $("frame");
    frame.style.width = w * k + "px";
    frame.style.height = h * k + "px";
    const p = frame.querySelector(".poster");
    if (p) p.style.transform = `scale(${k})`;
  }

  // ---------------------------------------------------------------- UI
  function renderGallery() {
    $("gallery").innerHTML = CATEGORIES.map((c) => {
      const items = TEMPLATES.filter((t) => t.category === c.id);
      if (!items.length) return "";
      return `<div class="cat"><h3>${esc(c.name)} · ${esc(c.en)}</h3><div class="cat-grid">${items
        .map(
          (t) => `<button class="thumb" data-id="${t.id}" aria-current="${t.id === state.templateId}">
            <img src="samples/${t.id}-square.png" alt="" loading="lazy" onerror="this.outerHTML='<div class=ph></div>'">
            <span>${esc(t.name)}<small>${esc(t.en)}</small></span></button>`
        )
        .join("")}</div></div>`;
    }).join("");
    $("gallery").querySelectorAll(".thumb").forEach((b) =>
      b.addEventListener("click", () => {
        state.templateId = b.dataset.id;
        persist();
        renderGallery();
        renderFields();
        queueRender();
        if (window.matchMedia("(max-width: 860px)").matches) $("stage").scrollIntoView({ behavior: "smooth" });
      })
    );
  }

  function renderSizes() {
    $("sizes").innerHTML = Object.entries(SIZES)
      .map(([id, s]) => `<button role="tab" data-size="${id}" aria-selected="${id === state.size}">${s.label}</button>`)
      .join("");
    $("sizes").querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        state.size = b.dataset.size;
        persist();
        renderSizes();
        queueRender();
      })
    );
    $("size-hint").textContent = SIZES[state.size].hint;
  }

  // Downscale uploaded images so saved state stays small.
  function readImage(file, maxSide) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const k = Math.min(1, maxSide / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          const isPng = /png|svg|gif|webp/.test(file.type);
          resolve(c.toDataURL(isPng ? "image/png" : "image/jpeg", 0.88));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  function fieldHtml(f, value) {
    const id = `f-${f.key}`;
    if (f.type === "image") {
      return `<label>${esc(f.label)}<div class="img-field">
        ${value ? `<img src="${esc(value)}" alt="">` : ""}
        <input type="file" accept="image/*" id="${id}">
        ${value ? `<button type="button" class="link" data-clear="${f.key}">Buang · Remove</button>` : ""}
      </div></label>`;
    }
    const hint = f.hint || (f.type === "rich" ? "*kata* = highlight · Enter = new line" : "");
    const input =
      f.type === "text"
        ? `<input type="text" id="${id}" value="${esc(value)}">`
        : `<textarea id="${id}" rows="${f.type === "list" ? Math.min(8, Math.max(3, String(value).split("\n").length + 1)) : 3}">${esc(value)}</textarea>`;
    return `<label>${esc(f.label)}${input}${hint ? `<span class="hint">${esc(hint)}</span>` : ""}</label>`;
  }

  function renderFields() {
    const t = tplById(state.templateId);
    const v = valuesFor(t);
    $("tpl-name").textContent = `${t.name} · ${t.en}`;
    const form = $("fields");
    form.innerHTML = t.fields.map((f) => fieldHtml(f, v[f.key])).join("");
    const set = (key, val) => {
      (state.values[t.id] = state.values[t.id] || {})[key] = val;
      persist();
      queueRender();
    };
    t.fields.forEach((f) => {
      const input = $(`f-${f.key}`);
      if (f.type === "image") {
        input.addEventListener("change", async () => {
          if (!input.files[0]) return;
          try {
            set(f.key, await readImage(input.files[0], 900));
            renderFields();
          } catch (e) {
            toast("Couldn't read that image.");
          }
        });
      } else {
        input.addEventListener("input", () => set(f.key, input.value));
      }
    });
    form.querySelectorAll("[data-clear]").forEach((b) =>
      b.addEventListener("click", () => {
        set(b.dataset.clear, "");
        renderFields();
      })
    );
  }

  const BRAND_FIELDS = [
    { key: "name", label: "Nama pusat · Centre name" },
    { key: "tagline", label: "Slogan · Tagline" },
    { key: "phone", label: "No. WhatsApp / telefon" },
    { key: "social", label: "Instagram / Facebook / TikTok" },
    { key: "website", label: "Laman web · Website" },
    { key: "address", label: "Lokasi · Location" },
  ];
  function renderBrand() {
    const b = state.brand;
    $("brand").innerHTML =
      BRAND_FIELDS.map((f) => `<label>${esc(f.label)}<input type="text" id="b-${f.key}" value="${esc(b[f.key] || "")}"></label>`).join("") +
      `<label>Logo<div class="img-field">${b.logo ? `<img src="${esc(b.logo)}" alt="">` : ""}<input type="file" accept="image/*" id="b-logo">
       ${b.logo ? `<button type="button" class="link" id="b-logo-clear">Buang · Remove</button>` : ""}</div>
       <span class="hint">PNG with a transparent background looks best. Empty = initials badge.</span></label>`;
    BRAND_FIELDS.forEach((f) =>
      $(`b-${f.key}`).addEventListener("input", (e) => {
        b[f.key] = e.target.value;
        persist();
        queueRender();
      })
    );
    $("b-logo").addEventListener("change", async (e) => {
      if (!e.target.files[0]) return;
      try {
        b.logo = await readImage(e.target.files[0], 600);
        persist();
        renderBrand();
        queueRender();
      } catch (err) {
        toast("Couldn't read that image.");
      }
    });
    const clr = $("b-logo-clear");
    if (clr)
      clr.addEventListener("click", () => {
        b.logo = "";
        persist();
        renderBrand();
        queueRender();
      });
  }

  function renderPalettes() {
    const b = state.brand;
    $("palettes").innerHTML = window.PALETTES.map((p) => {
      const c = p.primary ? p : { primary: b.primary, accent: b.accent };
      return `<button class="sw" data-p="${p.id}" title="${esc(p.name)}" aria-label="${esc(p.name)}" aria-pressed="${p.id === b.palette}"
        style="background:linear-gradient(135deg,${c.primary} 0 55%,${c.accent} 55% 100%)"></button>`;
    }).join("");
    $("palettes").querySelectorAll(".sw").forEach((s) =>
      s.addEventListener("click", () => {
        b.palette = s.dataset.p;
        persist();
        renderPalettes();
        queueRender();
      })
    );
    const c = colorsFor(b);
    $("c-primary").value = c.primary;
    $("c-accent").value = c.accent;
  }
  ["primary", "accent"].forEach((k) =>
    $(`c-${k}`).addEventListener("input", (e) => {
      const b = state.brand;
      // Editing a colour switches to the custom "brand" palette, starting from what you see.
      if (b.palette !== "brand") {
        const c = colorsFor(b);
        b.primary = c.primary;
        b.accent = c.accent;
        b.palette = "brand";
      }
      b[k] = e.target.value;
      persist();
      renderPalettes();
      queueRender();
    })
  );

  let toastTimer;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    $("dl").addEventListener("click", (e) => exportSizes([state.size], e.currentTarget));
    $("dl-all").addEventListener("click", (e) => exportSizes(Object.keys(SIZES), e.currentTarget));
    $("reset").addEventListener("click", () => {
      delete state.values[state.templateId];
      persist();
      renderFields();
      queueRender();
    });
    $("save-json").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ app: "poster-studio", version: 1, ...state }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      download(url, `poster-studio-${stamp()}.json`);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    $("load-json").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        state = normalise(JSON.parse(await file.text()));
        persist();
        renderAll();
        toast("Loaded " + file.name);
      } catch (err) {
        toast("That file isn't a Poster Studio save.");
      }
    });
    window.addEventListener("resize", scalePreview);
  }

  function renderAll() {
    renderGallery();
    renderSizes();
    renderFields();
    renderBrand();
    renderPalettes();
    queueRender();
  }

  // ---------------------------------------------------------------- API
  // Used by render-samples.js. job = { template, size, values?, brand? }
  window.PosterStudio = {
    templates: TEMPLATES.map((t) => ({ id: t.id, name: t.name, en: t.en, category: t.category })),
    sizes: SIZES,
    async mount(job) {
      await document.fonts.ready;
      const t = tplById(job.template);
      if (t.id !== job.template) throw new Error("Unknown template: " + job.template);
      if (!SIZES[job.size]) throw new Error("Unknown size: " + job.size);
      const brand = { ...window.BRAND_DEFAULTS, ...(job.brand || {}) };
      await mountFitted($("render-root"), t, job.size, valuesFor(t, job.values || {}), brand);
      return SIZES[job.size];
    },
    toPng: (job) => toPng(tplById(job.template), job.size, valuesFor(tplById(job.template), job.values || {}), { ...window.BRAND_DEFAULTS, ...(job.brand || {}) }),
  };

  if (new URLSearchParams(location.search).has("render")) {
    document.body.classList.add("render-mode");
  } else {
    wire();
    document.fonts.ready.then(renderAll);
  }
})();
