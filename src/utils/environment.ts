export const PERMUTIVE_PROJECT_ID = process.env.PERMUTIVE_PROJECT_ID || "";
export const PERMUTIVE_PUBLIC_API_KEY =
  process.env.PERMUTIVE_PUBLIC_API_KEY || "";

// Canonical production origin. Keep this in sync with DNS (avoid `www.` unless
// that hostname is explicitly configured and has valid SSL).
const DEFAULT_SITE_URL = "https://transformingbusiness.ft.com";

const normalizeSiteUrl = (url: string) => {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Prefer the canonical site URL when explicitly set (intended for production),
 * otherwise fall back to the Vercel deployment URL so preview links and share
 * URLs reflect the current deployment.
 */
export const SITE_URL = (() => {
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  const nextPublicUrl = process.env.NEXT_PUBLIC_URL;

  if (nextPublicUrl && nextPublicUrl.trim())
    return normalizeSiteUrl(nextPublicUrl);
  if (vercelUrl && vercelUrl.trim()) return normalizeSiteUrl(vercelUrl);
  if (typeof window !== "undefined" && window.location?.origin)
    return window.location.origin.replace(/\/$/, "");
  return DEFAULT_SITE_URL;
})();

const NORMALIZED_SITE_URL = SITE_URL.replace(/\/$/, "");
export const LINKEDIN_SHARE_URL = NORMALIZED_SITE_URL
  ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(NORMALIZED_SITE_URL)}`
  : "";
