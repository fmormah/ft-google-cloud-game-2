#!/usr/bin/env node
/**
 * TRIPLE CHECK: CSV vs App vs Asset Pool
 *
 * Compares:
 * 1. CSV (source of truth) - video filenames and copy
 * 2. App scenario files - what the code references
 * 3. Asset pool - what files actually exist to copy
 * 4. Public folder - what files the app can actually use
 */

import fs from "node:fs";
import path from "node:path";

// ============== CSV PARSING ==============
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

function normalizeForCompare(value) {
  return normalizeCopy(value).replace(/[']/g, "'").replace(/[""]/g, '"').trim();
}

function fileBasename(value) {
  const v = normCell(value);
  if (!v) return "";
  return path.basename(v).trim();
}

function parseCorrectOptions(value) {
  const v = normCell(value);
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const m = s.match(/Option\s*(\d+)/i);
      return m ? Number(m[1]) : null;
    })
    .filter((n) => typeof n === "number" && Number.isFinite(n));
}

function parsePercentInt(value) {
  const v = normCell(value);
  if (!v) return null;
  const num = Number(v.replace("%", "").trim());
  if (!Number.isFinite(num)) return null;
  return Math.trunc(num);
}

function colIndexAny(header, names) {
  for (const name of names) {
    const idx = header.indexOf(name);
    if (idx !== -1) return idx;
  }
  return -1;
}

