#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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
  return normalizeCopy(value)
    .replace(/[']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

function fileBasename(value) {
  const v = normCell(value);
  if (!v) return "";
  return path.basename(v);
}

function parsePercentInt(value) {
  const v = normCell(value);
  if (!v) return null;
  const num = Number(v.replace("%", "").trim());
  if (!Number.isFinite(num)) return null;
  return Math.trunc(num);
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

function colIndexAny(header, names) {
  for (const name of names) {
    const idx = header.indexOf(name);
    if (idx !== -1) return idx;
  }
  return -1;
}

function extractFromScenarioTs(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  
  // Use a more robust extraction that handles multi-line strings
  const questions = [];
  
  // Find all questions
  const questionMatches = content.matchAll(/questionIndex:\s*(\d+)[\s\S]*?(?=questionIndex:|questions:\s*\[|$)/g);
  
  for (const match of questionMatches) {
    const questionBlock = match[0];
    const questionIndex = Number(match[1]);
    
    // Extract fields with multi-line support
    const extractField = (fieldName) => {
      const regex = new RegExp(`${fieldName}:\\s*["'\`]([\\s\\S]*?)["'\`],?\\s*(?=\\w+:|\\})`);
      const m = questionBlock.match(regex);
      return m ? m[1] : "";
    };
    
    const question = {
      questionIndex,
      questionTitle: extractField("questionTitle"),
      scenarioDescription: extractField("scenarioDescription"),
      scenarioVideo: extractField("scenarioVideo"),
      actions: []
    };
    
    // Find action choices block
    const actionsMatch = questionBlock.match(/actionChoices:\s*\[([\s\S]*?)\],/);
    if (actionsMatch) {
      const actionsBlock = actionsMatch[1];
      
      // Find individual actions
      const actionMatches = actionsBlock.matchAll(/\{([\s\S]*?)\}/g);
      
      for (const actionMatch of actionMatches) {
        const actionBlock = actionMatch[1];
        
        const extractActionField = (fieldName) => {
          const regex = new RegExp(`${fieldName}:\\s*["'\`]([\\s\\S]*?)["'\`],?\\s*(?=\\w+:|$)`);
          const m = actionBlock.match(regex);
          return m ? m[1] : "";
        };
        
        const pointsMatch = actionBlock.match(/pointsImpact:\s*(-?\d+)/);
        const correctMatch = actionBlock.match(/isCorrectAnswer:\s*(true|false)/);
        
        question.actions.push({
          actionDescription: extractActionField("actionDescription"),
          postActionDescription: extractActionField("postActionDescription"),
          postActionVideo: extractActionField("postActionVideo"),
          icon: extractActionField("icon"),
          pointsImpact: pointsMatch ? Number(pointsMatch[1]) : 0,
          isCorrectAnswer: correctMatch ? correctMatch[1] === "true" : false
        });
      }
    }
    
    questions.push(question);
  }
  
  return questions;
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find(a => !a.startsWith("--"));
  
  if (!csvPath) {
    console.error('Usage: node scripts/validate-scenarios-vs-csv.mjs "/path/to/file.csv"');
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");
  const assetPoolDir = path.join(repoRoot, "asset_pool", "vid_pool", "scenarios");

  // Parse CSV
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headerIdx = rows.findIndex(r => r.some(c => normCell(c) === "Character"));
  
  if (headerIdx === -1) {
    console.error("Could not locate header row in CSV.");
    process.exit(2);
  }

  const header = rows[headerIdx].map(c => normCell(c));
  const colIndex = name => header.indexOf(name);
  
  const COL = {
    character: colIndex("Character"),
    role: colIndex("Role"),
    scenarioIndex: colIndex("Scenario Index"),
    scenarioTitle: colIndex("Scenario Title"),
    scenarioIntro: colIndex("Scenario Introduction (The Challenge)"),
    introVideoWebm: colIndexAny(header, ["Introductin Video (.webm)", "Introduction Video (.webm)"]),
    introVideoMp4: colIndexAny(header, ["Introductin Video (.mp4)", "Introduction Video (.mp4)"]),
    opt1Copy: colIndex("Option 1 Copy"),
    opt1Outcome: colIndex("Option 1 Outcome Text"),
    opt1VideoWebm: colIndexAny(header, ["Option 1 Video Asset (.webm)", "Option 1 Video (.webm)"]),
    opt1VideoMp4: colIndexAny(header, ["Option 1 Video Asset (.mp4)", "Option 1 Video (.mp4)"]),
    opt1Icon: colIndex("Option 1 icon"),
    opt2Copy: colIndex("Option 2 Copy"),
    opt2Outcome: colIndex("Option 2 Outcome Text"),
    opt2VideoWebm: colIndexAny(header, ["Option 2 Video (.webm)", "Option 2 Video Asset (.webm)"]),
    opt2VideoMp4: colIndexAny(header, ["Option 2 Video (.mp4)", "Option 2 Video Asset (.mp4)"]),
    opt2Icon: colIndex("Option 2 icon"),
    opt3Copy: colIndex("Option 3 Copy"),
    opt3Outcome: colIndex("Option 3 Outcome Text"),
    opt3VideoWebm: colIndexAny(header, ["Option 3 Video Asset (.webm)", "Option 3 Video (.webm)"]),
    opt3VideoMp4: colIndexAny(header, ["Option 3 Video Asset (.mp4)", "Option 3 Video (.mp4)"]),
    opt3Icon: colIndex("Option 3 icon"),
    correctOption: colIndex("Correct option"),
    correctPoints: colIndex("Correct option points (+)"),
    incorrectPoints: colIndex("Incorrect option points (-)"),
  };

  const charToIndex = { Stella: 0, Sidney: 1, Mo: 2, Ali: 3 };
  const indexToChar = { 0: "Stella", 1: "Sidney", 2: "Mo", 3: "Ali" };
  
  const files = [
    { charIndex: 0, file: "character_index_0_scenarios.ts" },
    { charIndex: 1, file: "character_index_1_scenarios.ts" },
    { charIndex: 2, file: "character_index_2_scenarios.ts" },
    { charIndex: 3, file: "character_index_3_scenarios.ts" },
  ];

  console.log("COMPREHENSIVE SCENARIO VALIDATION vs CSV:\n");

  let totalIssues = 0;
  
  for (const f of files) {
    const tsPath = path.join(scenarioDir, f.file);
    const questions = extractFromScenarioTs(tsPath);
    const charName = indexToChar[f.charIndex];
    
    console.log(`\n${charName} (${f.file}):`);
    console.log("─".repeat(50));
    
    let charIssues = 0;
    
    for (const q of questions) {
      // Find CSV row for this character + scenario
      const csvRow = rows.slice(headerIdx + 1).find(r => {
        const char = normCell(r[COL.character]).replace(/\s+/g, "");
        const charIdx = charToIndex[char];
        if (charIdx !== f.charIndex) return false;
        
        const scenarioIdx = Number(normCell(r[COL.scenarioIndex]));
        return scenarioIdx === q.questionIndex + 1; // CSV is 1-indexed
      });
      
      if (!csvRow) {
        console.log(`  ❌ Scenario ${q.questionIndex + 1}: No matching CSV row found`);
        charIssues++;
        totalIssues++;
        continue;
      }
      
      const issues = [];
      
      // Check title
      const csvTitle = normalizeCopy(csvRow[COL.scenarioTitle]);
      if (normalizeForCompare(csvTitle) !== normalizeForCompare(q.questionTitle)) {
        issues.push(`    Title mismatch: APP="${q.questionTitle}" vs CSV="${csvTitle}"`);
      }
      
      // Check description
      const csvDesc = normalizeCopy(csvRow[COL.scenarioIntro]);
      if (normalizeForCompare(csvDesc) !== normalizeForCompare(q.scenarioDescription)) {
        issues.push(`    Description mismatch: APP="${q.scenarioDescription.substring(0, 50)}..." vs CSV="${csvDesc.substring(0, 50)}..."`);
      }
      
      // Check intro video
      const csvIntroWebm = fileBasename(csvRow[COL.introVideoWebm]);
      const csvIntroMp4 = fileBasename(csvRow[COL.introVideoMp4]);
      const appIntroFile = path.basename(q.scenarioVideo);
      
      if (csvIntroMp4 || csvIntroWebm) {
        const csvIntroBase = (csvIntroMp4 || csvIntroWebm).replace(/\.(mp4|webm)$/i, "");
        const appIntroBase = appIntroFile.replace(/\.(mp4|webm)$/i, "");
        
        // Check if video exists in asset_pool
        const webmExists = csvIntroWebm && fs.existsSync(path.join(assetPoolDir, csvIntroWebm));
        const mp4Exists = csvIntroMp4 && fs.existsSync(path.join(assetPoolDir, csvIntroMp4));
        
        if (!webmExists && csvIntroWebm) {
          issues.push(`    Intro video missing in asset_pool: ${csvIntroWebm}`);
        }
        if (!mp4Exists && csvIntroMp4) {
          issues.push(`    Intro video missing in asset_pool: ${csvIntroMp4}`);
        }
      }
      
      // Check options
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
          icon: normCell(csvRow[COL.opt1Icon]).toLowerCase()
        },
        {
          num: 2,
          copy: normalizeCopy(csvRow[COL.opt2Copy]),
          outcome: normalizeCopy(csvRow[COL.opt2Outcome]),
          videoWebm: fileBasename(csvRow[COL.opt2VideoWebm]),
          videoMp4: fileBasename(csvRow[COL.opt2VideoMp4]),
          icon: normCell(csvRow[COL.opt2Icon]).toLowerCase()
        },
        {
          num: 3,
          copy: normalizeCopy(csvRow[COL.opt3Copy]),
          outcome: normalizeCopy(csvRow[COL.opt3Outcome]),
          videoWebm: fileBasename(csvRow[COL.opt3VideoWebm]),
          videoMp4: fileBasename(csvRow[COL.opt3VideoMp4]),
          icon: normCell(csvRow[COL.opt3Icon]).toLowerCase()
        }
      ].filter(o => o.copy); // Skip N/A options
      
      if (csvOptions.length !== q.actions.length) {
        issues.push(`    Option count mismatch: APP has ${q.actions.length}, CSV has ${csvOptions.length}`);
      }
      
      for (let i = 0; i < Math.min(csvOptions.length, q.actions.length); i++) {
        const csvOpt = csvOptions[i];
        const appOpt = q.actions[i];
        
        // Check option copy
        if (normalizeForCompare(csvOpt.copy) !== normalizeForCompare(appOpt.actionDescription)) {
          issues.push(`    Option ${csvOpt.num} copy mismatch: APP="${appOpt.actionDescription}" vs CSV="${csvOpt.copy}"`);
        }
        
        // Check outcome
        if (normalizeForCompare(csvOpt.outcome) !== normalizeForCompare(appOpt.postActionDescription)) {
          issues.push(`    Option ${csvOpt.num} outcome mismatch: APP="${appOpt.postActionDescription.substring(0, 50)}..." vs CSV="${csvOpt.outcome.substring(0, 50)}..."`);
        }
        
        // Check icon
        if (csvOpt.icon !== appOpt.icon.toLowerCase()) {
          issues.push(`    Option ${csvOpt.num} icon mismatch: APP="${appOpt.icon}" vs CSV="${csvOpt.icon}"`);
        }
        
        // Check scoring
        const shouldBeCorrect = correctOptions.includes(csvOpt.num);
        const expectedPoints = shouldBeCorrect ? correctPoints : -incorrectPoints;
        
        if (appOpt.isCorrectAnswer !== shouldBeCorrect) {
          issues.push(`    Option ${csvOpt.num} correctness mismatch: APP=${appOpt.isCorrectAnswer} vs CSV=${shouldBeCorrect}`);
        }
        
        if (appOpt.pointsImpact !== expectedPoints) {
          issues.push(`    Option ${csvOpt.num} points mismatch: APP=${appOpt.pointsImpact} vs CSV=${expectedPoints}`);
        }
        
        // Check video exists
        if (csvOpt.videoWebm && !fs.existsSync(path.join(assetPoolDir, csvOpt.videoWebm))) {
          issues.push(`    Option ${csvOpt.num} video missing in asset_pool: ${csvOpt.videoWebm}`);
        }
        if (csvOpt.videoMp4 && !fs.existsSync(path.join(assetPoolDir, csvOpt.videoMp4))) {
          issues.push(`    Option ${csvOpt.num} video missing in asset_pool: ${csvOpt.videoMp4}`);
        }
      }
      
      if (issues.length === 0) {
        console.log(`  ✅ Scenario ${q.questionIndex + 1}: "${q.questionTitle}" - All matches CSV`);
      } else {
        console.log(`  ⚠️  Scenario ${q.questionIndex + 1}: "${q.questionTitle}"`);
        issues.forEach(issue => console.log(issue));
        charIssues += issues.length;
        totalIssues += issues.length;
      }
    }
    
    if (charIssues === 0) {
      console.log(`  ✅ All scenarios match CSV perfectly`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  if (totalIssues === 0) {
    console.log("✅ VALIDATION COMPLETE: All scenario content matches CSV");
  } else {
    console.log(`⚠️  VALIDATION COMPLETE: Found ${totalIssues} issues`);
  }
}

main();
