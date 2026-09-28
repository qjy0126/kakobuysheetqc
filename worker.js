/**
 * Product images + sitemaps served from CDN via Worker
 * (Assets must not serve the XML files directly).
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
  try {
    const res = await fetch(REPO_CDN + pathname);
    if (!res.ok) {
      return new Response(`Upstream ${res.status}`, {
        status: res.status === 404 ? 404 : 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return new Response(await res.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${ttl}`,
      },
    });
  } catch (err) {
    return new Response(`Proxy error: ${err && err.message ? err.message : String(err)}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
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
