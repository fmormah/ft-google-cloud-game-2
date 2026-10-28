import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseCsv(csvText) {
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        continue;
      }
      field += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }
    if (ch === "\r") continue;
    field += ch;
  }

  row.push(field);
  rows.push(row);
  return rows;
}

function normCell(value) {
  const v = (value ?? "").trim();
  if (!v) return "";
  const low = v.toLowerCase();
  if (low === "n/a" || low === "[n/a]") return "";
  return v;
}

function colIndexAny(header, names) {
  for (const name of names) {
    const idx = header.indexOf(name);
    if (idx !== -1) return idx;
  }
  return -1;
}

function fileBasename(value) {
  const v = normCell(value);
  if (!v) return "";
  return path.basename(v);
}

function sanitizeBaseName(fileName) {
  // Keep this stable + URL-safe (avoid spaces/parentheses in public URLs)
  const base = fileName.replace(/\.[^.]+$/, "");
  return base
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .replace(/__+/g, "_")
    .replace(/_+$/g, "");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(srcPath, destPath) {
  ensureDir(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
}

function buildBasenameIndex(rootDir) {
  /** @type {Map<string, string[]>} */
  const index = new Map();

  /** @param {string} dir */
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (!ent.isFile()) continue;
      const base = path.basename(ent.name);
      const arr = index.get(base) ?? [];
      arr.push(full);
      index.set(base, arr);
    }
  };

  walk(rootDir);
  return index;
}

function convertToWebm(srcMp4Path, destWebmPath) {
  ensureDir(path.dirname(destWebmPath));
  const res = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      srcMp4Path,
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      "33",
      "-pix_fmt",
      "yuv420p",
      "-row-mt",
      "1",
      "-cpu-used",
      "4",
      "-deadline",
      "good",
      "-c:a",
      "libopus",
      "-b:a",
      "96k",
      destWebmPath,
    ],
    { stdio: "inherit" }
  );
  if (res.status !== 0) {
    throw new Error(`ffmpeg failed converting ${path.basename(srcMp4Path)} → webm`);
  }
}

