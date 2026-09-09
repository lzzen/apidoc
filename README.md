# Vopeni 接口文档

基于 [VitePress](https://vitepress.dev) 的 Markdown 接口文档站点。

## 快速开始

```bash
npm install
npm run dev
```

## 编辑文档

- 正文：`docs/gpt-image-2.md`、`docs/gpt-image-2.5.md`、`docs/gemini-image.md`、`docs/async-image.md`、`docs/imgtools.md`、`docs/seedance.md`（Seedance 尚未正式上线，侧栏隐藏）
- 侧栏：`docs/.vitepress/config.mts`
- 品牌/API：`lib/site.config.ts`

## 构建部署

```bash
npm run build
```

上传 `out/` 内容到服务器任意子目录。详见 [how-to-use.md](how-to-use.md)。
