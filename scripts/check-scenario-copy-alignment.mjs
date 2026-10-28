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

function normalizeIconName(value) {
  const v = normCell(value);
  if (!v) return "";
  return v.trim().toLowerCase();
}

const JS_STRING = /"(?:\\.|[^"\\])*"/g;

function parseJsStringLiteral(litWithQuotes) {
  // litWithQuotes must be a JSON-compatible string literal.
  return JSON.parse(litWithQuotes);
}

function firstMatch(content, re) {
  const m = content.match(re);
  return m ? m[1] : null;
}

function extractQuestionsFromScenarioTs(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  const lines = content.split(/\r?\n/);

  /**
   * @type {Map<number, {questionTitle:string, scenarioDescription:string, actions:Array<{actionDescription:string, postActionDescription:string, icon:string, pointsImpact:number, isCorrectAnswer:boolean}>}>}
   */
  const byQuestionIndex = new Map();

  let currentQuestionIndex = null;
  /** @type {any} */
  let currentQuestion = null;
  let inActionChoices = false;
  /** @type {any} */
  let currentAction = null;

  function commitCurrentQuestion() {
    if (currentQuestion && typeof currentQuestionIndex === "number") {
      byQuestionIndex.set(currentQuestionIndex, currentQuestion);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qi = line.match(/questionIndex:\s*(\d+)/);
    if (qi) {
      // Starting a new question block; commit previous.
      commitCurrentQuestion();
      currentQuestionIndex = Number(qi[1]);
      currentQuestion = { questionTitle: "", scenarioDescription: "", actions: [] };
      inActionChoices = false;
      currentAction = null;
      continue;
    }

    if (!currentQuestion) continue;

    if (line.includes("questionTitle:")) {
      const m = line.match(/questionTitle:\s*("(?:(?:\\.|[^"\\])*)")/);
      if (m) currentQuestion.questionTitle = parseJsStringLiteral(m[1]);
      continue;
    }

    if (line.includes("scenarioDescription:")) {
      const m = line.match(/scenarioDescription:\s*("(?:(?:\\.|[^"\\])*)")/);
      if (m) currentQuestion.scenarioDescription = parseJsStringLiteral(m[1]);
      continue;
    }

    if (line.includes("actionChoices: [")) {
      inActionChoices = true;
      continue;
    }

    if (!inActionChoices) continue;

    if (line.trim() === "{") {
      currentAction = {
        actionDescription: "",
        postActionDescription: "",
        icon: "",
        pointsImpact: 0,
        isCorrectAnswer: false,
      };
      continue;
    }

    if (!currentAction) {
      if (line.trim() === "]," || line.trim() === "]") {
        inActionChoices = false;
      }
      continue;
    }

    if (line.includes("actionDescription:")) {
      const m = line.match(/actionDescription:\s*("(?:(?:\\.|[^"\\])*)")/);
      if (m) currentAction.actionDescription = parseJsStringLiteral(m[1]);
      continue;
    }

    if (line.includes("postActionDescription:")) {
      const m = line.match(/postActionDescription:\s*("(?:(?:\\.|[^"\\])*)")/);
      if (m) currentAction.postActionDescription = parseJsStringLiteral(m[1]);
      continue;
    }

    if (line.includes("icon:")) {
      const m = line.match(/icon:\s*("(?:(?:\\.|[^"\\])*)")/);
      if (m) currentAction.icon = parseJsStringLiteral(m[1]);
      continue;
    }

    if (line.includes("pointsImpact:")) {
      const m = line.match(/pointsImpact:\s*(-?\d+)/);
      if (m) currentAction.pointsImpact = Number(m[1]);
      continue;
    }

    if (line.includes("isCorrectAnswer:")) {
      const m = line.match(/isCorrectAnswer:\s*(true|false)/);
      if (m) currentAction.isCorrectAnswer = m[1] === "true";
      continue;
    }

    if (line.trim() === "}," || line.trim() === "}") {
      currentQuestion.actions.push(currentAction);
      currentAction = null;
      continue;
    }
  }

  commitCurrentQuestion();
  return byQuestionIndex;
}

