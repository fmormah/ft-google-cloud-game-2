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

function normalizeCopy(value) {
  const v = normCell(value);
  if (!v) return "";
  return v.replace(/\s+/g, " ").trim();
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
  // Some cells contain leading spaces, keep only the final basename.
  return path.basename(v.trim());
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function swapExt(pth, ext) {
  if (!pth) return pth;
  if (ext === ".webm") return pth.replace(/\.mp4$/i, ".webm");
  if (ext === ".mp4") return pth.replace(/\.webm$/i, ".mp4");
  return pth;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function destToLikelySourceMp4Name(destRelMp4) {
  // Backwards-compat wrapper: keep single best guess.
  return destToLikelySourceMp4Candidates(destRelMp4)[0] ?? "";
}

function destToLikelySourceMp4Candidates(destRelMp4) {
  const base = path.basename(destRelMp4);
  /** @type {string[]} */
  const candidates = [];

  const push = (name) => {
    const v = (name ?? "").trim();
    if (!v) return;
    if (!candidates.includes(v)) candidates.push(v);
  };

  push(base);

  // Common convention in this repo: public files end with `_converted.mp4`, but the source pool uses `.mp4`.
  if (/_converted\.mp4$/i.test(base)) {
    push(base.replace(/_converted\.mp4$/i, ".mp4"));
  }

  // Many updated pools drop `_KEYED` / `_UPDATED` segments.
  for (const c of [...candidates]) {
    push(c.replace(/_KEYED/gi, ""));
    push(c.replace(/_UPDATED/gi, ""));
    push(c.replace(/_KEYED/gi, "").replace(/_UPDATED/gi, ""));
  }

  // Some pools use spaces instead of underscores (e.g. "Energy Efficiency", "Demand Forecasing").
  for (const c of [...candidates]) {
    if (c.includes("_")) push(c.replace(/_/g, " "));
  }

  return candidates;
}

function resolveSourceWebmName(sourceDir, destRelWebm) {
  const destBase = path.basename(destRelWebm);
  const candidates = [];

  // 1) exact match
  candidates.push(destBase);

  // 2) if dest is not `_converted`, try `${base}_converted.webm` (common in vid_updates)
  const noExt = destBase.replace(/\.webm$/i, "");
  if (!/_converted$/i.test(noExt)) {
    candidates.push(`${noExt}_converted.webm`);
  }

  // 2b) try dropping `_KEYED` / `_UPDATED` segments (common in vid_updates)
  candidates.push(destBase.replace(/_KEYED/gi, ""));
  candidates.push(destBase.replace(/_UPDATED/gi, ""));
  candidates.push(destBase.replace(/_KEYED/gi, "").replace(/_UPDATED/gi, ""));

  // 3) if dest is `_converted.webm`, try a versioned variant like `... (1)_converted.webm`
  if (/_converted\.webm$/i.test(destBase)) {
    const prefix = destBase.replace(/_converted\.webm$/i, "");
    const re = new RegExp(`^${escapeRegExp(prefix)}\\s*\\(\\d+\\)_converted\\.webm$`, "i");
    try {
      const files = fs.readdirSync(sourceDir);
      const match = files.find((f) => re.test(f));
      if (match) candidates.push(match);
    } catch {
      // ignore
    }
  }

  // 4) underscore->space variants (some update filenames use spaces)
  for (const c of [...candidates]) {
    if (c.includes("_")) candidates.push(c.replace(/_/g, " "));
  }

  for (const c of candidates) {
    const srcAbs = path.join(sourceDir, c);
    if (fs.existsSync(srcAbs)) return c;
  }

  return "";
}

function readJsonStringLiteralFromLine(line) {
  const m = (line ?? "").match(/("(?:(?:\\.|[^"\\])*)")/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function parseScenarioDataForVideoTargets(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  const lines = content.split(/\r?\n/);

  /** @type {Map<number, {scenarioVideo:string|null, actions:Array<{actionDescription:string, postActionVideo:string|null}>}>} */
  const byQuestionIndex = new Map();

  let currentQuestionIndex = null;
  /** @type {{scenarioVideo:string|null, actions:Array<{actionDescription:string, postActionVideo:string|null}>} | null} */
  let currentQuestion = null;

  let inActionChoices = false;
  /** @type {{actionDescription:string, postActionVideo:string|null} | null} */
  let currentAction = null;

  function commitQuestion() {
    if (currentQuestion && typeof currentQuestionIndex === "number") {
      byQuestionIndex.set(currentQuestionIndex, currentQuestion);
    }
  }

  const readStringOnThisOrNextLine = (idx) => {
    const v0 = readJsonStringLiteralFromLine(lines[idx]);
    if (typeof v0 === "string" && v0) return { value: v0, consumedNext: false };
    const v1 = readJsonStringLiteralFromLine(lines[idx + 1] ?? "");
    if (typeof v1 === "string" && v1) return { value: v1, consumedNext: true };
    return { value: null, consumedNext: false };
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qi = line.match(/questionIndex:\s*(\d+)/);
    if (qi) {
      commitQuestion();
      currentQuestionIndex = Number(qi[1]);
      currentQuestion = { scenarioVideo: null, actions: [] };
      inActionChoices = false;
      currentAction = null;
      continue;
    }
    if (!currentQuestion) continue;

    if (line.includes("scenarioVideo:")) {
      const { value, consumedNext } = readStringOnThisOrNextLine(i);
      if (typeof value === "string") currentQuestion.scenarioVideo = value;
      if (consumedNext) i++;
      continue;
    }

    if (line.includes("actionChoices: [")) {
      inActionChoices = true;
      continue;
    }
    if (!inActionChoices) continue;

    if (line.trim() === "{") {
      currentAction = { actionDescription: "", postActionVideo: null };
      continue;
    }

    if (!currentAction) {
      if (line.trim() === "]," || line.trim() === "]") inActionChoices = false;
      continue;
    }

    if (line.includes("actionDescription:")) {
      const { value, consumedNext } = readStringOnThisOrNextLine(i);
      if (typeof value === "string") currentAction.actionDescription = value;
      if (consumedNext) i++;
      continue;
    }

    if (line.includes("postActionVideo:")) {
      const { value, consumedNext } = readStringOnThisOrNextLine(i);
      if (typeof value === "string") currentAction.postActionVideo = value;
      if (consumedNext) i++;
      continue;
    }

    if (line.trim() === "}," || line.trim() === "}") {
      currentQuestion.actions.push(currentAction);
      currentAction = null;
      continue;
    }
  }

  commitQuestion();
  return byQuestionIndex;
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  const isDryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");
  const sourceDirFlag = args.find((a) => a.startsWith("--source-dir="));
  const sourceDirFromEq = sourceDirFlag ? sourceDirFlag.split("=").slice(1).join("=").trim() : "";
  const sourceDirIdx = args.indexOf("--source-dir");
  const sourceDirFromNext =
    sourceDirIdx !== -1 ? (args[sourceDirIdx + 1] ?? "").trim() : "";
  const sourceDirRaw = sourceDirFromNext || sourceDirFromEq;

  if (!csvPath) {
    console.error(
      'Usage: node scripts/sync-scenario-videos-from-csv-to-public.mjs "/path/to/file.csv" [--source-dir /path/to/source] [--dry-run] [--verbose]'
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const defaultSourceDir = path.join(repoRoot, "asset_pool", "vid_pool", "scenarios");
  const sourceDir = sourceDirRaw
    ? (path.isAbsolute(sourceDirRaw) ? sourceDirRaw : path.join(repoRoot, sourceDirRaw))
    : defaultSourceDir;
  const publicRoot = path.join(repoRoot, "public");

  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");
  const files = [
    { charIndex: 0, label: "Stella", file: "character_index_0_scenarios.ts" },
    { charIndex: 1, label: "Sidney", file: "character_index_1_scenarios.ts" },
    { charIndex: 2, label: "Mo", file: "character_index_2_scenarios.ts" },
    { charIndex: 3, label: "Ali", file: "character_index_3_scenarios.ts" },
  ];

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headerIdx = rows.findIndex((r) => r.some((c) => normCell(c) === "Character"));
  if (headerIdx === -1) throw new Error("Could not locate header row in CSV.");
  const header = rows[headerIdx].map((c) => normCell(c));
  const colIndex = (name) => header.indexOf(name);

  const COL = {
    character: colIndex("Character"),
    scenarioIndex: colIndex("Scenario Index"),

    introWebm: colIndexAny(header, ["Introductin Video (.webm)", "Introduction Video (.webm)"]),
    introMp4: colIndexAny(header, ["Introductin Video (.mp4)", "Introduction Video (.mp4)"]),

    opt1Copy: colIndex("Option 1 Copy"),
    opt1Webm: colIndexAny(header, ["Option 1 Video Asset (.webm)", "Option 1 Video (.webm)"]),
    opt1Mp4: colIndexAny(header, ["Option 1 Video Asset (.mp4)", "Option 1 Video (.mp4)"]),

    opt2Copy: colIndex("Option 2 Copy"),
    opt2Webm: colIndexAny(header, ["Option 2 Video (.webm)", "Option 2 Video Asset (.webm)", "Option 2 Video Asset Path"]),
    opt2Mp4: colIndexAny(header, ["Option 2 Video  (.mp4)", "Option 2 Video (.mp4)", "Option 2 Video Asset (.mp4)"]),

    opt3Copy: colIndex("Option 3 Copy"),
    opt3Webm: colIndexAny(header, ["Option 3 Video Asset (.webm)", "Option 3 Video (.webm)"]),
    opt3Mp4: colIndexAny(header, ["Option 3 Video Asset (.mp4)", "Option 3 Video (.mp4)"]),
  };
  for (const [k, v] of Object.entries(COL)) {
    if (v === -1) throw new Error(`Missing expected column: ${k}`);
  }

  const charToIndex = { Stella: 0, Sidney: 1, Mo: 2, Ali: 3 };

  /** @type {Record<number, Record<number, any>>} */
  const csvByCharAndQ = {};
  for (const r of rows.slice(headerIdx + 1)) {
    const character = normCell(r[COL.character]).replace(/\s+/g, "");
    if (!character) continue;
    const charIndex = charToIndex[character];
    if (typeof charIndex !== "number") continue;

    const scenarioIndex = Number(normCell(r[COL.scenarioIndex]));
    if (!Number.isFinite(scenarioIndex) || scenarioIndex <= 0) continue;
    const qIndex = scenarioIndex - 1;

    const intro = {
      mp4: fileBasename(r[COL.introMp4]),
      webm: fileBasename(r[COL.introWebm]),
    };

    const opt = {
      1: {
        copy: normalizeCopy(r[COL.opt1Copy]),
        mp4: fileBasename(r[COL.opt1Mp4]),
        webm: fileBasename(r[COL.opt1Webm]),
      },
      2: {
        copy: normalizeCopy(r[COL.opt2Copy]),
        mp4: fileBasename(r[COL.opt2Mp4]),
        webm: fileBasename(r[COL.opt2Webm]),
      },
      3: {
        copy: normalizeCopy(r[COL.opt3Copy]),
        mp4: fileBasename(r[COL.opt3Mp4]),
        webm: fileBasename(r[COL.opt3Webm]),
      },
    };

    csvByCharAndQ[charIndex] ??= {};
    csvByCharAndQ[charIndex][qIndex] = { intro, opt };
  }

  let copied = 0;
  let skippedMissingSource = 0;
  let skippedNoCsvRow = 0;
  let skippedNoCopyMatch = 0;

  /** @type {string[]} */
  const missingSources = [];
  /** @type {string[]} */
  const noCopyMatch = [];

  /** @type {Set<string>} */
  const copiedDestAbs = new Set();

  const copyFile = (srcName, destRel) => {
    const srcAbs = path.join(sourceDir, srcName);
    const destAbs = path.join(publicRoot, destRel.replace(/^public\//, ""));
    if (copiedDestAbs.has(destAbs)) return true; // de-dupe repeated destinations
    ensureDir(path.dirname(destAbs));
    if (!isDryRun) fs.copyFileSync(srcAbs, destAbs);
    copiedDestAbs.add(destAbs);
    copied++;
    if (verbose) console.log(`COPY ${destRel} <- ${srcName}`);
    return true;
  };

  const copyIfExists = (srcName, destRel) => {
    if (!srcName) return false;
    const srcAbs = path.join(sourceDir, srcName);
    if (!fs.existsSync(srcAbs)) {
      skippedMissingSource++;
      if (verbose) missingSources.push(srcName);
      return false;
    }
    return copyFile(srcName, destRel);
  };

  const copyFirstExisting = (srcNames, destRel) => {
    for (const n of srcNames) {
      if (!n) continue;
      const srcAbs = path.join(sourceDir, n);
      if (!fs.existsSync(srcAbs)) continue;
      return copyFile(n, destRel);
    }
    return false;
  };

  for (const f of files) {
    const tsPath = path.join(scenarioDir, f.file);
    const targetsByQ = parseScenarioDataForVideoTargets(tsPath);
    const csvForChar = csvByCharAndQ[f.charIndex] ?? {};

    for (const [qIndex, target] of targetsByQ.entries()) {
      const csvRow = csvForChar[qIndex];
      if (!csvRow) {
        skippedNoCsvRow++;
        continue;
      }

      // Intro: copy mp4 into the exact file the app references; copy webm into the swapped extension path.
      if (target.scenarioVideo) {
        const destMp4 = target.scenarioVideo;
        const destWebm = swapExt(destMp4, ".webm");

        // MP4: prefer CSV name, else fall back to a likely source name derived from destination.
        copyIfExists(csvRow.intro.mp4, destMp4) ||
          copyFirstExisting(destToLikelySourceMp4Candidates(destMp4), destMp4);

        // WEBM: prefer CSV name, else try resolving from destination naming conventions.
        copyIfExists(csvRow.intro.webm, destWebm) ||
          copyIfExists(resolveSourceWebmName(sourceDir, destWebm), destWebm);
      }

      // Options: match by option copy text to find which CSV option maps to this action.
      for (const a of target.actions) {
        const actionCopy = normalizeCopy(a.actionDescription);
        if (!actionCopy || !a.postActionVideo) continue;

        let optNum = null;
        for (const n of [1, 2, 3]) {
          const c = csvRow.opt[n].copy;
          if (c && c === actionCopy) {
            optNum = n;
            break;
          }
        }
        if (!optNum) {
          skippedNoCopyMatch++;
          if (verbose) noCopyMatch.push(`${f.label} q${qIndex} "${actionCopy}"`);
          continue;
        }

        const destMp4 = a.postActionVideo;
        const destWebm = swapExt(destMp4, ".webm");

        // MP4: avoid obvious CSV mistakes where an option points to an intro video.
        const optMp4Csv = csvRow.opt[optNum].mp4;
        const introMp4Csv = csvRow.intro.mp4;
        const optMp4LooksLikeIntro = /intro/i.test(optMp4Csv) || (introMp4Csv && optMp4Csv === introMp4Csv);
        const copiedOptMp4 = !optMp4LooksLikeIntro ? copyIfExists(optMp4Csv, destMp4) : false;
        // Fallback: derive a likely mp4 name from destination basename (works well with vid_updates).
        if (!copiedOptMp4) {
          copyFirstExisting(destToLikelySourceMp4Candidates(destMp4), destMp4);
        }

        // WEBM: prefer CSV webm, else resolve from destination naming conventions (including versioned variants).
        copyIfExists(csvRow.opt[optNum].webm, destWebm) ||
          copyIfExists(resolveSourceWebmName(sourceDir, destWebm), destWebm);
      }
    }
  }

  console.log("CSV-DRIVEN SCENARIO VIDEO SYNC:");
  console.log(`- CSV:         ${csvPath}`);
  console.log(`- Source dir:  ${sourceDir}`);
  console.log(`- Dest:        ${path.join(repoRoot, "public", "assets", "video", "scene_videos")}`);
  console.log(`- Mode:        ${isDryRun ? "dry-run" : "copy"}`);
  console.log(`- Copied:      ${copied} files (only when source dir has a replacement)`);
  console.log(`- Skipped:     ${skippedMissingSource} missing source files in source dir (left public as-is)`);
  console.log(`- Skipped:     ${skippedNoCsvRow} questions missing from CSV (left public as-is)`);
  console.log(`- Skipped:     ${skippedNoCopyMatch} action->CSV option copy mismatches (left public as-is)`);

  if (verbose && missingSources.length) {
    console.log("\nMISSING SOURCES IN SOURCE DIR:");
    for (const m of Array.from(new Set(missingSources)).sort((a, b) => a.localeCompare(b))) {
      console.log(`- ${m}`);
    }
  }
  if (verbose && noCopyMatch.length) {
    console.log("\nNO CSV OPTION MATCH (by action copy):");
    for (const m of noCopyMatch) console.log(`- ${m}`);
  }
}

main();


