import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('prefixes local media while preserving external URLs, framework paths and escaped JSON', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pages-assets-'));
  const script = fileURLToPath(new URL('./prepare-pages.mjs', import.meta.url));
  try {
    await mkdir(path.join(directory, 'public/assets'), { recursive: true });
    await mkdir(path.join(directory, 'out'), { recursive: true });
    await writeFile(path.join(directory, 'public/favicon.ico'), '');
    const input = String.raw`<img src="/assets/photo.png"><script>let clip="/assets/video.mp4";let payload="{\"src\":\"/assets/icon.svg\"}";</script><style>.a{background:url(/assets/bg.webp)}</style><link href="/favicon.ico"><img src="https://example.com/assets/photo.png"><script src="/demo/_next/app.js"></script>`;
    await writeFile(path.join(directory, 'out/index.html'), input);
    execFileSync(process.execPath, [script], { cwd: directory, env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/demo' } });
    const output = await readFile(path.join(directory, 'out/index.html'), 'utf8');
    assert.ok(output.includes('src="/demo/assets/photo.png"'));
    assert.ok(output.includes('clip="/demo/assets/video.mp4"'));
    assert.ok(output.includes(String.raw`\"/demo/assets/icon.svg\"`));
    assert.ok(output.includes('url(/demo/assets/bg.webp)'));
    assert.ok(output.includes('href="/demo/favicon.ico"'));
    assert.ok(output.includes('https://example.com/assets/photo.png'));
    assert.ok(output.includes('src="/demo/_next/app.js"'));
    assert.equal(await readFile(path.join(directory, 'out/.nojekyll'), 'utf8'), '');
    execFileSync(process.execPath, [script], { cwd: directory, env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/demo' } });
    assert.equal(await readFile(path.join(directory, 'out/index.html'), 'utf8'), output);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