function loadExpectedFromCsv(csvPath) {
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headerIdx = rows.findIndex((r) => r.some((c) => normCell(c) === "Character"));
  if (headerIdx === -1) {
    throw new Error("Could not locate header row in CSV.");
  }
  const header = rows[headerIdx].map((c) => normCell(c));
  const colIndex = (name) => header.indexOf(name);
  const COL = {
    character: colIndex("Character"),
    role: colIndex("Role"),
    scenarioIndex: colIndex("Scenario Index"),
    scenarioTitle: colIndex("Scenario Title"),
    scenarioIntro: colIndex("Scenario Introduction (The Challenge)"),
    opt1Copy: colIndex("Option 1 Copy"),
    opt1Outcome: colIndex("Option 1 Outcome Text"),
    opt1Icon: colIndex("Option 1 icon"),
    opt2Copy: colIndex("Option 2 Copy"),
    opt2Outcome: colIndex("Option 2 Outcome Text"),
    opt2Icon: colIndex("Option 2 icon"),
    opt3Copy: colIndex("Option 3 Copy"),
    opt3Outcome: colIndex("Option 3 Outcome Text"),
    opt3Icon: colIndex("Option 3 icon"),
    correctOption: colIndex("Correct option"),
    correctPoints: colIndex("Correct option points (+)"),
    incorrectPoints: colIndex("Incorrect option points (-)"),
  };
  for (const [k, v] of Object.entries(COL)) {
    if (v === -1) throw new Error(`Missing expected column: ${k}`);
  }

  const charToIndex = { Stella: 0, Sidney: 1, Mo: 2, Ali: 3 };

  /** @type {Record<number, Record<number, any>>} */
  const expected = {};

  for (const r of rows.slice(headerIdx + 1)) {
    const character = normCell(r[COL.character]).replace(/\s+/g, "");
    if (!character) continue;
    const charIndex = charToIndex[character];
    if (typeof charIndex !== "number") continue;

    const scenarioIndex = Number(normCell(r[COL.scenarioIndex]));
    if (!Number.isFinite(scenarioIndex) || scenarioIndex <= 0) continue;
    const questionIndex = scenarioIndex - 1;

    const correctOptions = parseCorrectOptions(r[COL.correctOption]);
    const correctPoints = parsePercentInt(r[COL.correctPoints]) ?? 0;
    const incorrectPoints = parsePercentInt(r[COL.incorrectPoints]) ?? 0;

    const mkAction = (optNum, copy, outcome, iconName) => {
      const actionDescription = normalizeCopy(copy);
      if (!actionDescription) return null;
      return {
        actionDescription,
        postActionDescription: normalizeCopy(outcome),
        icon: normalizeIconName(iconName),
        isCorrectAnswer: correctOptions.includes(optNum),
        pointsImpact: correctOptions.includes(optNum) ? correctPoints : -incorrectPoints,
      };
    };

    const questionTitle = normalizeCopy(r[COL.scenarioTitle]);
    const scenarioDescription = normalizeCopy(r[COL.scenarioIntro]);
    const actions = [
      mkAction(1, r[COL.opt1Copy], r[COL.opt1Outcome], r[COL.opt1Icon]),
      mkAction(2, r[COL.opt2Copy], r[COL.opt2Outcome], r[COL.opt2Icon]),
      mkAction(3, r[COL.opt3Copy], r[COL.opt3Outcome], r[COL.opt3Icon]),
    ].filter(Boolean);

    expected[charIndex] ??= {};
    expected[charIndex][questionIndex] = {
      role: normCell(r[COL.role]),
      questionIndex,
      questionTitle,
      scenarioDescription,
      actions,
    };
  }

  return expected;
}