function convertToMp4(srcWebmPath, destMp4Path) {
  ensureDir(path.dirname(destMp4Path));
  const res = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      srcWebmPath,
      // Make output broadly compatible (Safari etc.)
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-profile:v",
      "main",
      "-level",
      "4.0",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      destMp4Path,
    ],
    { stdio: "inherit" }
  );
  if (res.status !== 0) {
    throw new Error(`ffmpeg failed converting ${path.basename(srcWebmPath)} → mp4`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  const isDryRun = args.includes("--dry-run");
  const convert = !args.includes("--no-convert");
  const forceConvert = args.includes("--force-convert");

  if (!csvPath) {
    console.error(
      'Usage: node scripts/sync-scenario-videos-desktop-mobile.mjs "/path/to/file.csv" [--dry-run] [--no-convert]'
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const sourceDir = path.join(repoRoot, "asset_pool", "vid_pool");
  const destRoot = path.join(repoRoot, "public", "assets", "video", "scene_videos");

  const sourceIndex = buildBasenameIndex(sourceDir);

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);

  const headerIdx = rows.findIndex((r) => r.some((c) => normCell(c) === "Character"));
  if (headerIdx === -1) {
    console.error("Could not locate header row in CSV.");
    process.exit(2);
  }

  const header = rows[headerIdx].map((c) => normCell(c));
  const colIndex = (name) => header.indexOf(name);
  const COL = {
    character: colIndex("Character"),
    scenarioIndex: colIndex("Scenario Index"),
    introVideo: colIndexAny(header, ["Introductin Video (.webm)", "Introduction Video (.webm)"]),
    introVideoMp4: colIndexAny(header, ["Introductin Video (.mp4)", "Introduction Video (.mp4)"]),
    opt1Video: colIndexAny(header, ["Option 1 Video Asset (.webm)", "Option 1 Video (.webm)"]),
    opt1VideoMp4: colIndexAny(header, ["Option 1 Video Asset (.mp4)", "Option 1 Video (.mp4)"]),
    opt2Video: colIndexAny(header, ["Option 2 Video (.webm)", "Option 2 Video Asset (.webm)", "Option 2 Video Asset Path"]),
    opt2VideoMp4: colIndexAny(header, ["Option 2 Video  (.mp4)", "Option 2 Video (.mp4)"]),
    opt3Video: colIndexAny(header, ["Option 3 Video Asset (.webm)", "Option 3 Video (.webm)"]),
    opt3VideoMp4: colIndexAny(header, ["Option 3 Video Asset (.mp4)", "Option 3 Video (.mp4)"]),
  };
  for (const [k, v] of Object.entries(COL)) {
    // Mp4 columns are optional (we can derive mp4 from webm or webm from mp4).
    if (v === -1 && !k.toLowerCase().includes("mp4")) {
      console.error(`Missing expected column: ${k}`);
      process.exit(2);
    }
  }

  const charToIndex = {
    Stella: 0,
    Sidney: 1,
    Mo: 2,
    Ali: 3,
  };

  /** @type {Set<string>} */
  const missing = new Set();
  /** @type {{srcWebm:string|null, srcMp4:string|null, destWebm:string, destMp4:string}[]} */
  const jobs = [];

  const dataRows = rows.slice(headerIdx + 1);
  for (const r of dataRows) {
    const character = normCell(r[COL.character]);
    if (!character) continue;
    const charKey = character.replace(/\s+/g, "");
    const charIndex = charToIndex[charKey];
    if (typeof charIndex !== "number") continue;

    const scenarioIndexRaw = normCell(r[COL.scenarioIndex]);
    const scenarioIndex = Number(scenarioIndexRaw);
    if (!Number.isFinite(scenarioIndex) || scenarioIndex <= 0) continue;
    const questionIndex = scenarioIndex - 1;

    const introWebm = fileBasename(r[COL.introVideo]);
    const introMp4 = fileBasename(r[COL.introVideoMp4]);
    const opt1Webm = fileBasename(r[COL.opt1Video]);
    const opt1Mp4 = fileBasename(r[COL.opt1VideoMp4]);
    const opt2Webm = fileBasename(r[COL.opt2Video]);
    const opt2Mp4 = fileBasename(r[COL.opt2VideoMp4]);
    const opt3Webm = fileBasename(r[COL.opt3Video]);
    const opt3Mp4 = fileBasename(r[COL.opt3VideoMp4]);

    const scenarioDir = path.join(
      destRoot,
      `character_${charIndex}_scenarios`,
      `scenario_${questionIndex}`
    );
    const postDir = path.join(scenarioDir, "post_action_vids");

    const add = (srcWebmName, srcMp4Name, destDir) => {
      const preferred = srcWebmName || srcMp4Name;
      if (!preferred) return;

      const safeBase = sanitizeBaseName(preferred);
      const destWebm = path.join(destDir, `${safeBase}.webm`);
      const destMp4 = path.join(destDir, `${safeBase}.mp4`);

      const webmMatches = srcWebmName ? sourceIndex.get(srcWebmName) ?? [] : [];
      const mp4Matches = srcMp4Name ? sourceIndex.get(srcMp4Name) ?? [] : [];
      const srcWebmPath = webmMatches[0] ?? null;
      const srcMp4Path = mp4Matches[0] ?? null;

      if (!srcWebmPath && !srcMp4Path) {
        missing.add(srcWebmName || srcMp4Name);
        return;
      }

      jobs.push({ srcWebm: srcWebmPath, srcMp4: srcMp4Path, destWebm, destMp4 });
    };

    add(introWebm, introMp4, scenarioDir);
    add(opt1Webm, opt1Mp4, postDir);
    add(opt2Webm, opt2Mp4, postDir);
    add(opt3Webm, opt3Mp4, postDir);
  }

  // De-dupe by destWebm (same video can be referenced multiple times)
  const seen = new Set();
  const deduped = jobs.filter((j) => {
    const key = j.destWebm;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Source dir: ${sourceDir}`);
  console.log(`Dest root:  ${destRoot}`);
  console.log(`CSV:        ${csvPath}`);
  console.log(`Jobs:       ${deduped.length}${isDryRun ? " (dry-run)" : ""}`);
  console.log(`Missing:    ${missing.size}`);

  if (!isDryRun) {
    for (const j of deduped) {
      if (j.srcWebm) {
        copyFile(j.srcWebm, j.destWebm);
      } else if (j.srcMp4) {
        convertToWebm(j.srcMp4, j.destWebm);
      } else {
        // Should not happen (filtered by missing check), but stay defensive.
        continue;
      }
      if (convert) {
        // Convert if mp4 missing or stale vs the copied webm (or forced).
        const shouldConvert = (() => {
          if (forceConvert) return true;
          if (!fs.existsSync(j.destMp4)) return true;
          try {
            const mp4Stat = fs.statSync(j.destMp4);
            const webmStat = fs.statSync(j.destWebm);
            return mp4Stat.mtimeMs < webmStat.mtimeMs;
          } catch {
            return true;
          }
        })();
        if (shouldConvert) {
          convertToMp4(j.destWebm, j.destMp4);
        }
      }
    }
  }

  const missingList = Array.from(missing).sort((a, b) => a.localeCompare(b));
  if (missingList.length) {
    console.log("\nMISSING:");
    for (const m of missingList) console.log(`- ${m}`);
  }
}

main();


