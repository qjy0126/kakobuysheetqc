/**
 * Product images + sitemaps are served from CDN so Cloudflare Assets
 * can skip the large img/products tree and avoid XML 500s on ASSETS.
 */
const REPO_CDN = "https://cdn.jsdelivr.net/gh/qjy0126/kakobuysheetqc@main";

function isSitemapPath(pathname) {
  return (
    pathname === "/sitemap.xml" ||
    pathname === "/sitemap-index.xml" ||
    pathname === "/sitemap-pages.xml" ||
    (pathname.startsWith("/sitemaps/") && pathname.endsWith(".xml"))
  );
}

async function proxyCdn(pathname, contentType, ttl) {
  const res = await fetch(REPO_CDN + pathname, {
    cf: { cacheEverything: true, cacheTtl: ttl },
  });
  if (!res.ok) {
    return new Response("Not found", { status: res.status === 404 ? 404 : 502 });
  }
  const headers = new Headers(res.headers);
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", `public, max-age=${ttl}`);
  return new Response(res.body, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/img/products/")) {
      return proxyCdn(url.pathname, "image/webp", 604800);
    }

    if (isSitemapPath(url.pathname)) {
      return proxyCdn(url.pathname, "application/xml; charset=utf-8", 3600);
    }

    return env.ASSETS.fetch(request);
  },
};
