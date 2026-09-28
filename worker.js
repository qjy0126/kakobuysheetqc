/**
 * Proxy product images from GitHub CDN so Cloudflare deploy can skip
 * the ~430MB img/products folder (.assetsignore).
 */
const PRODUCT_CDN = "https://cdn.jsdelivr.net/gh/qjy0126/kakobuysheetqc@main";

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

    return env.ASSETS.fetch(request);
  },
};
