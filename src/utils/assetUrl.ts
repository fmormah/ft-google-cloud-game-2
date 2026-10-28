function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

let cachedBrowserAssetBaseUrl: string | null | undefined;

function getBrowserAssetBaseUrl(): string {
  // Cache once to avoid repeatedly calling getComputedStyle during render.
  if (cachedBrowserAssetBaseUrl !== undefined) {
    return cachedBrowserAssetBaseUrl ?? "";
  }
  try {
    const el = document.documentElement;
    const raw = getComputedStyle(el).getPropertyValue("--asset-base-url").trim();
    cachedBrowserAssetBaseUrl = raw ? raw.replace(/\/$/, "") : null;
  } catch {
    cachedBrowserAssetBaseUrl = null;
  }
  return cachedBrowserAssetBaseUrl ?? "";
}

function getAssetBaseUrl(): string {
  // In the browser, prefer the SSR-provided CSS variable so SSR + hydration match
  // even if the client bundle has stale inlined env values.
  if (typeof window !== "undefined") {
    const fromDom = getBrowserAssetBaseUrl();
    if (fromDom) return fromDom;
  }
  return (
    process.env.NEXT_PUBLIC_ASSET_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_PATH ??
    ""
  ).replace(/\/$/, "");
}

/**
 * Prefixes `/assets/...` paths with `NEXT_PUBLIC_ASSET_BASE_URL` when provided.
 *
 * - If the base URL is unset, returns the input unchanged (local `/public` assets keep working).
 * - If the input is already an absolute URL (http/https), returns it unchanged.
 */
export function assetUrl(value: string): string {
  if (!value) return value;
  if (isAbsoluteUrl(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  // The archive omits the large scenario library. It can use the original media
  // bucket independently of the local images, audio, and opening videos.
  const projectPath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const publicPath = projectPath && value.startsWith(`${projectPath}/`)
    ? value.slice(projectPath.length)
    : value.startsWith("/") ? value : `/${value}`;
  const scenarioBase = (process.env.NEXT_PUBLIC_SCENARIO_ASSET_BASE_URL ?? "")
    .replace(/\/$/, "");
  if (scenarioBase && /^\/assets\/video\/scene_videos\/character_/.test(publicPath)) {
    return `${scenarioBase}${publicPath}`;
  }

  const base = getAssetBaseUrl();
  if (!base) return value;
  // Exported literals may already include the Pages prefix; dynamic paths do not.
  if (value === base || value.startsWith(`${base}/`)) return value;
  if (value.startsWith("/")) return `${base}${value}`;
  return `${base}/${value}`;
}


