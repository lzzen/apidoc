import { promises as fs } from 'node:fs';
import path from 'node:path';

const src = path.resolve('docs/.vitepress/dist');
const dest = path.resolve('out');

const INDEX_REDIRECT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Vopeni</title>
  <meta http-equiv="refresh" content="0;url=./gpt-image-2.html">
  <script>location.replace('./gpt-image-2.html')</script>
</head>
<body>
  <p>正在打开文档… <a href="./gpt-image-2.html">gpt-image-2</a></p>
</body>
</html>
`;

/** 去掉 VitePress SPA：子目录部署时客户端路由会 404，预渲染 HTML 已包含全文 */
function stripSpa(html) {
  return html
    .replace(/<script type="module" src="\.\/assets\/app\.[^"]+\.js"><\/script>\s*/g, '')
    .replace(/<link rel="modulepreload" href="\.\/assets\/[^"]+\.js">\s*/g, '')
    .replace(/<script>window\.__VP_HASH_MAP__[\s\S]*?<\/script>\s*/g, '')
    .replace(/<script id="check-dark-mode">[\s\S]*?<\/script>\s*/g, '')
    .replace(/<script id="check-mac-os">[\s\S]*?<\/script>\s*/g, '')
    .replace(/<html lang="zh-CN"/, '<html lang="zh-CN" class="light"');
}

/** 无 JS 时手动注入右侧目录（VitePress SSR 不填充 outline） */
function injectOutline(html) {
  const main = html.match(/class="vp-doc[^"]*"[\s\S]*?<div>([\s\S]*?)<\/div><\/div><\/main>/)?.[1] ?? '';
  const re = /<h([23]) id="([^"]*)"[^>]*>([^<]+)/g;
  const items = [];
  let m;
  while ((m = re.exec(main))) {
    items.push({ level: Number(m[1]), id: m[2], text: m[3].trim() });
  }
  if (!items.length) return html;

  const list = items
    .map(({ level, id, text }) => {
      const cls = level === 3 ? ' outline-item outline-3' : ' outline-item';
      return `<li class="${cls.trim()}"><a href="#${id}" class="outline-link">${text}</a></li>`;
    })
    .join('');

  return html.replace(
    /<ul class="VPDocOutlineItem root"[^>]*>[\s\S]*?<\/ul>/,
    `<ul class="VPDocOutlineItem root static-outline">${list}</ul>`,
  );
}

async function emptyDir(dir) {
  await fs.mkdir(dir, { recursive: true });
  for (const name of await fs.readdir(dir)) {
    await fs.rm(path.join(dir, name), { recursive: true, force: true });
  }
}

async function removeJsAssets(dir) {
  const assets = path.join(dir, 'assets');
  const chunks = path.join(assets, 'chunks');
  for (const sub of [chunks, assets]) {
    try {
      for (const name of await fs.readdir(sub)) {
        if (name.endsWith('.js')) await fs.rm(path.join(sub, name), { force: true });
      }
    } catch { /* ignore */ }
  }
  try {
    await fs.rmdir(chunks);
  } catch { /* ignore */ }
  await fs.rm(path.join(dir, 'hashmap.json'), { force: true });
}

await emptyDir(dest);
await fs.cp(src, dest, { recursive: true });

const docPage = path.join(dest, 'gpt-image-2.html');
let html = await fs.readFile(docPage, 'utf8');
html = injectOutline(stripSpa(html));
await fs.writeFile(docPage, html);

await fs.writeFile(path.join(dest, 'index.html'), INDEX_REDIRECT);
await fs.rm(path.join(dest, '404.html'), { force: true });
await removeJsAssets(dest);

const count = (await fs.readdir(dest, { recursive: true })).length;
console.log(`[copy-out] ${count} files → out/ (pure static, no SPA)`);
