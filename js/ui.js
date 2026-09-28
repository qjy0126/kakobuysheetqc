(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const savedKey = "kf-saved";
  const getSaved = () => JSON.parse(localStorage.getItem(savedKey) || "[]");
  const setSaved = (ids) => localStorage.setItem(savedKey, JSON.stringify(ids));

  function dropList(items) {
    return items.map((c) => `<a href="${KF.catPath(c.slug)}">${c.label}</a>`).join("");
  }

  function header() {
    return `
      <header class="site-header">
        <div class="wrap header-row">
          <button class="menu-btn" data-open="nav" aria-label="Menu">☰</button>
          <a class="brand" href="/">
            <span class="brand-mark">
              <img src="${KF.asset("img/logo-k.png")}" alt="Kakobuy Spreadsheet" />
            </span>
            <span class="brand-copy">
              <strong>kakobuy <span>spreadsheet</span></strong>
              <small>www.kakobuysheetqc.com</small>
            </span>
          </a>
          <nav class="nav">
            <a href="/" data-nav="home">Home</a>
            <a href="${KF.findsPath()}" data-nav="shop">Shop All</a>
            <div class="drop" data-nav="apparel">
              <button class="linkish" type="button" aria-haspopup="true">Apparel</button>
              <div class="drop-panel">${dropList(KF.nav.apparel)}</div>
            </div>
            <div class="drop" data-nav="lifestyle">
              <button class="linkish" type="button" aria-haspopup="true">Lifestyle</button>
              <div class="drop-panel">${dropList(KF.nav.lifestyle)}</div>
            </div>
            <a href="/guides.html" data-nav="guides">Guides</a>
          </nav>
          <div class="header-tools">
            <button class="icon-btn search-btn" data-open="search" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div class="overlay" id="overlay"></div>
      <aside class="mobile-nav" id="mobile-nav">
        <a href="/" data-nav="home">Home</a>
        <a href="${KF.findsPath()}" data-nav="shop">Shop All</a>
        ${[...KF.nav.apparel, ...KF.nav.lifestyle].map((c) => `<a href="${KF.catPath(c.slug)}">${c.label}</a>`).join("")}
        <a href="/guides.html" data-nav="guides">Guides</a>
      </aside>
      <div class="search-modal" id="search-modal" role="dialog" aria-label="Search">
        <div class="search-shell">
          <div class="search-field">
            <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
            <input class="search-input" id="global-search" placeholder="Search finds, categories, QC…" autocomplete="off" />
            <button type="button" class="search-esc" id="search-esc" aria-label="Close search">Esc</button>
          </div>
          <div class="search-hits" id="search-hits" hidden></div>
          <div class="search-discover" id="search-discover">
            <div class="search-block">
              <p class="search-label">Popular</p>
              <div class="search-popular">
                <a href="/finds/?q=Jordan%204">Jordan 4</a>
                <a href="/brands/moncler/">Moncler</a>
                <a href="/brands/stone-island/">Stone Island</a>
                <a href="/brands/chrome-hearts/">Chrome Hearts</a>
                <a href="/brands/corteiz/">Corteiz</a>
                <a href="/brands/ralph-lauren/">Ralph Lauren</a>
                <a href="/finds/?q=Nike%20Tech">Nike Tech</a>
                <a href="/brands/trapstar/">Trapstar</a>
              </div>
            </div>
            <div class="search-block">
              <p class="search-label">Categories</p>
              <div class="search-cats">
                <a href="/shoes/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 14.5h11l2.2-3.2A3 3 0 0 1 18.7 10H21v2.5l-1.2 4.2A2 2 0 0 1 17.9 18H5.2A2.2 2.2 0 0 1 3 15.8v-1.3z"/><path d="M3 14.5h8"/></svg>Shoes</a>
                <a href="/t-shirts/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 6l2-2h4l2 2 4 2v3l-3-1v9H7v-9l-3 1V8l4-2z"/></svg>T-shirts</a>
                <a href="/hoodies/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 7a3 3 0 0 1 6 0"/><path d="M7 9l-3 2v9h5v-5h6v5h5v-9l-3-2"/><path d="M9 9v3h6V9"/></svg>Hoodies</a>
                <a href="/jackets/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 6l4 2 4-2 3 3v11H5V9l3-3z"/><path d="M12 8v12"/><path d="M9 12h6"/></svg>Jackets</a>
                <a href="/pants/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 4h8l1 16h-4l-1-8-1 8H7L8 4z"/></svg>Pants</a>
                <a href="/accessories/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 9h10l1 11H6L7 9z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></svg>Bags</a>
                <a href="/watches/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 9v3.5l2 1.2"/><path d="M9 4h6M9 20h6"/></svg>Watches</a>
                <a href="/accessories/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l1.8 4.6L19 9l-3.8 3.1L16.5 17 12 14.6 7.5 17l1.3-4.9L5 9l5.2-1.4L12 3z"/></svg>Accessories</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="toast" id="toast"></div>
    `;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <a class="footer-brand" href="/">Kakobuy Spreadsheet</a>
              <p>Independent Kakobuy Spreadsheet with QC photos and listing links. We do not process orders or payments. Not officially affiliated with Kakobuy.</p>
            </div>
            <div class="footer-col">
              <h3>Products</h3>
              <a href="${KF.catPath("shoes")}">Kakobuy Shoes</a>
              <a href="${KF.catPath("hoodies")}">Kakobuy Hoodies</a>
              <a href="${KF.catPath("t-shirts")}">Kakobuy Tees</a>
              <a href="${KF.catPath("jackets")}">Kakobuy Jackets</a>
              <a href="${KF.findsPath()}">Shop all</a>
              <a href="/brands/">Brands</a>
            </div>
            <div class="footer-col">
              <h3>Guides</h3>
              <a href="/guides.html">How to shop this catalog</a>
              <a href="/guide.html?slug=read-qc">QC photos</a>
              <a href="/guide.html?slug=first-order">First Kakobuy order</a>
              <a href="/guides.html">All guides</a>
            </div>
            <div class="footer-col">
              <h3>Quick Links</h3>
              <a href="/privacy.html">Privacy Policy</a>
              <a href="/terms.html">Terms &amp; Disclaimer</a>
              <a href="/about.html">About</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function stars(rating) {
    const n = Math.max(0, Math.min(5, Number(rating) || 0));
    let full = Math.floor(n + 1e-9);
    const frac = n - full;
    let half = false;
    if (frac >= 0.75 && full < 5) full += 1;
    else if (frac >= 0.25 && full < 5) half = true;
    const empty = 5 - full - (half ? 1 : 0);
    const glyphs = `${"★".repeat(full)}${half ? '<span class="star-half">★</span>' : ""}${"☆".repeat(empty)}`;
    return `<span class="stars" aria-label="${n.toFixed(1)} out of 5">${glyphs}</span>`;
  }

  function productCard(p) {
    return `
      <a class="product-card" href="${KF.itemPath(p)}" data-id="${p.id}">
        <div class="thumb"><img src="${KF.asset(p.image)}" alt="${p.title}" loading="lazy" decoding="async" /></div>
        <h3>${p.title}</h3>
        ${stars(p.rating)}
        <b>${KF.money(p.price)}</b>
      </a>
    `;
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1600);
  }

  function renderSaved() {
    const ids = getSaved();
    const count = $("#saved-count");
    if (count) count.textContent = ids.length;
    const list = $("#saved-list");
    if (!list) return;
    const items = KF.products.filter((p) => ids.includes(p.id));
    list.innerHTML = items.length
      ? items.map((p) => `<p><a href="${KF.itemPath(p)}">${p.title}</a> · ${KF.money(p.price)}</p>`).join("")
      : "<p>No saved finds yet.</p>";
  }

  function closeAll() {
    $("#overlay").classList.remove("show");
    $("#mobile-nav").classList.remove("show");
    $("#search-modal").classList.remove("show");
  }

  function openPanel(name) {
    closeAll();
    $("#overlay").classList.add("show");
    if (name === "nav") $("#mobile-nav").classList.add("show");
    if (name === "search") {
      const modal = $("#search-modal");
      const input = $("#global-search");
      modal.classList.add("show");
      if (input) {
        input.value = "";
        input.focus();
      }
      const hits = $("#search-hits");
      const discover = $("#search-discover");
      if (hits) {
        hits.innerHTML = "";
        hits.hidden = true;
      }
      if (discover) discover.hidden = false;
    }
  }

  function currentNav() {
    const page = document.body.dataset.page || "";
    const cat = document.body.dataset.cat || new URLSearchParams(location.search).get("cat") || "";
    const apparel = new Set(KF.nav.apparel.map((c) => c.slug));
    const lifestyle = new Set(KF.nav.lifestyle.map((c) => c.slug));
    if (page === "home") return "home";
    if (page === "guides" || page === "guide" || page === "author") return "guides";
    if ((page === "shop" || page === "item") && apparel.has(cat)) return "apparel";
    if ((page === "shop" || page === "item") && lifestyle.has(cat)) return "lifestyle";
    if (page === "shop" || page === "item" || page === "brands") return "shop";
    return "";
  }

  function markCurrentNav() {
    const key = currentNav();
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.nav === key);
    });
  }

  function ensurePwaHead() {
    const head = document.head;
    if (!head.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.webmanifest";
      head.appendChild(link);
    }
    if (!head.querySelector('link[rel="apple-touch-icon"]')) {
      const apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      apple.href = "/img/apple-touch-icon.png";
      head.appendChild(apple);
    }
    if (!head.querySelector('meta[name="theme-color"]')) {
      const theme = document.createElement("meta");
      theme.name = "theme-color";
      theme.content = "#fb2840";
      head.appendChild(theme);
    }
    if (!head.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const capable = document.createElement("meta");
      capable.name = "apple-mobile-web-app-capable";
      capable.content = "yes";
      head.appendChild(capable);
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  }

  function showPwaTip(message) {
    let tip = document.getElementById("pwa-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "pwa-tip";
      tip.className = "pwa-tip";
      tip.innerHTML = `<button type="button" class="pwa-tip-close" aria-label="Close">×</button><p></p>`;
      document.body.appendChild(tip);
      tip.querySelector(".pwa-tip-close").addEventListener("click", () => tip.classList.remove("is-on"));
    }
    tip.querySelector("p").innerHTML = message;
    tip.classList.add("is-on");
    clearTimeout(showPwaTip._t);
    showPwaTip._t = setTimeout(() => tip.classList.remove("is-on"), 8000);
  }

  function bindPwaInstall() {
    const btn = document.getElementById("pwa-install-btn");
    if (!btn) return;

    if (isStandalone()) {
      btn.classList.add("is-hidden");
      return;
    }

    let deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      btn.classList.remove("is-hidden");
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      btn.classList.add("is-hidden");
      toast("Added to Home Screen");
      KF.track("pwa_install", {
        method: "accepted",
        page_path: location.pathname,
      });
    });

    btn.addEventListener("click", async () => {
      KF.track("pwa_install_click", {
        page_path: location.pathname,
        has_prompt: Boolean(deferredPrompt),
        platform: isIos() ? "ios" : "other",
      });
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice.catch(() => null);
        deferredPrompt = null;
        if (choice && choice.outcome === "accepted") {
          btn.classList.add("is-hidden");
          KF.track("pwa_install", {
            method: "prompt",
            page_path: location.pathname,
          });
        } else {
          KF.track("pwa_install_dismiss", {
            page_path: location.pathname,
            outcome: choice ? choice.outcome : "unknown",
          });
        }
        return;
      }
      if (isIos()) {
        showPwaTip('On iPhone/iPad: tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong>.');
        KF.track("pwa_install_guide", { platform: "ios", page_path: location.pathname });
        return;
      }
      showPwaTip('Use your browser menu → <strong>Install app</strong> / <strong>Add to Home Screen</strong>.');
      KF.track("pwa_install_guide", { platform: "other", page_path: location.pathname });
    });
  }

  function bindChrome() {
    ensurePwaHead();
    registerServiceWorker();
    const promo = document.querySelector(".promo-bar");
    if (promo) {
      promo.insertAdjacentHTML("afterend", header());
    } else {
      document.body.insertAdjacentHTML("afterbegin", header());
    }
    document.body.insertAdjacentHTML("beforeend", footer());
    document.body.insertAdjacentHTML("beforeend", `
      <a class="discord-float" href="https://discord.gg/7DRMaMAADv" target="_blank" rel="noopener" aria-label="Discord">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14 14 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.9.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.899.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418"/>
        </svg>
      </a>
    `);
    bindPwaInstall();
    renderSaved();
    markCurrentNav();
    document.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openPanel(btn.dataset.open));
    });
    $("#overlay").addEventListener("click", closeAll);
    const searchEsc = $("#search-esc");
    if (searchEsc) searchEsc.addEventListener("click", closeAll);
    const searchInput = $("#global-search");
    const hitsBox = $("#search-hits");
    const discoverBox = $("#search-discover");
    let suggestIndex = null;
    let activeHit = -1;

    function ensureIndex() {
      if (suggestIndex) return suggestIndex;
      const map = new Map();
      function add(raw) {
        const text = String(raw || "").replace(/\s+/g, " ").trim();
        if (text.length < 2 || text.length > 40) return;
        if (/^\d+$/.test(text)) return;
        const key = text.toLowerCase();
        const cur = map.get(key);
        if (cur) cur.n += 1;
        else map.set(key, { text, n: 1 });
      }
      const catLabel = {};
      [...KF.nav.apparel, ...KF.nav.lifestyle].forEach((c) => { catLabel[c.slug] = c.label; });
      KF.products.forEach((p) => {
        add(p.collection);
        const label = catLabel[p.category] || p.category;
        add(label);
        if (p.collection && label) add(`${p.collection} ${label}`);
        const words = String(p.title || "").split(/[^a-zA-Z0-9+]+/).filter((w) => w.length > 1);
        for (let i = 0; i < words.length; i++) {
          add(words[i]);
          if (words[i + 1]) add(`${words[i]} ${words[i + 1]}`);
          if (words[i + 1] && words[i + 2]) add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
      });
      suggestIndex = [...map.values()];
      return suggestIndex;
    }

    function markQuery(text, q) {
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
      const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
      return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
    }

    function suggestionsFor(q) {
      const ql = q.toLowerCase();
      if (!ql) return [];
      return ensureIndex()
        .filter((item) => item.text.toLowerCase().includes(ql))
        .map((item) => {
          const key = item.text.toLowerCase();
          return { text: item.text, n: item.n, starts: key.startsWith(ql), key };
        })
        .filter((item) => item.key !== ql)
        .sort((a, b) => {
          if (a.starts !== b.starts) return a.starts ? -1 : 1;
          if (b.n !== a.n) return b.n - a.n;
          return a.text.length - b.text.length;
        })
        .slice(0, 10);
    }

    function renderHits(q) {
      activeHit = -1;
      if (!q) {
        hitsBox.innerHTML = "";
        hitsBox.hidden = true;
        if (discoverBox) discoverBox.hidden = false;
        return;
      }
      if (discoverBox) discoverBox.hidden = true;
      hitsBox.hidden = false;
      const items = suggestionsFor(q);
      hitsBox.innerHTML = items.length
        ? items.map((item) => `
            <a class="search-suggest" href="/finds/?q=${encodeURIComponent(item.text)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
              </svg>
              <span>${markQuery(item.text, q)}</span>
            </a>
          `).join("")
        : `<p>No matches.</p>`;
    }

    function goSearch(value) {
      const q = (value != null ? value : searchInput.value).trim();
      if (!q) return;
      KF.track("search", { search_term: q });
      location.href = "/finds/?q=" + encodeURIComponent(q);
    }

    searchInput.addEventListener("input", () => {
      renderHits(searchInput.value.trim());
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAll();
        return;
      }
      const links = [...hitsBox.querySelectorAll(".search-suggest")];
      if (e.key === "ArrowDown" && links.length) {
        e.preventDefault();
        activeHit = (activeHit + 1) % links.length;
        links.forEach((el, i) => el.classList.toggle("is-on", i === activeHit));
        return;
      }
      if (e.key === "ArrowUp" && links.length) {
        e.preventDefault();
        activeHit = (activeHit - 1 + links.length) % links.length;
        links.forEach((el, i) => el.classList.toggle("is-on", i === activeHit));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (activeHit >= 0 && links[activeHit]) {
          const term = links[activeHit].textContent.replace(/\s+/g, " ").trim();
          KF.track("search", { search_term: term });
          location.href = links[activeHit].href;
          return;
        }
        goSearch();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("#search-modal")?.classList.contains("show")) closeAll();
    });

    document.addEventListener("click", (e) => {
      const popular = e.target.closest(".search-popular a, .search-cats a");
      if (popular) {
        const term = popular.textContent.replace(/\s+/g, " ").trim();
        if (term) KF.track("search", { search_term: term });
      }
      const suggest = e.target.closest("a.search-suggest");
      if (suggest) {
        const term = suggest.textContent.replace(/\s+/g, " ").trim();
        if (term) KF.track("search", { search_term: term });
        return;
      }
      const kakobuy = e.target.closest("a[href*='kakobuy.com']");
      if (kakobuy) {
        const href = kakobuy.href || "";
        if (/\/register/i.test(href)) {
          KF.track("signup_kakobuy", { link_url: href, page_path: location.pathname });
        } else {
          const id = document.body.dataset.itemId || kakobuy.dataset.buy || "";
          const item = id
            ? (KF.products || []).find((p) => String(p.id) === String(id))
            : null;
          if (item) {
            KF.track("buy_kakobuy", {
              agent: "kakobuy",
              item_id: String(item.id),
              item_name: KF.itemName(item),
              currency: "USD",
              value: Number(item.price) || 0,
              items: KF.gaItem(item),
              link_url: href,
              page_path: location.pathname,
            });
          } else {
            KF.track("buy_kakobuy", {
              agent: "kakobuy",
              link_url: href,
              page_path: location.pathname,
            });
          }
        }
      }
      const out = e.target.closest("a[href]");
      if (out) {
        let url;
        try { url = new URL(out.href, location.href); } catch (_) { url = null; }
        if (url && url.origin !== location.origin && (url.protocol === "http:" || url.protocol === "https:")) {
          const params = {
            event_category: "outbound",
            event_label: (out.textContent || out.getAttribute("aria-label") || "link").trim().slice(0, 80),
            link_url: out.href,
            link_domain: url.hostname,
            outbound: true,
            page_path: location.pathname,
          };
          const id = document.body.dataset.itemId || out.dataset.buy || "";
          const item = id ? (KF.products || []).find((p) => String(p.id) === String(id)) : null;
          if (item) {
            params.item_id = String(item.id);
            params.item_name = KF.itemName(item);
            params.currency = "USD";
            params.value = Number(item.price) || 0;
            params.items = KF.gaItem(item);
          }
          KF.track("click", params);
          KF.track("outbound_click", params);
        }
      }
      if (kakobuy) return;
      const card = e.target.closest("a.product-card");
      if (card) {
        const id = card.getAttribute("data-id") || "";
        const item = (KF.products || []).find((p) => String(p.id) === String(id));
        if (item) {
          KF.track("select_item", {
            item_id: String(item.id),
            item_name: KF.itemName(item),
            item_list_name: document.body.dataset.page || "",
            items: KF.gaItem(item),
          });
        }
        return;
      }
      const shopLink = e.target.closest("a[href]");
      if (!shopLink) return;
      let dest;
      try {
        dest = new URL(shopLink.getAttribute("href"), location.href);
      } catch (_) {
        return;
      }
      const q = dest.searchParams.get("q") || "";
      const sort = dest.searchParams.get("sort") || "";
      const qc = dest.searchParams.get("qc") || "";
      const catMatch = dest.pathname.match(/^\/([a-z0-9-]+)\/?$/i);
      const known = new Set([...KF.nav.apparel, ...KF.nav.lifestyle].map((c) => c.slug));
      const cat = dest.searchParams.get("cat") || (catMatch && known.has(catMatch[1]) ? catMatch[1] : "");
      if (!q && !cat && !sort && qc !== "1") return;
      if (q) {
        KF.track("search", { search_term: q });
        return;
      }
      if (cat) KF.track("filter", { filter_type: "category", filter_value: cat });
      if (sort && sort !== "latest") KF.track("filter", { filter_type: "sort", filter_value: sort });
      if (qc === "1") KF.track("filter", { filter_type: "qc", filter_value: "1" });
    });
  }

  KF.ui = { productCard, toast, bindChrome, getSaved, setSaved, renderSaved, stars };
})();
