// Serve the exact static export at its production project path for browser tests.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('out');
const prefix = '/ft-google-cloud-game-2/';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
    let file = path.resolve(root, pathname.slice(prefix.length));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const info = await stat(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': info.size });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
}).listen(4173, '127.0.0.1');
