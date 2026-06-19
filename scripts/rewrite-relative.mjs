/**
 * 将 out/ 中的绝对路径改为相对路径，上传到任意子目录即可运行。
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), process.argv[2] ?? 'out');

const SKIP = ['http://', 'https://', '//', 'data:', 'mailto:', '#'];

function shouldRewrite(url) {
  const base = url.split('?')[0].split('#')[0];
  return base.startsWith('/') && !SKIP.some((p) => base.startsWith(p));
}

function toRelative(filePath, absoluteUrl) {
  const [clean, ...rest] = absoluteUrl.split(/(?=[?#])/);
  const target = clean.replace(/^\//, '');
  const fromDir = path.dirname(filePath);
  const toPath = path.join(OUT_DIR, target);
  let rel = path.relative(fromDir, toPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel + rest.join('');
}

function rewriteContent(filePath, content) {
  return content.replace(
    /((?:href|src|action)=["'])(\/[^"']*)(["'])/g,
    (match, pre, url, post) => {
      if (!shouldRewrite(url)) return match;
      return `${pre}${toRelative(filePath, url)}${post}`;
    },
  );
}

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (!/\.(html|js|txt|css)$/i.test(entry.name)) continue;
    const original = await fs.readFile(fullPath, 'utf8');
    const rewritten = rewriteContent(fullPath, original);
    if (rewritten !== original) await fs.writeFile(fullPath, rewritten);
  }
}

await walk(OUT_DIR);
console.log('[rewrite-relative] done');
