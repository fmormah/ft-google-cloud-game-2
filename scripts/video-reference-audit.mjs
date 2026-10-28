#!/usr/bin/env node
/**
 * VIDEO REFERENCE AUDIT
 * Triple checks every video reference against CSV and file existence
 */

import fs from "node:fs";
import path from "node:path";

// CSV Parser
function parseCsv(csvText) {
  const rows = [];
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

function normCell(v) {
  const s = (v ?? "").trim();
  if (!s || s.toLowerCase() === "n/a" || s.toLowerCase() === "[n/a]") return "";
  return s;
}

function basename(v) {
  const s = normCell(v);
  return s ? path.basename(s).trim() : "";
}

function colIndexAny(header, names) {
  for (const n of names) {
    const i = header.indexOf(n);
    if (i !== -1) return i;
  }
  return -1;
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error(
      'Usage: node scripts/video-reference-audit.mjs "/path/to/csv"'
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const publicRoot = path.join(
    repoRoot,
    "public",
    "assets",
    "video",
    "scene_videos"
  );
  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");

  // Parse CSV
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headerIdx = rows.findIndex((r) =>
    r.some((c) => normCell(c) === "Character")
  );
  const header = rows[headerIdx].map((c) => normCell(c));

  const COL = {
    character: header.indexOf("Character"),
    scenarioIndex: header.indexOf("Scenario Index"),
    introWebm: colIndexAny(header, [
      "Introductin Video (.webm)",
      "Introduction Video (.webm)",
    ]),
    introMp4: colIndexAny(header, [
      "Introductin Video (.mp4)",
      "Introduction Video (.mp4)",
    ]),
    opt1Webm: colIndexAny(header, ["Option 1 Video Asset (.webm)"]),
    opt1Mp4: colIndexAny(header, ["Option 1 Video Asset (.mp4)"]),
    opt2Webm: colIndexAny(header, ["Option 2 Video (.webm)"]),
    opt2Mp4: colIndexAny(header, [
      "Option 2 Video  (.mp4)",
      "Option 2 Video (.mp4)",
    ]),
    opt3Webm: colIndexAny(header, ["Option 3 Video Asset (.webm)"]),
    opt3Mp4: colIndexAny(header, ["Option 3 Video Asset (.mp4)"]),
  };

  const charMap = { Stella: 0, Sidney: 1, Mo: 2, Ali: 3 };
  const charNames = ["Stella", "Sidney", "Mo", "Ali"];
  const roles = ["CEO", "CIO", "CSCO", "CFO"];

  // Build CSV video map
  const csvVideos = {};
  for (const r of rows.slice(headerIdx + 1)) {
    const char = normCell(r[COL.character]).replace(/\s+/g, "");
    const charIdx = charMap[char];
    if (typeof charIdx !== "number") continue;
    const scenarioIdx = Number(normCell(r[COL.scenarioIndex]));
    if (!Number.isFinite(scenarioIdx) || scenarioIdx <= 0) continue;
    const qIdx = scenarioIdx - 1;

    csvVideos[`${charIdx}-${qIdx}`] = {
      intro: {
        webm: basename(r[COL.introWebm]),
        mp4: basename(r[COL.introMp4]),
      },
      opt1: { webm: basename(r[COL.opt1Webm]), mp4: basename(r[COL.opt1Mp4]) },
      opt2: { webm: basename(r[COL.opt2Webm]), mp4: basename(r[COL.opt2Mp4]) },
      opt3: { webm: basename(r[COL.opt3Webm]), mp4: basename(r[COL.opt3Mp4]) },
    };
  }

  // Extract app video refs from TS files
  function extractAppVideos(tsPath) {
    const content = fs.readFileSync(tsPath, "utf8");
    const videos = {};

    // Find all scenarioVideo and postActionVideo references
    const scenarioMatches = [
      ...content.matchAll(
        /questionIndex:\s*(\d+)[\s\S]*?scenarioVideo:\s*["']([^"']+)["']/g
      ),
    ];
    const actionMatches = [
      ...content.matchAll(/postActionVideo:\s*["']([^"']+)["']/g),
    ];

    let currentQ = -1;
    let actionIdx = 0;

    for (const m of scenarioMatches) {
      const qIdx = Number(m[1]);
      const videoPath = m[2];
      videos[qIdx] = videos[qIdx] || { intro: "", options: [] };
      videos[qIdx].intro = path.basename(videoPath);
    }

    // Re-parse to get options in order
    const lines = content.split("\n");
    let inQ = -1;
    let optionCount = 0;

    for (const line of lines) {
      const qMatch = line.match(/questionIndex:\s*(\d+)/);
      if (qMatch) {
        inQ = Number(qMatch[1]);
        optionCount = 0;
        videos[inQ] = videos[inQ] || { intro: "", options: [] };
      }

      const introMatch = line.match(/scenarioVideo:\s*["']([^"']+)["']/);
      if (introMatch && inQ >= 0) {
        videos[inQ].intro = path.basename(introMatch[1]);
      }

      const optMatch = line.match(/postActionVideo:\s*["']([^"']+)["']/);
      if (optMatch && inQ >= 0) {
        videos[inQ].options.push(path.basename(optMatch[1]));
      }
    }

    return videos;
  }

  console.log("═".repeat(90));
  console.log("VIDEO REFERENCE AUDIT - TRIPLE CHECK");
  console.log("═".repeat(90));

  let totalIssues = 0;

  for (let charIdx = 0; charIdx < 4; charIdx++) {
    const tsFile = path.join(
      scenarioDir,
      `character_index_${charIdx}_scenarios.ts`
    );
    const appVideos = extractAppVideos(tsFile);

    console.log(`\n${"▓".repeat(90)}`);
    console.log(`▓ ${charNames[charIdx]} (${roles[charIdx]})`);
    console.log(`${"▓".repeat(90)}`);

    for (let qIdx = 0; qIdx < 5; qIdx++) {
      const key = `${charIdx}-${qIdx}`;
      const csv = csvVideos[key];
      const app = appVideos[qIdx] || { intro: "", options: [] };

      console.log(`\n  ┌─ Scenario ${qIdx + 1}`);

      // Check intro video
      const csvIntro = csv?.intro?.mp4 || csv?.intro?.webm || "";
      const appIntro = app.intro;
      const introDir = path.join(
        publicRoot,
        `character_${charIdx}_scenarios`,
        `scenario_${qIdx}`
      );
      const introMp4Exists =
        appIntro && fs.existsSync(path.join(introDir, appIntro));
      const introWebmExists =
        appIntro &&
        fs.existsSync(
          path.join(introDir, appIntro.replace(/\.mp4$/i, ".webm"))
        );

      console.log(`  │`);
      console.log(`  │ INTRO VIDEO:`);
      console.log(`  │   CSV says:     ${csvIntro || "(none)"}`);
      console.log(`  │   App uses:     ${appIntro || "(none)"}`);
      console.log(
        `  │   .mp4 exists:  ${introMp4Exists ? "✅ YES" : "❌ NO"} → ${path.join(introDir, appIntro || "")}`
      );
      console.log(
        `  │   .webm exists: ${introWebmExists ? "✅ YES" : "❌ NO"} → ${path.join(introDir, (appIntro || "").replace(/\.mp4$/i, ".webm"))}`
      );

      if (!introMp4Exists || !introWebmExists) totalIssues++;

      // Check option videos
      const optDir = path.join(introDir, "post_action_vids");
      const csvOpts = [csv?.opt1, csv?.opt2, csv?.opt3].filter(
        (o) => o?.mp4 || o?.webm
      );

      for (let i = 0; i < Math.max(csvOpts.length, app.options.length); i++) {
        const csvOpt = csvOpts[i];
        const appOpt = app.options[i];
        const csvOptFile = csvOpt?.mp4 || csvOpt?.webm || "";

        const optMp4Exists = appOpt && fs.existsSync(path.join(optDir, appOpt));
        const optWebmExists =
          appOpt &&
          fs.existsSync(path.join(optDir, appOpt.replace(/\.mp4$/i, ".webm")));

        console.log(`  │`);
        console.log(`  │ OPTION ${i + 1} VIDEO:`);
        console.log(`  │   CSV says:     ${csvOptFile || "(none)"}`);
        console.log(`  │   App uses:     ${appOpt || "(none)"}`);
        console.log(`  │   .mp4 exists:  ${optMp4Exists ? "✅ YES" : "❌ NO"}`);
        console.log(
          `  │   .webm exists: ${optWebmExists ? "✅ YES" : "❌ NO"}`
        );

        if (!optMp4Exists || !optWebmExists) totalIssues++;
      }

      console.log(`  └${"─".repeat(85)}`);
    }
  }

  console.log("\n" + "═".repeat(90));
  console.log(`TOTAL MISSING FILES: ${totalIssues}`);
  console.log("═".repeat(90));

  if (totalIssues > 0) {
    console.log("\n🔴 ISSUES FOUND - Some video files are missing!");
    process.exit(1);
  } else {
    console.log(
      "\n🟢 ALL VIDEO REFERENCES VALID - Every referenced file exists!"
    );
  }
}

main();
