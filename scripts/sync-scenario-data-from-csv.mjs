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

function normalizeCopy(value) {
  const v = normCell(value);
  if (!v) return "";
  return v.replace(/\s+/g, " ").trim();
}

function fileBasename(value) {
  const v = normCell(value);
  if (!v) return "";
  return path.basename(v);
}

function sanitizeBaseName(fileName) {
  const base = fileName.replace(/\.[^.]+$/, "");
  return base
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .replace(/__+/g, "_")
    .replace(/_+$/g, "");
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
  // e.g. "Option 1" or "Option 1, Option 2"
  return v
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const m = s.match(/Option\s*(\d+)/i);
      return m ? Number(m[1]) : null;
    })
    .filter((n) => typeof n === "number" && Number.isFinite(n));
}

function normalizeIconName(value) {
  const v = normCell(value);
  if (!v) return "";
  return v.trim().toLowerCase();
}

function extractExistingPostActionTitles(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  const lines = content.split(/\r?\n/);
  /** @type {Map<number, string[]>} */
  const byQuestion = new Map();
  let currentQuestionIndex = null;
  for (const line of lines) {
    const qIdx = line.match(/questionIndex:\s*(\d+)/);
    if (qIdx) currentQuestionIndex = Number(qIdx[1]);

    const titleMatch = line.match(/postActionTitle:\s*"([^"]*)"/);
    if (titleMatch && typeof currentQuestionIndex === "number") {
      const arr = byQuestion.get(currentQuestionIndex) ?? [];
      arr.push(titleMatch[1]);
      byQuestion.set(currentQuestionIndex, arr);
    }
  }
  return byQuestion;
}

