import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const full = path.normalize(path.join(DIST, clean));
  if (!full.startsWith(DIST)) return null;
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    return clean.endsWith('/') ? path.join(full, 'index.html') : false;
  }
  return full;
}

http
  .createServer((req, res) => {
    const target = resolve(req.url);
    if (target === false) {
      res.writeHead(301, { Location: req.url.split('?')[0] + '/' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '') });
      return res.end();
    }
    if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream' });
      return fs.createReadStream(target).pipe(res);
    }
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
  })
  .listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}/`));
