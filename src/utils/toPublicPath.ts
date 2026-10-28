export function toPublicPath(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  const normalized = path.replace(/^public\//, "/");
  // Ensure asset paths are absolute so they don't resolve relative to the current route (e.g. `/app`).
  if (normalized.startsWith("assets/")) return `/${normalized}`;
  return normalized;
}


