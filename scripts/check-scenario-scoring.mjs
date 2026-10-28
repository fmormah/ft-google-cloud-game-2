import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");

const scenarioFiles = [
  "character_index_0_scenarios.ts",
  "character_index_1_scenarios.ts",
  "character_index_2_scenarios.ts",
  "character_index_3_scenarios.ts",
].map((f) => path.join(scenarioDir, f));

function parseScenarioFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  let currentQuestionTitle = null;
  let currentQuestionIndex = null;
  let inAction = false;
  let currentAction = null;

  /** @type {Array<{file:string, questionIndex:number|null, questionTitle:string|null, actionDescription?:string|null, pointsImpact?:number|null, isCorrectAnswer?:boolean|null, line:number}>} */
  const actions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const titleMatch = line.match(/questionTitle:\s*"([^"]+)"/);
    if (titleMatch) {
      currentQuestionTitle = titleMatch[1];
    }
    const idxMatch = line.match(/questionIndex:\s*(\d+)/);
    if (idxMatch) {
      currentQuestionIndex = Number(idxMatch[1]);
    }

    // Action object begins with "{"
    if (line.trim() === "{") {
      // Heuristic: only treat as action if we have seen actionChoices opening recently.
      // We'll detect action fields below and only commit if we see pointsImpact/isCorrectAnswer.
      inAction = true;
      currentAction = {
        file: path.basename(filePath),
        questionIndex: currentQuestionIndex,
        questionTitle: currentQuestionTitle,
        actionDescription: null,
        pointsImpact: null,
        isCorrectAnswer: null,
        line: i + 1,
      };
      continue;
    }

    if (inAction && currentAction) {
      const descMatch = line.match(/actionDescription:\s*(?:"([^"]*)"|`([^`]*)`)/);
      if (descMatch) {
        currentAction.actionDescription = descMatch[1] ?? descMatch[2] ?? null;
      }

      const pointsMatch = line.match(/pointsImpact:\s*(-?\d+)/);
      if (pointsMatch) {
        currentAction.pointsImpact = Number(pointsMatch[1]);
      }

      const correctMatch = line.match(/isCorrectAnswer:\s*(true|false)/);
      if (correctMatch) {
        currentAction.isCorrectAnswer = correctMatch[1] === "true";
      }

      // Close of object
      if (line.trim() === "}," || line.trim() === "}") {
        // Only keep entries that look like ScenarioAction objects
        if (
          currentAction.pointsImpact !== null &&
          typeof currentAction.isCorrectAnswer === "boolean"
        ) {
          actions.push(currentAction);
        }
        inAction = false;
        currentAction = null;
      }
    }
  }

  return actions;
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

const allActions = scenarioFiles.flatMap(parseScenarioFile);

/** @type {Map<string, {file:string, questionIndex:number|null, questionTitle:string|null, actions:any[]}>} */
const byQuestion = new Map();
for (const a of allActions) {
  const key = `${a.file}:${a.questionIndex}:${a.questionTitle}`;
  const entry = byQuestion.get(key) ?? {
    file: a.file,
    questionIndex: a.questionIndex,
    questionTitle: a.questionTitle,
    actions: [],
  };
  entry.actions.push(a);
  byQuestion.set(key, entry);
}

const EXPECT_TWO_CORRECT_TITLES = new Set([
  "Fleet Optimisation",
  "Energy Efficiency",
]);

/** @type {string[]} */
const problems = [];

for (const q of byQuestion.values()) {
  const correct = q.actions.filter((a) => a.isCorrectAnswer);
  const incorrect = q.actions.filter((a) => !a.isCorrectAnswer);

  const expectedCorrectCount = EXPECT_TWO_CORRECT_TITLES.has(q.questionTitle)
    ? 2
    : 1;

  if (correct.length !== expectedCorrectCount) {
    problems.push(
      `${q.file} q${q.questionIndex} "${q.questionTitle}": expected ${expectedCorrectCount} correct options, found ${correct.length}`
    );
  }

  for (const a of correct) {
    if (![15, 25].includes(a.pointsImpact)) {
      problems.push(
        `${q.file} q${q.questionIndex} "${q.questionTitle}": correct option has pointsImpact=${a.pointsImpact} (expected 15 or 25)`
      );
    }
  }
  for (const a of incorrect) {
    if (a.pointsImpact !== -10) {
      problems.push(
        `${q.file} q${q.questionIndex} "${q.questionTitle}": incorrect option has pointsImpact=${a.pointsImpact} (expected -10)`
      );
    }
  }

  // Extra rule from your note: for the two "two-correct" scenarios, correct points must be +25 (not +15).
  if (EXPECT_TWO_CORRECT_TITLES.has(q.questionTitle)) {
    for (const a of correct) {
      if (a.pointsImpact !== 25) {
        problems.push(
          `${q.file} q${q.questionIndex} "${q.questionTitle}": correct option has pointsImpact=${a.pointsImpact} (expected 25)`
        );
      }
    }
  }
}

if (problems.length) {
  console.error("SCENARIO SCORING CHECK: FAIL");
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}

console.log("SCENARIO SCORING CHECK: PASS");
console.log(
  `Checked ${byQuestion.size} questions across ${scenarioFiles.length} scenario files.`
);

