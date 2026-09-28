/**
 * Product images + sitemaps via CDN.
 * Cloudflare returns HTTP 500 for any path ending in ".xml" on this
 * Workers+Assets setup, so public sitemap URLs are extensionless.
 */
const REPO_CDN = "https://cdn.jsdelivr.net/gh/qjy0126/kakobuysheetqc@main";
const WORKER_VER = "2026-09-28-sitemap-v5";

/** Map public path -> CDN path (always .xml on GitHub/jsDelivr). */
function sitemapCdnPath(pathname) {
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/sitemap-index.xml" ||
    pathname === "/sitemap-pages.xml" ||
    (pathname.startsWith("/sitemaps/") && pathname.endsWith(".xml"))
  ) {
    return pathname;
  }
  if (pathname === "/sitemap" || pathname === "/sitemap-index" || pathname === "/sitemap-pages") {
    return pathname + ".xml";
  }
  const m = pathname.match(/^\/sitemaps\/(\d{2})$/);
  if (m) return `/sitemaps/${m[1]}.xml`;
  return null;
}

async function proxySitemap(publicPath) {
  const cdnPath = sitemapCdnPath(publicPath);
  if (!cdnPath) return null;
  try {
    const upstream = REPO_CDN + cdnPath;
    const res = await fetch(upstream);
    if (!res.ok) {
      return new Response(`Upstream ${res.status} for ${cdnPath}`, {
        status: res.status === 404 ? 404 : 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Worker-Ver": WORKER_VER,
        },
      });
    }
    let text = await res.text();
    // Point child locs at extensionless URLs (CF .xml paths 500)
    text = text.replaceAll(".xml</loc>", "</loc>");
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Worker-Ver": WORKER_VER,
        "X-Sitemap-Cdn": cdnPath,
      },
    });
  } catch (err) {
    return new Response(`Proxy error: ${err && err.message ? err.message : String(err)}`, {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Worker-Ver": WORKER_VER,
      },
    });
  }
}

async function proxyProductImage(pathname) {
  try {
    const upstream = REPO_CDN + pathname;
    const res = await fetch(upstream);
    if (!res.ok) {
      return new Response("Not found", { status: res.status === 404 ? 404 : 502 });
    }
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=604800",
        "X-Worker-Ver": WORKER_VER,
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

    if (url.pathname === "/__worker-ping") {
      return new Response(`ok ${WORKER_VER}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Worker-Ver": WORKER_VER },
      });
    }

    if (url.pathname.startsWith("/img/products/")) {
      return proxyProductImage(url.pathname);
    }

    const sm = await proxySitemap(url.pathname);
    if (sm) return sm;

    return env.ASSETS.fetch(request);
  },
};