function normForCompare(value) {
  return normalizeCopy(value)
    .replace(/[’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

function compare(csvExpected, actualByQuestion, label) {
  /** @type {string[]} */
  const problems = [];

  for (const [qi, exp] of Object.entries(csvExpected)) {
    const questionIndex = Number(qi);
    const actual = actualByQuestion.get(questionIndex);
    if (!actual) {
      problems.push(`${label} q${questionIndex}: missing question in app`);
      continue;
    }

    const expTitle = normForCompare(exp.questionTitle);
    const actTitle = normForCompare(actual.questionTitle);
    if (expTitle !== actTitle) {
      problems.push(
        `${label} q${questionIndex} questionTitle mismatch\n  CSV: ${JSON.stringify(exp.questionTitle)}\n  APP: ${JSON.stringify(actual.questionTitle)}`
      );
    }

    const expDesc = normForCompare(exp.scenarioDescription);
    const actDesc = normForCompare(actual.scenarioDescription);
    if (expDesc !== actDesc) {
      problems.push(
        `${label} q${questionIndex} scenarioDescription mismatch\n  CSV: ${JSON.stringify(exp.scenarioDescription)}\n  APP: ${JSON.stringify(actual.scenarioDescription)}`
      );
    }

    if (exp.actions.length !== actual.actions.length) {
      problems.push(
        `${label} q${questionIndex} actionChoices length mismatch (CSV ${exp.actions.length} vs APP ${actual.actions.length})`
      );
    }

    const n = Math.min(exp.actions.length, actual.actions.length);
    for (let i = 0; i < n; i++) {
      const e = exp.actions[i];
      const a = actual.actions[i];
      const prefix = `${label} q${questionIndex} option${i + 1}`;

      if (normForCompare(e.actionDescription) !== normForCompare(a.actionDescription)) {
        problems.push(
          `${prefix} actionDescription mismatch\n  CSV: ${JSON.stringify(e.actionDescription)}\n  APP: ${JSON.stringify(a.actionDescription)}`
        );
      }
      if (normForCompare(e.postActionDescription) !== normForCompare(a.postActionDescription)) {
        problems.push(
          `${prefix} outcome mismatch\n  CSV: ${JSON.stringify(e.postActionDescription)}\n  APP: ${JSON.stringify(a.postActionDescription)}`
        );
      }
      if (normalizeIconName(e.icon) !== normalizeIconName(a.icon)) {
        problems.push(
          `${prefix} icon mismatch\n  CSV: ${JSON.stringify(e.icon)}\n  APP: ${JSON.stringify(a.icon)}`
        );
      }
      if (e.isCorrectAnswer !== a.isCorrectAnswer) {
        problems.push(`${prefix} isCorrectAnswer mismatch (CSV ${e.isCorrectAnswer} vs APP ${a.isCorrectAnswer})`);
      }
      if (e.pointsImpact !== a.pointsImpact) {
        problems.push(`${prefix} pointsImpact mismatch (CSV ${e.pointsImpact} vs APP ${a.pointsImpact})`);
      }
    }
  }

  return problems;
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  if (!csvPath) {
    console.error('Usage: node scripts/check-scenario-copy-alignment.mjs "/path/to/file.csv"');
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");
  const files = [
    { charIndex: 0, label: "Stella (characterIndex0)", file: "character_index_0_scenarios.ts" },
    { charIndex: 1, label: "Sidney (characterIndex1)", file: "character_index_1_scenarios.ts" },
    { charIndex: 2, label: "Mo (characterIndex2)", file: "character_index_2_scenarios.ts" },
    { charIndex: 3, label: "Ali (characterIndex3)", file: "character_index_3_scenarios.ts" },
  ];

  const expected = loadExpectedFromCsv(csvPath);

  /** @type {string[]} */
  const allProblems = [];
  for (const f of files) {
    const tsPath = path.join(scenarioDir, f.file);
    const actual = extractQuestionsFromScenarioTs(tsPath);
    const expChar = expected[f.charIndex] ?? {};
    allProblems.push(...compare(expChar, actual, f.label));
  }

  if (!allProblems.length) {
    console.log("SCENARIO COPY ALIGNMENT: PASS");
    return;
  }

  console.error("SCENARIO COPY ALIGNMENT: FAIL");
  for (const p of allProblems) console.error(`- ${p}`);
  process.exit(1);
}

main();


