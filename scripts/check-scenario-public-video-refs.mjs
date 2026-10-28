import fs from "node:fs";
import path from "node:path";

function readAllScenarioTs(repoRoot) {
  const scenarioDir = path.join(repoRoot, "src", "data", "scenarios");
  const files = fs
    .readdirSync(scenarioDir)
    .filter((f) => f.endsWith("_scenarios.ts"))
    .map((f) => path.join(scenarioDir, f));
  return files;
}

function extractVideoRefsFromScenarioTs(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  const lines = content.split(/\r?\n/);

  /** @type {Array<{file:string, line:number, kind:"scenarioVideo"|"postActionVideo", src:string}>} */
  const refs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/\b(scenarioVideo|postActionVideo):\s*("(?:(?:\\.|[^"\\])*)")/);
    if (!m) continue;
    const kind = /** @type {"scenarioVideo"|"postActionVideo"} */ (m[1]);
    const src = JSON.parse(m[2]);
    refs.push({ file: path.basename(tsFilePath), line: i + 1, kind, src });
  }
  return refs;
}

function swapExt(src, ext) {
  if (ext === ".mp4") return src.replace(/\.webm$/i, ".mp4");
  if (ext === ".webm") return src.replace(/\.mp4$/i, ".webm");
  return src;
}

function main() {
  const repoRoot = process.cwd();
  const publicRoot = path.join(repoRoot, "public");

  const scenarioFiles = readAllScenarioTs(repoRoot);
  const refs = scenarioFiles.flatMap(extractVideoRefsFromScenarioTs);

  /** @type {Array<{ref:any, missingPath:string}>} */
  const missing = [];
  let checked = 0;

  for (const ref of refs) {
    if (!ref.src.startsWith("public/")) continue;
    // The TS stores paths prefixed with "public/..." but those files live under repoRoot/public/...
    const relFromPublic = ref.src.replace(/^public\//, "");
    const absMp4 = path.join(publicRoot, relFromPublic);
    const absWebm = path.join(publicRoot, swapExt(relFromPublic, ".webm"));

    checked++;
    if (!fs.existsSync(absMp4)) {
      missing.push({ ref, missingPath: path.join("public", relFromPublic) });
    }
    // If it looks like an mp4/webm file, also require the paired variant for mobile/desktop swapping.
    if (/\.(mp4|webm)$/i.test(relFromPublic) && !fs.existsSync(absWebm)) {
      missing.push({ ref, missingPath: path.join("public", swapExt(relFromPublic, ".webm")) });
    }
  }

  if (!missing.length) {
    console.log("SCENARIO PUBLIC VIDEO REFS: PASS");
    console.log(`Checked ${checked} scenario/post-action video refs`);
    return;
  }

  console.error("SCENARIO PUBLIC VIDEO REFS: FAIL");
  console.error(`Missing ${missing.length} files referenced by scenario TS data`);
  for (const m of missing) {
    console.error(
      `- ${m.missingPath} (from ${m.ref.file}:${m.ref.line} ${m.ref.kind})`
    );
  }
  process.exit(1);
}

main();


