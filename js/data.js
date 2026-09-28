window.KF = window.KF || {};
if (!document.querySelector('script[src*="js/analytics.js"]')) {
  const analytics = document.createElement("script");
  analytics.src = "/js/analytics.js";
  document.head.appendChild(analytics);
}

KF.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
KF.freshMonth = (d = new Date()) => `${KF.monthNames[d.getMonth()]} ${d.getFullYear()}`;
KF.freshDate = (d = new Date()) => `${KF.monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

KF.site = {
  name: "Kakobuy Spreadsheet 2026",
  domain: "kakobuysheetqc.com",
  origin: "https://kakobuysheetqc.com",
  updated: KF.freshDate(),
  sheetUrl: "https://docs.google.com/spreadsheets/d/1ouCVXknU6RYgA1bhcB0g3cPV3yr0a210C4q7IWd1DOc/edit?gid=1593055287#gid=1593055287",
};

KF.featuredBrands = [
  { name: "Nike", label: "Nike" },
  { name: "LV", label: "Louis Vuitton" },
  { name: "Ralph Lauren", label: "Ralph Lauren" },
  { name: "Stone Island", label: "Stone Island" },
  { name: "Moncler", label: "Moncler" },
  { name: "Jordan", label: "Jordan" },
  { name: "Burberry", label: "Burberry" },
  { name: "Dior", label: "Dior" },
  { name: "Gucci", label: "Gucci" },
  { name: "Palm Angels", label: "Palm Angels" },
  { name: "Bape", label: "Bape" },
  { name: "Corteiz", label: "Corteiz" },
  { name: "Trapstar", label: "Trapstar" },
  { name: "Ami", label: "Ami" },
  { name: "Supreme", label: "Supreme" },
  { name: "Off White", label: "Off-White" },
  { name: "Stussy", label: "Stussy" },
  { name: "Canada Goose", label: "Canada Goose" },
  { name: "Chrome Hearts", label: "Chrome Hearts" },
  { name: "Denim Tears", label: "Denim Tears" },
  { name: "Gallery Dept", label: "Gallery Dept" },
];

KF.asset = (path) => {
  const s = String(path || "");
  if (!s || /^https?:\/\//i.test(s) || s.startsWith("/")) return s;
  return "/" + s.replace(/^\.\//, "");
};

KF.slugify = (text) => String(text || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .replace(/-+/g, "-")
  .slice(0, 60);

KF.itemSlug = (p) => {
  const id = String((p && p.id) || "").replace(/^p-/, "");
  const base = KF.slugify(p && p.title);
  return (base ? base + "-" : "") + id;
};

KF.itemPath = (p) => "/item/" + KF.itemSlug(p) + "/";
KF.catPath = (slug) => (slug ? "/" + slug + "/" : "/finds/");
KF.brandSlug = (name) => KF.slugify(name);
KF.brandPath = (name) => "/brands/" + KF.brandSlug(name) + "/";
KF.findsPath = () => "/finds/";

KF.nav = {
  apparel: [
    { slug: "shoes", label: "Shoes" },
    { slug: "t-shirts", label: "T-Shirts" },
    { slug: "hoodies", label: "Hoodies / Sweaters" },
    { slug: "jackets", label: "Jackets" },
    { slug: "pants", label: "Pants/Shorts" },
    { slug: "sets", label: "Sets" },
    { slug: "jersey", label: "Jersey" },
    { slug: "underwear", label: "Underpants" },
  ],
  lifestyle: [
    { slug: "headwear", label: "Headwear" },
    { slug: "glasses", label: "Glasses" },
    { slug: "watches", label: "Watches" },
    { slug: "perfume", label: "Perfume" },
    { slug: "accessories", label: "Accessories" },
    { slug: "bricks", label: "Building Blocks" },
    { slug: "other", label: "Other Stuff" },
  ],
};

KF.categories = [
  { slug: "shoes", label: "Shoes", image: "img/products/7772839504.webp" },
  { slug: "t-shirts", label: "T-Shirts", image: "img/products/7702021889.webp" },
  { slug: "hoodies", label: "Hoodies", image: "img/products/7769863123.webp" },
  { slug: "jackets", label: "Jackets", image: "img/products/7729666704.webp" },
  { slug: "pants", label: "Pants/Shorts", image: "img/products/7784573587.webp" },
  { slug: "headwear", label: "Headwear", image: "img/products/7769936739.webp" },
  { slug: "sets", label: "Sets", image: "img/products/7655861328.webp" },
  { slug: "underwear", label: "Underpants", image: "img/products/7725947143.webp" },
  { slug: "jersey", label: "Jersey", image: "img/products/7725949191.webp" },
  { slug: "accessories", label: "Accessories", image: "img/products/7772899302.webp" },
  { slug: "other", label: "Other Stuff", image: "img/products/7772934670.webp" },
];
KF.allProductImage = "img/products/7769821047.webp";
KF.categoryCovers = Object.fromEntries(KF.categories.map((c) => [c.slug, c.image]));
KF.allProductCover = KF.allProductImage;

KF.collections = ["Court", "Fleece", "Denim", "Outdoor", "Matchday", "Desk", "Travel", "Workwear", "Eyewear", "Timepiece"];

KF.products = [];

KF.authors = {
  kakospreadsheet: {
    slug: "kakospreadsheet",
    name: "kakospreadsheet",
    byline: "Editor of Kakobuy Spreadsheet on kakobuysheetqc.com",
    bio: "Short notes on browsing this catalog instead of a frozen sheet — QC photos, filters, and how to open a find on Kakobuy.",
  },
};

KF.posts = [
  { slug: "catalog-not-cells", author: "kakospreadsheet", title: "A catalog beats a 15k-row sheet on your phone", date: "2026-09-08", excerpt: "Spreadsheets stall. Cards with photos, QC flags, and live links do not.", body: ["Google Sheets is fine as a dump. It is a weak storefront, especially on mobile.", "KakoBuy Spreadsheet on kakobuysheetqc.com keeps the same kind of row — title, price, source, QC — as something you can actually browse.", "Keep a sheet as backup if you want. Shop here."] },
  { slug: "read-qc", author: "kakospreadsheet", title: "How to read warehouse QC before you ship", date: "2026-09-08", excerpt: "QC is a chance to catch glue and sizing issues while the item is still in the warehouse.", body: ["Ask for logos, stitching, and size tags. Wide shots hide the defects that cause returns.", "Compare warehouse photos to the seller listing, not to a campaign image.", "Message the agent before the parcel is sealed."] },
  { slug: "first-order", author: "kakospreadsheet", title: "First Kakobuy order: paste, pay, QC, ship", date: "2026-09-03", excerpt: "This site is a directory. Checkout always happens on Kakobuy.", body: ["Open a find on this catalog, then continue on Kakobuy.", "Pay the agent. The seller ships to the warehouse, not your door.", "Review QC, then submit a parcel. Quotes depend on weight and line."] },
  { slug: "filters", author: "kakospreadsheet", title: "Filters that actually surface better finds", date: "2026-09-03", excerpt: "Category, then QC, then price. Messy titles waste brand searches.", body: ["QC-tagged rows are easier to inspect later, not automatically better.", "Sort by latest when you want live links.", "Re-open the source URL before you order — prices move."] },
];

KF.faqs = [
  { q: "What is the Kakobuy Spreadsheet website?", a: "An independent shopping directory that turns spreadsheet links into a faster visual catalog with product previews and QC photos, then sends you to Kakobuy for checkout." },
  { q: "What is the relationship between this site and Kakobuy?", a: "This site is a discovery index. Kakobuy handles purchasing, warehouse storage, QC, consolidation, and international shipping." },
  { q: "Are QC photos available?", a: "Many listings include QC reference photos so you can compare materials, stitching, logos, and sizing before you order." },
  { q: "How much is international shipping?", a: "Shipping depends on weight, volume, destination, and line. Use Kakobuy’s estimator after items reach the warehouse." },
  { q: "How long does delivery take?", a: "Most parcels arrive within 7–20 days after dispatch. Customs and holidays can stretch that." },
  { q: "What if I am unhappy with a product?", a: "Contact Kakobuy support with the order ID and QC photos, ideally while the item is still in the warehouse." },
];

KF.productCats = (p) => {
  const cats = [p.category].concat(p.categories || []).filter(Boolean);
  const seen = {};
  return cats.filter((c) => (seen[c] ? false : (seen[c] = true)));
};
KF.inCategory = (p, slug) => KF.productCats(p).includes(slug);
KF.applyExtraCategories = () => {
  const skip = /sock|suitcase|luggage/i;
  const extraSet = /tracksuit|track\s*suit|sportsuit|\bsuit\b/i;
  KF.products.forEach((p) => {
    const title = String(p.title || "");
    if (p.category === "sets" || skip.test(title) || !extraSet.test(title)) return;
    const extra = p.categories || [];
    if (!extra.includes("sets")) extra.push("sets");
    p.categories = extra;
  });
};

KF.money = (n) => `$${n.toFixed(2)}`;
KF.invite = {
  kakobuy: "9v88f",
  oopbuy: "R28A1X6T7",
  mulebuy: "201207480",
  acbuy: "XQFW6M",
  hipobuy: "Y0WGBFNCB",
};
KF.listing = (sourceUrl) => {
  const url = String(sourceUrl || "");
  const weidian = url.match(/itemID=(\d+)/i);
  if (weidian || /weidian\.com/i.test(url)) {
    const id = weidian ? weidian[1] : "";
    const raw = id ? `https://weidian.com/item.html?itemID=${id}` : url;
    return { id, channel: "weidian", platform: "WEIDIAN", source: "WD", path: "weidian", url: raw };
  }
  const tb = url.match(/[?&]id=(\d+)/i);
  if (/taobao\.com|tmall\.com/i.test(url)) {
    return { id: tb ? tb[1] : "", channel: "taobao", platform: "TAOBAO", source: "TB", path: "taobao", url };
  }
  const ali = url.match(/offer\/(\d+)/i);
  if (/1688\.com/i.test(url)) {
    return { id: ali ? ali[1] : "", channel: "1688", platform: "1688", source: "AL", path: "1688", url };
  }
  return { id: "", channel: "weidian", platform: "WEIDIAN", source: "WD", path: "weidian", url };
};
KF.agentUrl = (agentId, sourceUrl) => {
  const L = KF.listing(sourceUrl);
  const enc = encodeURIComponent(L.url);
  if (agentId === "kakobuy") {
    if (L.channel === "weidian" && L.id) {
      return `https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D${L.id}&affcode=${KF.invite.kakobuy}`;
    }
    return `https://www.kakobuy.com/item/details?url=${enc}&affcode=${KF.invite.kakobuy}`;
  }
  if (agentId === "oopbuy") {
    return `https://oopbuy.com/goods/details?channel=${L.channel}&id=${L.id}&inviteCode=${KF.invite.oopbuy}`;
  }
  if (agentId === "mulebuy") {
    return `https://mulebuy.com/product?id=${L.id}&platform=${L.platform}&ref=${KF.invite.mulebuy}`;
  }
  if (agentId === "acbuy") {
    return `https://www.acbuy.com/product?url=${encodeURIComponent(enc)}&id=${L.id}&source=${L.source}&code=${KF.invite.acbuy}`;
  }
  if (agentId === "hipobuy") {
    return `https://hipobuy.com/product/${L.path}/${L.id}?source=SEARCH_LIST&keyword=${enc}&inviteCode=${KF.invite.hipobuy}`;
  }
  return L.url;
};
KF.agents = [
  { id: "kakobuy", name: "Kakobuy", logo: "img/buy/kakobuy.png" },
  { id: "oopbuy", name: "oopBuy", logo: "img/buy/oopbuy.png" },
  { id: "mulebuy", name: "MuleBuy", logo: "img/buy/mulebuy.png" },
  { id: "acbuy", name: "Acbuy", logo: "img/buy/acbuy.png" },
  { id: "hipobuy", name: "HipoBuy", logo: "img/buy/hipobuy.png" },
];
KF.kakobuyUrl = (sourceUrl) => KF.agentUrl("kakobuy", sourceUrl);

KF.itemName = (p) => String((p && p.title) || "").replace(/\s+/g, " ").trim().slice(0, 100);

KF.gaItem = (p) => {
  if (!p) return [];
  return [{
    item_id: String(p.id),
    item_name: KF.itemName(p),
    item_category: p.category || "",
    price: Number(p.price) || 0,
    quantity: 1,
  }];
};

KF.track = (name, params) => {
  try {
    if (typeof gtag !== "function") return;
    gtag("event", name, Object.assign({ transport_type: "beacon" }, params || {}));
  } catch (_) {}
};
KF.extractUrl = (text) => {
  const m = String(text).match(/https?:\/\/[^\s"'<>]+/i);
  return m ? m[0].replace(/[.,;]+$/, "") : "";
};
KF.supported = (url) =>
  /taobao\.com|tmall\.com|weidian\.com|1688\.com/i.test(url);
