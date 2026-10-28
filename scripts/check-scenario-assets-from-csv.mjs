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
  return path.basename(v.trim());
}

function safeGet(row, idx) {
  if (idx < 0) return "";
  return row[idx] ?? "";
}

function buildCaseInsensitiveIndex(dirPath) {
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const name of fs.readdirSync(dirPath)) {
    map.set(name.toLowerCase(), name);
  }
  return map;
}

function suggestClosestName(fileName, nameIndexLower) {
  const low = fileName.toLowerCase();
  if (nameIndexLower.has(low)) return nameIndexLower.get(low);

  // Try common normalizations: trim, collapse spaces, replace double spaces, strip leading/trailing spaces already done.
  const normalized = fileName.replace(/\s+/g, " ").trim();
  const normalizedLow = normalized.toLowerCase();
  if (nameIndexLower.has(normalizedLow)) return nameIndexLower.get(normalizedLow);

  // Replace spaces with underscores (common repo convention).
  const underscored = normalized.replace(/\s+/g, "_");
  const underscoredLow = underscored.toLowerCase();
  if (nameIndexLower.has(underscoredLow)) return nameIndexLower.get(underscoredLow);

  // Remove parentheses (common when exporting duplicates like "(1)").
  const noParens = underscored.replace(/[()]/g, "");
  const noParensLow = noParens.toLowerCase();
  if (nameIndexLower.has(noParensLow)) return nameIndexLower.get(noParensLow);

  return null;
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  if (!csvPath) {
    console.error('Usage: node scripts/check-scenario-assets-from-csv.mjs "/path/to/file.csv"');
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const assetDir = path.join(repoRoot, "asset_pool", "vid_pool", "scenarios");
  if (!fs.existsSync(assetDir)) {
    console.error(`Asset directory not found: ${assetDir}`);
    process.exit(2);
  }

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
    role: colIndex("Role"),
    scenarioIndex: colIndex("Scenario Index"),

    introWebm: colIndexAny(header, ["Introductin Video (.webm)", "Introduction Video (.webm)"]),
    introMp4: colIndexAny(header, ["Introductin Video (.mp4)", "Introduction Video (.mp4)"]),

    opt1Webm: colIndexAny(header, ["Option 1 Video Asset (.webm)", "Option 1 Video (.webm)"]),
    opt1Mp4: colIndexAny(header, ["Option 1 Video Asset (.mp4)", "Option 1 Video (.mp4)"]),
    opt2Webm: colIndexAny(header, ["Option 2 Video (.webm)", "Option 2 Video Asset (.webm)"]),
    opt2Mp4: colIndexAny(header, ["Option 2 Video  (.mp4)", "Option 2 Video (.mp4)", "Option 2 Video Asset (.mp4)"]),
    opt3Webm: colIndexAny(header, ["Option 3 Video Asset (.webm)", "Option 3 Video (.webm)"]),
    opt3Mp4: colIndexAny(header, ["Option 3 Video Asset (.mp4)", "Option 3 Video (.mp4)"]),
  };

  for (const [k, v] of Object.entries(COL)) {
    if (v === -1) {
      console.error(`Missing expected column: ${k}`);
      process.exit(2);
    }
  }

  const nameIndexLower = buildCaseInsensitiveIndex(assetDir);

  /** @type {Array<{character:string, role:string, scenarioIndex:string, column:string, file:string, suggestion:string|null}>} */
  const missing = [];
  let checked = 0;

  for (const r of rows.slice(headerIdx + 1)) {
    const character = normCell(safeGet(r, COL.character)).replace(/\s+/g, "");
    if (!character) continue;
    const role = normCell(safeGet(r, COL.role));
    const scenarioIndex = normCell(safeGet(r, COL.scenarioIndex));
    if (!scenarioIndex) continue;

    const candidates = [
      { column: "Intro (.webm)", file: fileBasename(safeGet(r, COL.introWebm)) },
      { column: "Intro (.mp4)", file: fileBasename(safeGet(r, COL.introMp4)) },
      { column: "Option 1 (.webm)", file: fileBasename(safeGet(r, COL.opt1Webm)) },
      { column: "Option 1 (.mp4)", file: fileBasename(safeGet(r, COL.opt1Mp4)) },
      { column: "Option 2 (.webm)", file: fileBasename(safeGet(r, COL.opt2Webm)) },
      { column: "Option 2 (.mp4)", file: fileBasename(safeGet(r, COL.opt2Mp4)) },
      { column: "Option 3 (.webm)", file: fileBasename(safeGet(r, COL.opt3Webm)) },
      { column: "Option 3 (.mp4)", file: fileBasename(safeGet(r, COL.opt3Mp4)) },
    ].filter((c) => c.file);

    for (const c of candidates) {
      checked++;
      const target = path.join(assetDir, c.file);
      if (fs.existsSync(target)) continue;
      const suggestion = suggestClosestName(c.file, nameIndexLower);
      missing.push({ character, role, scenarioIndex, column: c.column, file: c.file, suggestion });
    }
  }

  if (!missing.length) {
    console.log("SCENARIO ASSET CHECK (asset_pool): PASS");
    console.log(`Checked ${checked} CSV asset references against ${assetDir}`);
    return;
  }

  console.error("SCENARIO ASSET CHECK (asset_pool): FAIL");
  console.error(`Missing ${missing.length} / ${checked} CSV asset references in ${assetDir}`);
  for (const m of missing) {
    const where = `${m.character} (${m.role}) scenario ${m.scenarioIndex}`;
    const hint = m.suggestion ? ` (did you mean: ${m.suggestion})` : "";
    console.error(`- ${where} ${m.column}: ${m.file}${hint}`);
  }
  process.exit(1);
}

main();