function buildScenarioSetTs(params) {
  const { exportName, characterIndex, jobTitle, questions } = params;

  const qBlocks = questions
    .map((q) => {
      const actionBlocks = q.actionChoices
        .map((a) => {
          return `        {
          actionDescription: ${JSON.stringify(a.actionDescription)},
          pointsImpact: ${a.pointsImpact},
          icon: ${JSON.stringify(a.icon)},
          isCorrectAnswer: ${a.isCorrectAnswer},
          postActionTitle: ${JSON.stringify(a.postActionTitle)},
          postActionDescription: ${JSON.stringify(a.postActionDescription)},
          postActionVideo: ${JSON.stringify(a.postActionVideo)},
        },`;
        })
        .join("\n");

      return `    {
      questionIndex: ${q.questionIndex},
      questionTitle: ${JSON.stringify(q.questionTitle)},
      questionEyebrow: "Scenario",
      scenarioDescription: ${JSON.stringify(q.scenarioDescription)},
      scenarioVideo: ${JSON.stringify(q.scenarioVideo)},
      actionChoices: [
${actionBlocks}
      ],
    },`;
    })
    .join("\n");

  return `import type { CharacterScenarioSet } from "@/types/game";

export const ${exportName}: CharacterScenarioSet = {
  characterIndex: ${characterIndex},
  jobTitle: ${JSON.stringify(jobTitle)},
  questions: [
${qBlocks}
  ],
};
`;
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  if (!csvPath) {
    console.error(
      'Usage: node scripts/sync-scenario-data-from-csv.mjs "/path/to/file.csv"'
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");

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
    scenarioTitle: colIndex("Scenario Title"),
    scenarioIntro: colIndex("Scenario Introduction (The Challenge)"),
    introVideo: colIndexAny(header, ["Introductin Video (.webm)", "Introduction Video (.webm)"]),
    opt1Copy: colIndex("Option 1 Copy"),
    opt1Outcome: colIndex("Option 1 Outcome Text"),
    opt1Video: colIndexAny(header, ["Option 1 Video Asset (.webm)", "Option 1 Video (.webm)"]),
    opt1Icon: colIndex("Option 1 icon"),
    opt2Copy: colIndex("Option 2 Copy"),
    opt2Outcome: colIndex("Option 2 Outcome Text"),
    opt2Video: colIndexAny(header, ["Option 2 Video (.webm)", "Option 2 Video Asset (.webm)", "Option 2 Video Asset Path"]),
    opt2Icon: colIndex("Option 2 icon"),
    opt3Copy: colIndex("Option 3 Copy"),
    opt3Outcome: colIndex("Option 3 Outcome Text"),
    opt3Video: colIndexAny(header, ["Option 3 Video Asset (.webm)", "Option 3 Video (.webm)"]),
    opt3Icon: colIndex("Option 3 icon"),
    correctOption: colIndex("Correct option"),
    correctPoints: colIndex("Correct option points (+)"),
    incorrectPoints: colIndex("Incorrect option points (-)"),
  };
  for (const [k, v] of Object.entries(COL)) {
    if (v === -1) {
      console.error(`Missing expected column: ${k}`);
      process.exit(2);
    }
  }

  const charToIndex = { Stella: 0, Sidney: 1, Mo: 2, Ali: 3 };

  /** @type {Record<number, Record<number, any>>} */
  const byCharAndQ = {};

  for (const r of rows.slice(headerIdx + 1)) {
    const character = normCell(r[COL.character]).replace(/\s+/g, "");
    if (!character) continue;
    const charIndex = charToIndex[character];
    if (typeof charIndex !== "number") continue;

    const scenarioIndex = Number(normCell(r[COL.scenarioIndex]));
    if (!Number.isFinite(scenarioIndex) || scenarioIndex <= 0) continue;
    const questionIndex = scenarioIndex - 1;

    const introWebm = fileBasename(r[COL.introVideo]);
    const introBase = introWebm ? sanitizeBaseName(introWebm) : "";

    const opt1Webm = fileBasename(r[COL.opt1Video]);
    const opt2Webm = fileBasename(r[COL.opt2Video]);
    const opt3Webm = fileBasename(r[COL.opt3Video]);

    const correctOptions = parseCorrectOptions(r[COL.correctOption]);
    const correctPoints = parsePercentInt(r[COL.correctPoints]) ?? 0;
    const incorrectPoints = parsePercentInt(r[COL.incorrectPoints]) ?? 0;

    const mkAction = (optNum, copy, outcome, webmName, iconName, existingTitle) => {
      const safeBase = webmName ? sanitizeBaseName(webmName) : "";
      return {
        actionDescription: normalizeCopy(copy),
        postActionDescription: normalizeCopy(outcome),
        icon: normalizeIconName(iconName),
        isCorrectAnswer: correctOptions.includes(optNum),
        pointsImpact: correctOptions.includes(optNum) ? correctPoints : -incorrectPoints,
        postActionTitle: existingTitle ?? "Outcome",
        postActionVideo: safeBase
          ? `public/assets/video/scene_videos/character_${charIndex}_scenarios/scenario_${questionIndex}/post_action_vids/${safeBase}.mp4`
          : "",
      };
    };

    const jobTitle = normCell(r[COL.role]);
    const questionTitle = normalizeCopy(r[COL.scenarioTitle]);
    const scenarioDescription = normalizeCopy(r[COL.scenarioIntro]);

    byCharAndQ[charIndex] ??= {};
    byCharAndQ[charIndex][questionIndex] = {
      jobTitle,
      questionIndex,
      questionTitle,
      scenarioDescription,
      scenarioVideo: introBase
        ? `public/assets/video/scene_videos/character_${charIndex}_scenarios/scenario_${questionIndex}/${introBase}.mp4`
        : "",
      opt: {
        1: {
          copy: r[COL.opt1Copy],
          outcome: r[COL.opt1Outcome],
          webm: opt1Webm,
          icon: r[COL.opt1Icon],
        },
        2: {
          copy: r[COL.opt2Copy],
          outcome: r[COL.opt2Outcome],
          webm: opt2Webm,
          icon: r[COL.opt2Icon],
        },
        3: {
          copy: r[COL.opt3Copy],
          outcome: r[COL.opt3Outcome],
          webm: opt3Webm,
          icon: r[COL.opt3Icon],
        },
      },
      mkAction,
    };
  }

  const files = [
    {
      file: path.join(scenarioDir, "character_index_0_scenarios.ts"),
      exportName: "characterIndex0Scenarios",
      characterIndex: 0,
    },
    {
      file: path.join(scenarioDir, "character_index_1_scenarios.ts"),
      exportName: "characterIndex1Scenarios",
      characterIndex: 1,
    },
    {
      file: path.join(scenarioDir, "character_index_2_scenarios.ts"),
      exportName: "characterIndex2Scenarios",
      characterIndex: 2,
    },
    {
      file: path.join(scenarioDir, "character_index_3_scenarios.ts"),
      exportName: "characterIndex3Scenarios",
      characterIndex: 3,
    },
  ];

  for (const f of files) {
    const existingTitles = extractExistingPostActionTitles(f.file);

    const questionsForChar = byCharAndQ[f.characterIndex];
    if (!questionsForChar) {
      console.warn(`No CSV rows found for characterIndex=${f.characterIndex}; skipping ${f.file}`);
      continue;
    }

    const questionIndices = Object.keys(questionsForChar)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);

    const jobTitle = questionsForChar[questionIndices[0]]?.jobTitle ?? "";

    const questions = questionIndices.map((qi) => {
      const q = questionsForChar[qi];
      const titles = existingTitles.get(qi) ?? [];
      /** @type {any[]} */
      const actionChoices = [];
      for (const optNum of [1, 2, 3]) {
        const opt = q.opt[optNum];
        const copy = normalizeCopy(opt.copy);
        if (!copy) continue; // omit N/A options
        actionChoices.push(
          q.mkAction(
            optNum,
            opt.copy,
            opt.outcome,
            opt.webm,
            opt.icon,
            titles[actionChoices.length]
          )
        );
      }
      return {
        questionIndex: qi,
        questionTitle: q.questionTitle,
        scenarioDescription: q.scenarioDescription,
        scenarioVideo: q.scenarioVideo,
        actionChoices,
      };
    });

    const out = buildScenarioSetTs({
      exportName: f.exportName,
      characterIndex: f.characterIndex,
      jobTitle,
      questions,
    });

    fs.writeFileSync(f.file, out, "utf8");
  }
}

main();



