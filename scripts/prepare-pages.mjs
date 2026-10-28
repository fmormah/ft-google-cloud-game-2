import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Next prefixes framework URLs; public media URLs also need the project prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (basePath && !/^\/[a-zA-Z0-9_-]+$/.test(basePath)) {
  throw new Error('NEXT_PUBLIC_BASE_PATH must be a single project path.');
}
const exportedFiles = (await readdir('out', { withFileTypes: true }))
  .filter(entry => entry.isFile()).map(entry => entry.name);
const publicEntries = [...new Set([...await readdir('public'), ...exportedFiles])];
const escapedEntries = publicEntries.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const assetPattern = new RegExp('(["\'`(])\\/(' + escapedEntries.join('|') + ')(?=[/"\'`)?#\\\\\\s])', 'g');
const textExtensions = new Set(['.html', '.js', '.css', '.json', '.txt', '.webmanifest']);
let changed = 0;
async function prepare(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await prepare(file);
    else if (basePath && textExtensions.has(path.extname(file))) {
      const original = await readFile(file, 'utf8');
      const updated = original.replace(assetPattern, (_, quote, asset) => `${quote}${basePath}/${asset}`);
      if (updated !== original) {
        await writeFile(file, updated);
        changed++;
      }
    }
  }
}
await prepare('out');
await writeFile('out/.nojekyll', '');
console.log(`Prepared GitHub Pages export: ${changed} files use ${basePath || '/'}.`);
