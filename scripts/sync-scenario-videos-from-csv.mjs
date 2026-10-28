import fs from "node:fs";
import path from "node:path";

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

    if (ch === "\r") {
      continue;
    }

    field += ch;
  }

  // Flush last row
  row.push(field);
  rows.push(row);

  return rows;
}

function normCell(value) {
  const v = (value ?? "").trim();
  if (!v) return "";
  // Normalise different N/A tokens
  if (v.toLowerCase() === "n/a") return "";
  if (v.toLowerCase() === "[n/a]") return "";
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

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  const isDryRun = args.includes("--dry-run");

  if (!csvPath) {
    console.error(
      'Usage: node scripts/sync-scenario-videos-from-csv.mjs "/path/to/file.csv" [--dry-run]'
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const sourceDir = path.join(repoRoot, "asset_pool", "vid_pool");
  const destRoot = path.join(repoRoot, "public", "assets", "video", "scene_videos");

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);

  // Find header row
  const headerIdx = rows.findIndex((r) => r.some((c) => normCell(c) === "Character"));
  if (headerIdx === -1) {
    console.error("Could not locate header row in CSV (expected a 'Character' column).");
    process.exit(2);
  }

  const header = rows[headerIdx].map((c) => normCell(c));
  const colIndex = (name) => header.indexOf(name);

  const COL = {
    character: colIndex("Character"),
    scenarioIndex: colIndex("Scenario Index"),
    introVideo: colIndexAny(header, ["Introductin Video (.webm)", "Introduction Video (.webm)"]),
    opt1Video: colIndexAny(header, ["Option 1 Video Asset (.webm)", "Option 1 Video (.webm)"]),
    opt2Video: colIndexAny(header, ["Option 2 Video (.webm)", "Option 2 Video Asset (.webm)", "Option 2 Video Asset Path"]),
    opt3Video: colIndexAny(header, ["Option 3 Video Asset (.webm)", "Option 3 Video (.webm)"]),
  };

  for (const [k, v] of Object.entries(COL)) {
    if (v === -1) {
      console.error(`Missing expected column in CSV: ${k}`);
      process.exit(2);
    }
  }

  const charToIndex = {
    Stella: 0,
    Sidney: 1,
    Mo: 2,
    Ali: 3,
  };

  /** @type {{srcName:string, destPath:string}[]} */
  const copyJobs = [];
  /** @type {Set<string>} */
  const missing = new Set();
  /** @type {Set<string>} */
  const referenced = new Set();

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

    const intro = fileBasename(r[COL.introVideo]);
    const opt1 = fileBasename(r[COL.opt1Video]);
    const opt2 = fileBasename(r[COL.opt2Video]);
    const opt3 = fileBasename(r[COL.opt3Video]);

    const scenarioDir = path.join(
      destRoot,
      `character_${charIndex}_scenarios`,
      `scenario_${questionIndex}`
    );
    const postDir = path.join(scenarioDir, "post_action_vids");

    const addJob = (srcName, destFileName, destDir) => {
      if (!srcName) return;
      referenced.add(srcName);
      const srcPath = path.join(sourceDir, srcName);
      if (!fs.existsSync(srcPath)) {
        missing.add(srcName);
        return;
      }
      const ext = path.extname(srcName) || ".webm";
      const destPath = path.join(destDir, `${destFileName}${ext}`);
      copyJobs.push({ srcName, destPath });
    };

    addJob(intro, "index", scenarioDir);
    addJob(opt1, "index_0", postDir);
    addJob(opt2, "index_1", postDir);
    addJob(opt3, "index_2", postDir);
  }

  // De-dupe copy jobs by destination
  const seenDest = new Set();
  const deduped = copyJobs.filter((j) => {
    if (seenDest.has(j.destPath)) return false;
    seenDest.add(j.destPath);
    return true;
  });

  console.log(`Source dir: ${sourceDir}`);
  console.log(`Dest root:  ${destRoot}`);
  console.log(`CSV:        ${csvPath}`);
  console.log(`Referenced videos: ${referenced.size}`);
  console.log(`Missing videos:    ${missing.size}`);
  console.log(`Copy jobs:         ${deduped.length}${isDryRun ? " (dry-run)" : ""}`);

  if (!isDryRun) {
    for (const job of deduped) {
      const srcPath = path.join(sourceDir, job.srcName);
      ensureDir(path.dirname(job.destPath));
      fs.copyFileSync(srcPath, job.destPath);
    }
  }

  const missingList = Array.from(missing).sort((a, b) => a.localeCompare(b));
  if (missingList.length) {
    console.log("\nMISSING:");
    for (const m of missingList) console.log(`- ${m}`);
  }
}

main();




