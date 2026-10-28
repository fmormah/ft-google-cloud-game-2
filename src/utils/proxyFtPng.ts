import { getFtFaviconPngUrl } from "@/utils/ftFavicon";

/**
 * Proxies a PNG icon from FT's image service so Safari/iOS can fetch a same-origin
 * icon URL (some Safari builds are picky about cross-origin icon URLs).
 */
export async function proxyFtPng(size: number): Promise<Response> {
  const upstreamUrl = getFtFaviconPngUrl(size);

  const upstream = await fetch(upstreamUrl, {
    // Allow platform/runtime caching where available; the browser will also cache.
    cache: "force-cache",
  });

  if (!upstream.ok) {
    return new Response(null, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      // Keep icons cacheable, but let callers add a `?v=` param to force refresh
      // across deployments when needed.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}


