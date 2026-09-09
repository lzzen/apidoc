# 使用与部署

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:5173/gpt-image-2.html、http://localhost:5173/gpt-image-2.5.html、http://localhost:5173/gemini-image.html、http://localhost:5173/async-image.html 或 http://localhost:5173/imgtools.html（端口占用时看终端提示）。`seedance.html` 尚未正式上线，默认不在侧栏展示。

`npm run dev` 与 `npm run build` 共用同一套主题（`docs/.vitepress/theme/`），侧栏 Vopeni、收起按钮、右侧目录在开发时即可预览。

## 构建

双击或在项目根目录执行：

```bat
build.bat
```

脚本会强制 UTF-8 代码页、检查 `docs/*.md` 编码、执行 `npm run build`，并校验 `out/*.html` 中文是否正常。

也可手动：

```bash
npm run build
```

产物在 `out/` 目录，**纯静态 HTML**（无 JavaScript 路由），上传到站点任意子目录即可。

```
abc.com/docs/index.html          ← 自动跳到 gpt-image-2.html
abc.com/docs/gpt-image-2.html    ← GPT 同步生图文档
abc.com/docs/gpt-image-2.5.html  ← GPT Image 2.5（参数同 gpt-image-2）
abc.com/docs/gemini-image.html   ← Gemini 同步生图文档
abc.com/docs/async-image.html    ← 异步生图文档
abc.com/docs/imgtools.html       ← ImgTools 图像工具文档
abc.com/docs/assets/...          ← 样式与字体
（seedance.html 尚未正式上线，侧栏隐藏；源文件仍为 docs/seedance.md）
```

**为什么去掉 SPA？** VitePress 的客户端路由在子目录（如 `/docs/`）下会解析失败，页面加载后变成 404。构建时已去掉 JS，只保留预渲染好的 HTML + CSS，放哪都能用。

## 编辑

| 操作 | 文件 |
| --- | --- |
| 改正文 | `docs/gpt-image-2.md`、`docs/gpt-image-2.5.md`、`docs/gemini-image.md`、`docs/async-image.md`、`docs/imgtools.md`、`docs/seedance.md`（标准 Markdown） |
| 改侧栏 | `docs/.vitepress/config.mts` |
| 改品牌/API 地址 | `lib/site.config.ts` |

## 技术栈

VitePress — 专为 Markdown 文档设计，构建产物干净，无 Next.js 那堆 `.txt` 垃圾文件。
