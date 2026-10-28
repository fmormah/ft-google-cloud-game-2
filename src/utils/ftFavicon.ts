const DEFAULT_FT_SYSTEM_CODE = "build-service";

export const FT_SYSTEM_CODE =
  process.env.NEXT_PUBLIC_FT_SYSTEM_CODE || DEFAULT_FT_SYSTEM_CODE;

export function getFtFaviconPngUrl(size: number) {
  const source = encodeURIComponent(FT_SYSTEM_CODE);
  return `https://images.ft.com/v3/image/raw/ftlogo-v1%3Abrand-ft-logo-square-coloured?source=${source}&width=${size}&height=${size}&format=png`;
}

export function getFaviconVersion() {
  const fromVercel =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_URL;
  return fromVercel || "local";
}


