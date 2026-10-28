import fs from "fs";
import path from "path";

function parseDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function getAssetBaseUrl() {
  if (process.env.NEXT_PUBLIC_ASSET_BASE_URL) return process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  const envLocal = parseDotEnvFile(path.join(process.cwd(), ".env.local"));
  return envLocal.NEXT_PUBLIC_ASSET_BASE_URL || "";
}

function exists(relPath) {
  return fs.existsSync(path.join(process.cwd(), relPath));
}

function main() {
  const assetBaseUrl = getAssetBaseUrl();
  if (assetBaseUrl) {
    // Using remote bucket/assets base URL; local files are optional.
    process.exit(0);
  }

  // Check a couple of "canary" assets that should exist when assets are downloaded.
  // (Folders may exist in git even when large binaries are missing.)
  const required = [
    "public/assets/audio/bg_music.mp3",
    "public/assets/video/scene_videos/opening-splash_Video_converted.webm",
  ];

  const missing = required.filter((p) => !exists(p));
  if (!missing.length) process.exit(0);

  const lines = [
    "",
    "ERROR: Required local assets are missing.",
    "",
    "This project expects media under `public/assets/` for local development.",
    "",
    "Missing (examples):",
    ...missing.map((p) => `- ${p}`),
    "",
    "Fix: download assets from the Google Cloud bucket and place them into `public/assets/`.",
    "See: docs/ASSETS_DOWNLOAD.md",
    "",
    "Alternative: set NEXT_PUBLIC_ASSET_BASE_URL to use the bucket directly (see env.example).",
    "",
  ];
  console.error(lines.join("\n"));
  process.exit(2);
}

main();


