/**
 * Proxy product images from GitHub CDN so Cloudflare deploy can skip
 * the ~430MB img/products folder (.assetsignore).
 * Also serve sitemap XML from GitHub when Workers Assets returns 500 for .xml.
 */
const GITHUB_RAW = "https://raw.githubusercontent.com/qjy0126/kakobuysheetqc/main";
const PRODUCT_CDN = "https://cdn.jsdelivr.net/gh/qjy0126/kakobuysheetqc@main";

function isSitemapPath(pathname) {
  return (
    pathname === "/sitemap.xml" ||
    pathname === "/sitemap-index.xml" ||
    pathname === "/sitemap-pages.xml" ||
    pathname.startsWith("/sitemaps/")
  );
}

async function serveFromGithub(pathname, contentType) {
  const res = await fetch(GITHUB_RAW + pathname, {
    cf: { cacheEverything: true, cacheTtl: 3600 },
  });
  if (!res.ok) return new Response("Not found", { status: 404 });
  return new Response(await res.text(), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/img/products/")) {
      const upstream = PRODUCT_CDN + url.pathname;
      const res = await fetch(upstream, {
        cf: { cacheEverything: true, cacheTtl: 604800 },
      });
      if (!res.ok) {
        return new Response("Not found", { status: res.status === 404 ? 404 : 502 });
      }
      const headers = new Headers(res.headers);
      headers.set("Cache-Control", "public, max-age=604800, immutable");
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(res.body, { status: 200, headers });
    }

    if (isSitemapPath(url.pathname)) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.ok) {
          const headers = new Headers(assetRes.headers);
          headers.set("Content-Type", "application/xml; charset=utf-8");
          headers.set("Cache-Control", "public, max-age=3600");
          return new Response(assetRes.body, { status: 200, headers });
        }
      } catch (_) {}
      return serveFromGithub(url.pathname, "application/xml; charset=utf-8");
    }

    return env.ASSETS.fetch(request);
  },
};
