# 使用与部署

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:5173/gpt-image-2.html、http://localhost:5173/async-image.html 或 http://localhost:5173/seedance.html（端口占用时看终端提示）

`npm run dev` 与 `npm run build` 共用同一套主题（`docs/.vitepress/theme/`），侧栏 Vopeni、收起按钮、右侧目录在开发时即可预览。

## 构建

```bash
npm run build
```

产物在 `out/` 目录，**纯静态 HTML**（无 JavaScript 路由），上传到站点任意子目录即可。

```
abc.com/docs/index.html          ← 自动跳到 gpt-image-2.html
abc.com/docs/gpt-image-2.html    ← 同步生图文档
abc.com/docs/async-image.html    ← 异步生图文档
abc.com/docs/seedance.html       ← Seedance 视频与素材库
abc.com/docs/assets/...          ← 样式与字体
```

**为什么去掉 SPA？** VitePress 的客户端路由在子目录（如 `/docs/`）下会解析失败，页面加载后变成 404。构建时已去掉 JS，只保留预渲染好的 HTML + CSS，放哪都能用。

## 编辑

| 操作 | 文件 |
| --- | --- |
| 改正文 | `docs/gpt-image-2.md`、`docs/async-image.md`、`docs/seedance.md`（标准 Markdown） |
| 改侧栏 | `docs/.vitepress/config.mts` |
| 改品牌/API 地址 | `lib/site.config.ts` |

## 技术栈

VitePress — 专为 Markdown 文档设计，构建产物干净，无 Next.js 那堆 `.txt` 垃圾文件。
