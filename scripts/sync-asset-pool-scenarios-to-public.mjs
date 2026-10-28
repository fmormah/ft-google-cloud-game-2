import fs from "node:fs";
import path from "node:path";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function walkFiles(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");

  const repoRoot = process.cwd();
  const sourceDir = path.join(repoRoot, "asset_pool", "vid_pool", "scenarios");
  const destRoot = path.join(repoRoot, "public", "assets", "video", "scene_videos");

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source not found: ${sourceDir}`);
    process.exit(2);
  }
  if (!fs.existsSync(destRoot)) {
    console.error(`Destination not found: ${destRoot}`);
    process.exit(2);
  }

  const sourceFiles = fs
    .readdirSync(sourceDir)
    .filter((f) => fs.statSync(path.join(sourceDir, f)).isFile())
    .map((f) => path.join(sourceDir, f));

  const destFiles = walkFiles(destRoot);

  /** @type {Map<string, string[]>} */
  const destByBasenameLower = new Map();
  for (const abs of destFiles) {
    const baseLower = path.basename(abs).toLowerCase();
    const arr = destByBasenameLower.get(baseLower) ?? [];
    arr.push(abs);
    destByBasenameLower.set(baseLower, arr);
  }

  let considered = 0;
  let matched = 0;
  let overwritten = 0;
  let created = 0;
  let skippedNoMatch = 0;

  /** @type {string[]} */
  const noMatch = [];
  /** @type {string[]} */
  const multiMatch = [];

  for (const srcAbs of sourceFiles) {
    considered++;
    const base = path.basename(srcAbs);
    const destList = destByBasenameLower.get(base.toLowerCase());
    if (!destList || destList.length === 0) {
      skippedNoMatch++;
      if (verbose) noMatch.push(base);
      continue;
    }
    matched++;
    if (destList.length > 1) multiMatch.push(base);

    for (const destAbs of destList) {
      const existed = fs.existsSync(destAbs);
      ensureDir(path.dirname(destAbs));
      if (!isDryRun) {
        fs.copyFileSync(srcAbs, destAbs);
      }
      if (existed) overwritten++;
      else created++;
      if (verbose) {
        const rel = path.relative(repoRoot, destAbs);
        console.log(`${existed ? "OVERWRITE" : "CREATE"} ${rel} <- ${base}`);
      }
    }
  }

  console.log("ASSET POOL SCENARIO SYNC:");
  console.log(`- Source dir: ${sourceDir}`);
  console.log(`- Dest root:  ${destRoot}`);
  console.log(`- Mode:       ${isDryRun ? "dry-run" : "copy"}`);
  console.log(`- Considered:  ${considered} files in asset_pool`);
  console.log(`- Matched:     ${matched} files had at least one destination match`);
  console.log(`- Overwritten: ${overwritten} destination files updated`);
  console.log(`- Created:     ${created} new destination files created`);
  console.log(`- Skipped:     ${skippedNoMatch} source files had no matching destination`);

  if (multiMatch.length) {
    console.log(`- Note: ${multiMatch.length} source files matched multiple destination paths (by basename).`);
    if (verbose) {
      console.log("MULTI-MATCH BASENAMES:");
      for (const b of multiMatch.sort((a, b) => a.localeCompare(b))) console.log(`- ${b}`);
    }
  }

  if (verbose && noMatch.length) {
    console.log("NO DESTINATION MATCH (by basename):");
    for (const b of noMatch.sort((a, b) => a.localeCompare(b))) console.log(`- ${b}`);
  }
}

main();