// ============== APP SCENARIO EXTRACTION ==============
function extractFromScenarioTs(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  const questions = [];

  const questionMatches = content.matchAll(
    /questionIndex:\s*(\d+)[\s\S]*?(?=questionIndex:|questions:\s*\[|$)/g
  );

  for (const match of questionMatches) {
    const questionBlock = match[0];
    const questionIndex = Number(match[1]);

    const extractField = (fieldName) => {
      const regex = new RegExp(
        `${fieldName}:\\s*["'\`]([\\s\\S]*?)["'\`],?\\s*(?=\\w+:|\\})`
      );
      const m = questionBlock.match(regex);
      return m ? m[1] : "";
    };

    const question = {
      questionIndex,
      questionTitle: extractField("questionTitle"),
      scenarioDescription: extractField("scenarioDescription"),
      scenarioVideo: extractField("scenarioVideo"),
      actions: [],
    };

    const actionsMatch = questionBlock.match(
      /actionChoices:\s*\[([\s\S]*?)\],/
    );
    if (actionsMatch) {
      const actionsBlock = actionsMatch[1];
      const actionMatches = actionsBlock.matchAll(/\{([\s\S]*?)\}/g);

      for (const actionMatch of actionMatches) {
        const actionBlock = actionMatch[1];

        const extractActionField = (fieldName) => {
          const regex = new RegExp(
            `${fieldName}:\\s*["'\`]([\\s\\S]*?)["'\`],?\\s*(?=\\w+:|$)`
          );
          const m = actionBlock.match(regex);
          return m ? m[1] : "";
        };

        const pointsMatch = actionBlock.match(/pointsImpact:\s*(-?\d+)/);
        const correctMatch = actionBlock.match(
          /isCorrectAnswer:\s*(true|false)/
        );

        question.actions.push({
          actionDescription: extractActionField("actionDescription"),
          postActionDescription: extractActionField("postActionDescription"),
          postActionVideo: extractActionField("postActionVideo"),
          icon: extractActionField("icon"),
          pointsImpact: pointsMatch ? Number(pointsMatch[1]) : 0,
          isCorrectAnswer: correctMatch ? correctMatch[1] === "true" : false,
        });
      }
    }

    questions.push(question);
  }

  return questions;
}

// ============== MAIN ==============
function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.error(
      'Usage: node scripts/triple-check-scenarios.mjs "/path/to/file.csv"'
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");
  const assetPoolDir = path.join(
    repoRoot,
    "asset_pool",
    "vid_pool",
    "scenarios"
  );
  const publicVideoDir = path.join(
    repoRoot,
    "public",
    "assets",
    "video",
    "scene_videos"
  );

  // Get all files in asset pool
  const assetPoolFiles = new Set(
    fs.readdirSync(assetPoolDir).map((f) => f.toLowerCase())
  );

  // Parse CSV
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headerIdx = rows.findIndex((r) =>
    r.some((c) => normCell(c) === "Character")
  );

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
    scenarioTitle: colIndex("Scenario Title"),
    scenarioIntro: colIndex("Scenario Introduction (The Challenge)"),
    introVideoWebm: colIndexAny(header, [
      "Introductin Video (.webm)",
      "Introduction Video (.webm)",
    ]),
    introVideoMp4: colIndexAny(header, [
      "Introductin Video (.mp4)",
      "Introduction Video (.mp4)",
    ]),
    opt1Copy: colIndex("Option 1 Copy"),
    opt1Outcome: colIndex("Option 1 Outcome Text"),
    opt1VideoWebm: colIndexAny(header, [
      "Option 1 Video Asset (.webm)",
      "Option 1 Video (.webm)",
    ]),
    opt1VideoMp4: colIndexAny(header, [
      "Option 1 Video Asset (.mp4)",
      "Option 1 Video (.mp4)",
    ]),
    opt1Icon: colIndex("Option 1 icon"),
    opt2Copy: colIndex("Option 2 Copy"),
    opt2Outcome: colIndex("Option 2 Outcome Text"),
    opt2VideoWebm: colIndexAny(header, [
      "Option 2 Video (.webm)",
      "Option 2 Video Asset (.webm)",
    ]),
    opt2VideoMp4: colIndexAny(header, [
      "Option 2 Video  (.mp4)",
      "Option 2 Video (.mp4)",
    ]),
    opt2Icon: colIndex("Option 2 icon"),
    opt3Copy: colIndex("Option 3 Copy"),
    opt3Outcome: colIndex("Option 3 Outcome Text"),
    opt3VideoWebm: colIndexAny(header, [
      "Option 3 Video Asset (.webm)",
      "Option 3 Video (.webm)",
    ]),
    opt3VideoMp4: colIndexAny(header, [
      "Option 3 Video Asset (.mp4)",
      "Option 3 Video (.mp4)",
    ]),
    opt3Icon: colIndex("Option 3 icon"),
    correctOption: colIndex("Correct option"),
    correctPoints: colIndex("Correct option points (+)"),
    incorrectPoints: colIndex("Incorrect option points (-)"),
  };

  const charToIndex = { Stella: 0, Sidney: 1, Mo: 2, Ali: 3 };
  const indexToChar = { 0: "Stella", 1: "Sidney", 2: "Mo", 3: "Ali" };

  const files = [
    { charIndex: 0, file: "character_index_0_scenarios.ts", role: "CEO" },
    { charIndex: 1, file: "character_index_1_scenarios.ts", role: "CIO" },
    { charIndex: 2, file: "character_index_2_scenarios.ts", role: "CSCO" },
    { charIndex: 3, file: "character_index_3_scenarios.ts", role: "CFO" },
  ];

  console.log("═".repeat(70));
  console.log("TRIPLE CHECK: CSV vs APP vs ASSET POOL vs PUBLIC");
  console.log("═".repeat(70));
  console.log(`CSV:        ${csvPath}`);
  console.log(`Asset Pool: ${assetPoolDir}`);
  console.log(`Public:     ${publicVideoDir}`);
  console.log(`Scenarios:  ${scenarioDir}`);
  console.log("═".repeat(70));

  let totalCopyMismatches = 0;
  let totalVideoMismatches = 0;
  let totalMissingAssetPool = 0;
  let totalMissingPublic = 0;

  for (const f of files) {
    const tsPath = path.join(scenarioDir, f.file);
    const questions = extractFromScenarioTs(tsPath);
    const charName = indexToChar[f.charIndex];

    console.log(`\n${"▓".repeat(70)}`);
    console.log(`▓ ${charName} (${f.role}) - ${f.file}`);
    console.log(`${"▓".repeat(70)}`);

    for (const q of questions) {
      const scenarioNum = q.questionIndex + 1;

      // Find CSV row for this character + scenario
      const csvRow = rows.slice(headerIdx + 1).find((r) => {
        const char = normCell(r[COL.character]).replace(/\s+/g, "");
        const charIdx = charToIndex[char];
        if (charIdx !== f.charIndex) return false;
        const scenarioIdx = Number(normCell(r[COL.scenarioIndex]));
        return scenarioIdx === scenarioNum;
      });

      if (!csvRow) {
        console.log(`\n  ❌ Scenario ${scenarioNum}: NO CSV ROW FOUND`);
        continue;
      }

      console.log(`\n  ┌─ Scenario ${scenarioNum}: "${q.questionTitle}"`);

      const issues = [];

      // ===== CHECK TITLE =====
      const csvTitle = normalizeCopy(csvRow[COL.scenarioTitle]);
      if (
        normalizeForCompare(csvTitle) !== normalizeForCompare(q.questionTitle)
      ) {
        issues.push(`  │ ❌ TITLE MISMATCH`);
        issues.push(`  │    CSV: "${csvTitle}"`);
        issues.push(`  │    APP: "${q.questionTitle}"`);
        totalCopyMismatches++;
      }

      // ===== CHECK DESCRIPTION =====
      const csvDesc = normalizeCopy(csvRow[COL.scenarioIntro]);
      if (
        normalizeForCompare(csvDesc) !==
        normalizeForCompare(q.scenarioDescription)
      ) {
        issues.push(`  │ ❌ DESCRIPTION MISMATCH`);
        issues.push(`  │    CSV: "${csvDesc.substring(0, 60)}..."`);
        issues.push(
          `  │    APP: "${q.scenarioDescription.substring(0, 60)}..."`
        );
        totalCopyMismatches++;
      }

      // ===== CHECK INTRO VIDEO =====
      const csvIntroWebm = fileBasename(csvRow[COL.introVideoWebm]);
      const csvIntroMp4 = fileBasename(csvRow[COL.introVideoMp4]);
      const appIntroFile = path.basename(q.scenarioVideo);
      const appIntroBase = appIntroFile
        .replace(/\.(mp4|webm)$/i, "")
        .toLowerCase();

      // Determine expected base from CSV
      const csvIntroBase = (csvIntroMp4 || csvIntroWebm || "")
        .replace(/\.(mp4|webm)$/i, "")
        .toLowerCase();

      if (csvIntroBase && appIntroBase !== csvIntroBase) {
        issues.push(`  │ ❌ INTRO VIDEO FILENAME MISMATCH`);
        issues.push(`  │    CSV: "${csvIntroMp4 || csvIntroWebm}"`);
        issues.push(`  │    APP: "${appIntroFile}"`);
        totalVideoMismatches++;
      }

      // Check if intro video exists in asset pool
      if (csvIntroWebm && !assetPoolFiles.has(csvIntroWebm.toLowerCase())) {
        issues.push(
          `  │ ⚠️  Intro .webm missing in asset_pool: ${csvIntroWebm}`
        );
        totalMissingAssetPool++;
      }
      if (csvIntroMp4 && !assetPoolFiles.has(csvIntroMp4.toLowerCase())) {
        issues.push(`  │ ⚠️  Intro .mp4 missing in asset_pool: ${csvIntroMp4}`);
        totalMissingAssetPool++;
      }

      // Check if app-referenced intro exists in public
      const publicIntroDir = path.join(
        publicVideoDir,
        `character_${f.charIndex}_scenarios`,
        `scenario_${q.questionIndex}`
      );
      const appIntroMp4Path = path.join(publicIntroDir, appIntroFile);
      const appIntroWebmPath = path.join(
        publicIntroDir,
        appIntroFile.replace(/\.mp4$/i, ".webm")
      );

      if (!fs.existsSync(appIntroMp4Path)) {
        issues.push(`  │ 🚨 APP INTRO .mp4 MISSING IN PUBLIC: ${appIntroFile}`);
        totalMissingPublic++;
      }
      if (!fs.existsSync(appIntroWebmPath)) {
        issues.push(
          `  │ 🚨 APP INTRO .webm MISSING IN PUBLIC: ${appIntroFile.replace(/\.mp4$/i, ".webm")}`
        );
        totalMissingPublic++;
      }

      // ===== CHECK OPTIONS =====
      const correctOptions = parseCorrectOptions(csvRow[COL.correctOption]);
      const correctPoints = parsePercentInt(csvRow[COL.correctPoints]) ?? 0;
      const incorrectPoints = parsePercentInt(csvRow[COL.incorrectPoints]) ?? 0;

      const csvOptions = [
        {
          num: 1,
          copy: normalizeCopy(csvRow[COL.opt1Copy]),
          outcome: normalizeCopy(csvRow[COL.opt1Outcome]),
          videoWebm: fileBasename(csvRow[COL.opt1VideoWebm]),
          videoMp4: fileBasename(csvRow[COL.opt1VideoMp4]),
          icon: normCell(csvRow[COL.opt1Icon]).toLowerCase(),
        },
        {
          num: 2,
          copy: normalizeCopy(csvRow[COL.opt2Copy]),
          outcome: normalizeCopy(csvRow[COL.opt2Outcome]),
          videoWebm: fileBasename(csvRow[COL.opt2VideoWebm]),
          videoMp4: fileBasename(csvRow[COL.opt2VideoMp4]),
          icon: normCell(csvRow[COL.opt2Icon]).toLowerCase(),
        },
        {
          num: 3,
          copy: normalizeCopy(csvRow[COL.opt3Copy]),
          outcome: normalizeCopy(csvRow[COL.opt3Outcome]),
          videoWebm: fileBasename(csvRow[COL.opt3VideoWebm]),
          videoMp4: fileBasename(csvRow[COL.opt3VideoMp4]),
          icon: normCell(csvRow[COL.opt3Icon]).toLowerCase(),
        },
      ].filter((o) => o.copy);

      if (csvOptions.length !== q.actions.length) {
        issues.push(
          `  │ ❌ OPTION COUNT MISMATCH: CSV has ${csvOptions.length}, APP has ${q.actions.length}`
        );
        totalCopyMismatches++;
      }

      for (let i = 0; i < Math.min(csvOptions.length, q.actions.length); i++) {
        const csvOpt = csvOptions[i];
        const appOpt = q.actions[i];

        // Check option copy
        if (
          normalizeForCompare(csvOpt.copy) !==
          normalizeForCompare(appOpt.actionDescription)
        ) {
          issues.push(`  │ ❌ Option ${csvOpt.num} COPY MISMATCH`);
          issues.push(`  │    CSV: "${csvOpt.copy}"`);
          issues.push(`  │    APP: "${appOpt.actionDescription}"`);
          totalCopyMismatches++;
        }

        // Check outcome
        if (
          normalizeForCompare(csvOpt.outcome) !==
          normalizeForCompare(appOpt.postActionDescription)
        ) {
          issues.push(`  │ ❌ Option ${csvOpt.num} OUTCOME MISMATCH`);
          issues.push(`  │    CSV: "${csvOpt.outcome.substring(0, 50)}..."`);
          issues.push(
            `  │    APP: "${appOpt.postActionDescription.substring(0, 50)}..."`
          );
          totalCopyMismatches++;
        }

        // Check icon
        if (csvOpt.icon !== appOpt.icon.toLowerCase()) {
          issues.push(
            `  │ ❌ Option ${csvOpt.num} ICON MISMATCH: CSV="${csvOpt.icon}" APP="${appOpt.icon}"`
          );
          totalCopyMismatches++;
        }

        // Check scoring
        const shouldBeCorrect = correctOptions.includes(csvOpt.num);
        const expectedPoints = shouldBeCorrect
          ? correctPoints
          : -incorrectPoints;

        if (appOpt.isCorrectAnswer !== shouldBeCorrect) {
          issues.push(
            `  │ ❌ Option ${csvOpt.num} CORRECT MISMATCH: CSV=${shouldBeCorrect} APP=${appOpt.isCorrectAnswer}`
          );
          totalCopyMismatches++;
        }

        if (appOpt.pointsImpact !== expectedPoints) {
          issues.push(
            `  │ ❌ Option ${csvOpt.num} POINTS MISMATCH: CSV=${expectedPoints} APP=${appOpt.pointsImpact}`
          );
          totalCopyMismatches++;
        }

        // Check option video filename
        const appOptVideo = path.basename(appOpt.postActionVideo);
        const appOptVideoBase = appOptVideo
          .replace(/\.(mp4|webm)$/i, "")
          .toLowerCase();
        const csvOptVideoBase = (csvOpt.videoMp4 || csvOpt.videoWebm || "")
          .replace(/\.(mp4|webm)$/i, "")
          .toLowerCase();

        if (csvOptVideoBase && appOptVideoBase !== csvOptVideoBase) {
          issues.push(`  │ ❌ Option ${csvOpt.num} VIDEO FILENAME MISMATCH`);
          issues.push(`  │    CSV: "${csvOpt.videoMp4 || csvOpt.videoWebm}"`);
          issues.push(`  │    APP: "${appOptVideo}"`);
          totalVideoMismatches++;
        }

        // Check if option video exists in asset pool
        if (
          csvOpt.videoWebm &&
          !assetPoolFiles.has(csvOpt.videoWebm.toLowerCase())
        ) {
          issues.push(
            `  │ ⚠️  Option ${csvOpt.num} .webm missing in asset_pool: ${csvOpt.videoWebm}`
          );
          totalMissingAssetPool++;
        }
        if (
          csvOpt.videoMp4 &&
          !assetPoolFiles.has(csvOpt.videoMp4.toLowerCase())
        ) {
          issues.push(
            `  │ ⚠️  Option ${csvOpt.num} .mp4 missing in asset_pool: ${csvOpt.videoMp4}`
          );
          totalMissingAssetPool++;
        }

        // Check if app-referenced option video exists in public
        const publicOptDir = path.join(
          publicVideoDir,
          `character_${f.charIndex}_scenarios`,
          `scenario_${q.questionIndex}`,
          "post_action_vids"
        );
        const appOptMp4Path = path.join(publicOptDir, appOptVideo);
        const appOptWebmPath = path.join(
          publicOptDir,
          appOptVideo.replace(/\.mp4$/i, ".webm")
        );

        if (appOptVideo && !fs.existsSync(appOptMp4Path)) {
          issues.push(
            `  │ 🚨 Option ${csvOpt.num} APP .mp4 MISSING IN PUBLIC: ${appOptVideo}`
          );
          totalMissingPublic++;
        }
        if (appOptVideo && !fs.existsSync(appOptWebmPath)) {
          issues.push(
            `  │ 🚨 Option ${csvOpt.num} APP .webm MISSING IN PUBLIC: ${appOptVideo.replace(/\.mp4$/i, ".webm")}`
          );
          totalMissingPublic++;
        }
      }

      if (issues.length === 0) {
        console.log(`  │ ✅ All copy, scoring, and video references match CSV`);
      } else {
        issues.forEach((issue) => console.log(issue));
      }

      console.log(`  └${"─".repeat(66)}`);
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log("SUMMARY:");
  console.log("═".repeat(70));
  console.log(`❌ Copy/Scoring mismatches:     ${totalCopyMismatches}`);
  console.log(`❌ Video filename mismatches:   ${totalVideoMismatches}`);
  console.log(`⚠️  Missing in asset_pool:       ${totalMissingAssetPool}`);
  console.log(`🚨 Missing in public (CRITICAL): ${totalMissingPublic}`);
  console.log("═".repeat(70));

  if (totalCopyMismatches > 0 || totalVideoMismatches > 0) {
    console.log("\n🔴 RESULT: MISMATCHES FOUND - App does NOT match CSV");
    process.exit(1);
  } else if (totalMissingPublic > 0) {
    console.log(
      "\n🟡 RESULT: No mismatches, but some app-referenced files missing in public"
    );
    process.exit(1);
  } else {
    console.log("\n🟢 RESULT: All copy and video references match CSV");
  }
}

main();
