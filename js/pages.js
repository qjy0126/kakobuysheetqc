(function () {
  const params = new URLSearchParams(location.search);
  const $ = (sel) => document.querySelector(sel);

  function fill(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function applyCategoryCovers() {
    const covers = KF.categoryCovers || {};
    (KF.categories || []).forEach((c) => {
      if (covers[c.slug]) c.image = covers[c.slug];
    });
    if (KF.allProductCover) KF.allProductImage = KF.allProductCover;
  }

  function bindConverter() {
    const form = $("#link-converter");
    if (!form) return;
    const input = $("#convert-input");
    const note = $("#convert-note");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = (input && input.value) || "";
      const url = KF.extractUrl(raw) || raw.trim();
      if (!url) {
        if (note) note.textContent = "Paste a full product URL first.";
        return;
      }
      if (!KF.supported(url)) {
        if (note) note.textContent = "Supported links: Taobao, Tmall, Weidian, and 1688.";
        return;
      }
      const dest = KF.kakobuyUrl(url);
      KF.track("link_convert", { link_host: (() => { try { return new URL(url).hostname; } catch (_) { return ""; } })() });
      if (note) note.textContent = "Opening on Kakobuy…";
      window.open(dest, "_blank", "noopener");
    });
  }

  function renderHome() {
    applyCategoryCovers();
    fill("cat-grid", KF.categories.map((c) => `
      <a class="cat-card" href="${KF.catPath(c.slug)}">
        <span class="cat-thumb"><img src="${KF.asset(c.image)}" alt="" loading="lazy" decoding="async"></span>
        <span class="cat-name">${c.label}</span>
      </a>
    `).join("") + `
      <a class="cat-card cat-card--all" href="${KF.findsPath()}">
        <span class="cat-thumb">
          <img src="${KF.asset(KF.allProductImage)}" alt="" loading="lazy" decoding="async">
          <em>ALL PRODUCT CATEGORIES</em>
        </span>
        <span class="cat-name">ALL PRODUCT</span>
      </a>
    `);
    const brands = KF.featuredBrands || [];
    fill("brand-vault", brands.map((b) => {
      const name = typeof b === "string" ? b : b.name;
      const label = typeof b === "string" ? b : (b.label || b.name);
      return `<a class="brand-chip" href="${KF.brandPath(name)}">${label}</a>`;
    }).join(""));
    if (!$("#faq-list") || !$("#faq-list").querySelector("details")) {
      fill("faq-list", KF.faqs.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join(""));
    }
    fill("post-grid", KF.posts.map(postCard).join(""));
    const sheet = $("#home-sheet-link");
    if (sheet) sheet.href = KF.site.sheetUrl;
    const month = KF.freshMonth();
    document.querySelectorAll("[data-fresh-month]").forEach((el) => {
      el.textContent = month;
    });
    bindConverter();
  }

  function pagerHtml(page, pages, cat, q, sort, qc) {
    if (pages <= 1) return "";
    function href(n) {
      const next = new URL(location.pathname.replace(/index\.html$/i, "") || "/", location.href);
      if (q) next.searchParams.set("q", params.get("q"));
      if (sort && sort !== "latest") next.searchParams.set("sort", sort);
      if (qc === "1") next.searchParams.set("qc", "1");
      if (n > 1) next.searchParams.set("page", String(n));
      return next.pathname + next.search;
    }
    const nums = [];
    const from = Math.max(1, page - 2);
    const to = Math.min(pages, page + 2);
    if (page > 1) nums.push(`<a href="${href(page - 1)}">Prev</a>`);
    if (from > 1) nums.push(`<a href="${href(1)}">1</a>`);
    if (from > 2) nums.push("<span>…</span>");
    for (let n = from; n <= to; n++) {
      nums.push(n === page ? `<span class="is-on">${n}</span>` : `<a href="${href(n)}">${n}</a>`);
    }
    if (to < pages - 1) nums.push("<span>…</span>");
    if (to < pages) nums.push(`<a href="${href(pages)}">${pages}</a>`);
    if (page < pages) nums.push(`<a href="${href(page + 1)}">Next</a>`);
    return nums.join("");
  }

  function renderShop() {
    const cat = document.body.dataset.cat || params.get("cat") || "";
    const brandSlug = document.body.dataset.brand || params.get("brand") || "";
    const q = (params.get("q") || "").toLowerCase();
    const qcOnly = params.get("qc") === "1";
    const sort = params.get("sort") || "latest";
    const pageSize = 48;
    const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    let list = KF.products.slice();
    if (cat) list = list.filter((p) => KF.inCategory(p, cat));
    if (brandSlug) list = list.filter((p) => KF.brandSlug(p.collection) === brandSlug);
    if (q) list = list.filter((p) => `${p.title} ${p.collection} ${KF.productCats(p).join(" ")}`.toLowerCase().includes(q));
    if (qcOnly) list = list.filter((p) => p.qc);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating" || sort === "popular") list.sort((a, b) => b.rating - a.rating);
    const brandName = brandSlug
      ? (list[0] && list[0].collection) || brandSlug
      : "";
    const title = (
      KF.categories.find((c) => c.slug === cat) ||
      KF.nav.apparel.find((c) => c.slug === cat) ||
      KF.nav.lifestyle.find((c) => c.slug === cat) ||
      {}
    ).label || brandName || (q ? `Search: ${params.get("q")}` : "Shop all");
    if (!document.querySelector(".catalog-intro h1")) {
      document.title = `${title} — Kakobuy Spreadsheet 2026`;
    }
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);
    const from = total ? start + 1 : 0;
    const to = start + slice.length;
    fill("shop-count", total ? `Showing ${from}–${to} of ${total} results` : "No products found");
    fill("product-grid", slice.map(KF.ui.productCard).join("") || "<p>No finds in this filter.</p>");
    fill("pager", pagerHtml(safePage, pages, cat, q, sort, params.get("qc")));
    function apply() {
      const next = new URL(location.pathname.replace(/index\.html$/i, "") || "/", location.href);
      const s = $("#sort").value;
      if (s !== "latest") next.searchParams.set("sort", s);
      if (q) next.searchParams.set("q", params.get("q"));
      if (qcOnly) next.searchParams.set("qc", "1");
      KF.track("filter", { filter_type: "sort", filter_value: s || "latest" });
      location.href = next.pathname + next.search;
    }
    const sortBox = $("#sort");
    if (sortBox) {
      sortBox.value = sort === "latest" ? "latest" : sort;
      sortBox.addEventListener("change", apply);
    }
  }

  function catLabel(slug) {
    return (
      KF.categories.find((c) => c.slug === slug) ||
      KF.nav.apparel.find((c) => c.slug === slug) ||
      KF.nav.lifestyle.find((c) => c.slug === slug) ||
      { label: slug }
    ).label;
  }

  function itemIdFrom(item) {
    const fromId = String(item.id || "").replace(/^p-/, "");
    if (/^\d+$/.test(fromId)) return fromId;
    const m = String(item.sourceUrl || "").match(/itemID=(\d+)/i);
    return m ? m[1] : "";
  }

  function photoExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function reviewKey(id) {
    return "kf-reviews-" + id;
  }

  function loadReviews(id) {
    try {
      return JSON.parse(localStorage.getItem(reviewKey(id)) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveReviews(id, list) {
    localStorage.setItem(reviewKey(id), JSON.stringify(list));
  }

  function bindReviews(item) {
    const listEl = $("#review-list");
    const countEl = $("#review-count");
    const form = $("#review-form");
    if (!listEl || !form) return;

    function draw() {
      const list = loadReviews(item.id);
      countEl.textContent = String(list.length);
      listEl.innerHTML = list.length
        ? list.map((r) => `
            <article class="review-card">
              <span class="review-avatar">${escapeHtml((r.name || "?").slice(0, 1).toUpperCase())}</span>
              <div>
                <strong>${escapeHtml(r.name)}</strong>
              </div>
              <time>${escapeHtml(r.date)}</time>
              <p>${escapeHtml(r.text)}</p>
            </article>
          `).join("")
        : `<p class="review-empty">No comments yet. Be the first.</p>`;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const text = String(data.get("text") || "").trim();
      if (!name || !email || !text) return;
      const list = loadReviews(item.id);
      list.unshift({
        name,
        email,
        text,
        date: new Date().toISOString().slice(0, 10),
      });
      saveReviews(item.id, list);
      form.reset();
      draw();
      KF.ui.toast("Comment posted");
    });
    draw();
  }

  function renderItem() {
    const wanted = document.body.dataset.itemId || params.get("id");
    const item = KF.products.find((p) => p.id === wanted);
    if (!item) {
      location.replace(KF.findsPath());
      return;
    }
    const related = KF.products.filter((p) => p.category === item.category);
    const idx = Math.max(0, related.findIndex((p) => p.id === item.id));
    const prev = related[(idx - 1 + related.length) % related.length];
    const next = related[(idx + 1) % related.length];
    const local = KF.asset(item.image || ((item.gallery && item.gallery[0]) || ""));
    const gallery = [local];
    let photo = 0;

    document.title = `${item.title} — Kakobuy Spreadsheet 2026`;
    $("#item-title").textContent = item.title;
    $("#item-price").textContent = KF.money(item.price);
    const trustTitle = $("#trust-title");
    const trustPrice = $("#trust-price");
    const trustUpdated = $("#trust-updated");
    if (trustTitle) trustTitle.textContent = item.title;
    if (trustPrice) trustPrice.textContent = KF.money(item.price);
    if (trustUpdated) trustUpdated.textContent = KF.site.updated;
    $("#item-rating").innerHTML = `${KF.ui.stars(item.rating)} ${item.qc ? "QC photos on this find" : "No QC flag yet"} · ${item.source}`;
    $("#item-main").src = local;
    $("#item-main").alt = item.title;
    const buyLink = $("#buy-link");
    if (buyLink) buyLink.href = KF.kakobuyUrl(item.sourceUrl);
    const sheetLink = $("#sheet-link");
    if (sheetLink) sheetLink.href = KF.site.sheetUrl;
    KF.track("view_item", {
      item_id: String(item.id),
      item_name: KF.itemName(item),
      currency: "USD",
      value: Number(item.price) || 0,
      items: KF.gaItem(item),
    });
    fill("crumbs", `
      <a href="/">Home</a><span>/</span>
      <a href="${KF.findsPath()}">Shop</a><span>/</span>
      <a href="${KF.catPath(item.category)}">${catLabel(item.category)}</a><span>/</span>
      <span>${item.title}</span>
    `);
    if (related.length > 1) {
      fill("item-switch", `
        <a href="${KF.itemPath(prev)}">‹ Previous</a>
        <a href="${KF.itemPath(next)}">Next ›</a>
      `);
    }
    fill("related-grid", related.filter((p) => p.id !== item.id).slice(0, 6).map(KF.ui.productCard).join(""));

    const stage = $("#item-stage");
    const layer = $("#zoom-layer");
    const zoomImg = $("#zoom-img");

    function resetZoom() {
      stage.classList.remove("is-zoom");
      $("#item-main").style.transformOrigin = "center";
    }

    function renderThumbs() {
      fill("thumbs", gallery.map((src, i) => `
        <button type="button" data-i="${i}" class="${i === photo ? "is-on" : ""}">
          <img src="${src}" alt="">
        </button>
      `).join(""));
      const hideArrows = gallery.length < 2;
      $("#gal-prev").classList.toggle("is-hidden", hideArrows);
      $("#gal-next").classList.toggle("is-hidden", hideArrows);
    }

    function show(i) {
      photo = (i + gallery.length) % gallery.length;
      $("#item-main").src = gallery[photo];
      resetZoom();
      document.querySelectorAll("#thumbs button").forEach((btn, n) => btn.classList.toggle("is-on", n === photo));
    }

    function openLayer() {
      zoomImg.src = gallery[photo];
      zoomImg.alt = item.title;
      layer.classList.add("show");
      layer.classList.remove("is-deep");
    }

    function closeLayer() {
      layer.classList.remove("show", "is-deep");
    }

    $("#item-main").addEventListener("error", () => {
      if ($("#item-main").getAttribute("src") !== local) {
        $("#item-main").src = local;
        resetZoom();
      }
    });
    renderThumbs();
    $("#gal-prev").addEventListener("click", () => show(photo - 1));
    $("#gal-next").addEventListener("click", () => show(photo + 1));
    $("#thumbs").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) show(Number(btn.dataset.i));
    });
    stage.addEventListener("click", () => {
      stage.classList.toggle("is-zoom");
    });
    stage.addEventListener("mousemove", (e) => {
      if (!stage.classList.contains("is-zoom")) return;
      const box = stage.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width) * 100;
      const y = ((e.clientY - box.top) / box.height) * 100;
      $("#item-main").style.transformOrigin = `${x}% ${y}%`;
    });
    $("#gal-zoom").addEventListener("click", openLayer);
    $("#zoom-close").addEventListener("click", (e) => {
      e.stopPropagation();
      closeLayer();
    });
    layer.addEventListener("click", (e) => {
      if (e.target === zoomImg) layer.classList.toggle("is-deep");
      else closeLayer();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLayer();
    });

    const id = itemIdFrom(item);
    if (id) {
      Promise.all([2, 3].map((n) => {
        const src = `/img/products/${id}-${n}.webp`;
        return photoExists(src).then((ok) => (ok ? src : ""));
      })).then((found) => {
        found.filter(Boolean).forEach((src) => gallery.push(src));
        if (found.some(Boolean)) renderThumbs();
      });
    }
    bindReviews(item);
  }

  function authorOf(post) {
    const slug = post.author || "kakospreadsheet";
    return KF.authors[slug] || { slug, name: slug };
  }

  function postCard(p) {
    const author = authorOf(p);
    return `
      <article class="card post-card">
        <a href="/guide.html?slug=${p.slug}">
          <small>${p.date}</small>
          <h3>${p.title}</h3>
          <p>${p.excerpt}</p>
        </a>
        <a class="post-by" href="/author.html?id=${author.slug}">by: ${author.name}</a>
      </article>
    `;
  }

  function renderGuides() {
    fill("post-grid", KF.posts.map(postCard).join(""));
  }

  function renderGuide() {
    const post = KF.posts.find((p) => p.slug === params.get("slug")) || KF.posts[0];
    const author = authorOf(post);
    $("#guide-title").textContent = post.title;
    $("#guide-date").textContent = post.date;
    const by = $("#guide-by");
    if (by) by.innerHTML = `<a href="/author.html?id=${author.slug}">by: ${author.name}</a>`;
    fill("guide-body", post.body.map((p) => `<p>${p}</p>`).join(""));
    document.title = `${post.title} — Kakobuy Spreadsheet 2026`;
  }

  function renderAuthor() {
    const slug = params.get("id") || "kakospreadsheet";
    const author = KF.authors[slug] || KF.authors.kakospreadsheet;
    const posts = KF.posts.filter((p) => (p.author || "kakospreadsheet") === author.slug);
    document.title = `${author.name} — Kakobuy Spreadsheet 2026`;
    $("#author-name").textContent = author.name;
    $("#author-bio").textContent = author.bio || author.byline || "";
    fill("post-grid", posts.map(postCard).join("") || "<p>No guides yet.</p>");
  }

  function knownCats() {
    return new Set([
      ...KF.categories.map((c) => c.slug),
      ...KF.nav.apparel.map((c) => c.slug),
      ...KF.nav.lifestyle.map((c) => c.slug),
    ]);
  }

  function redirectLegacy() {
    const path = location.pathname;
    const cats = knownCats();
    if (/\/item\.html$/i.test(path)) {
      const id = params.get("id");
      const item = id && KF.products.find((p) => p.id === id);
      location.replace(item ? KF.itemPath(item) : KF.findsPath());
      return true;
    }
    if (/\/shop\.html$/i.test(path)) {
      const cat = params.get("cat");
      const next = new URLSearchParams(params);
      next.delete("cat");
      const dest = cat && cats.has(cat) ? KF.catPath(cat) : KF.findsPath();
      const qs = next.toString();
      location.replace(dest + (qs ? "?" + qs : ""));
      return true;
    }
    if ((path === "/finds/" || path === "/finds") && params.get("cat")) {
      const cat = params.get("cat");
      if (!cats.has(cat)) return false;
      const next = new URLSearchParams(params);
      next.delete("cat");
      const qs = next.toString();
      location.replace(KF.catPath(cat) + (qs ? "?" + qs : ""));
      return true;
    }
    return false;
  }

  function renderBrands() {
    const skip = /^(find)?$/i;
    const counts = {};
    KF.products.forEach((p) => {
      const name = String(p.collection || "").trim();
      if (!name || skip.test(name)) return;
      counts[name] = (counts[name] || 0) + 1;
    });
    const rows = Object.entries(counts)
      .filter(([, n]) => n >= 5)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    fill("brand-grid", rows.map(([name, n]) => `
      <a class="cat-card" href="${KF.brandPath(name)}">
        <span class="cat-name">${name}</span>
        <small>${n} finds</small>
      </a>
    `).join(""));
  }

  if (redirectLegacy()) return;
  const page = document.body.dataset.page;
  KF.ui.bindChrome();
  if (page === "home") renderHome();
  if (page === "shop") renderShop();
  if (page === "item") renderItem();
  if (page === "guides") renderGuides();
  if (page === "guide") renderGuide();
  if (page === "author") renderAuthor();
  if (page === "brands") renderBrands();
})();
