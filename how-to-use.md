# 使用与部署

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000/docs/gpt-image-2

## 编辑

| 操作 | 文件 |
| --- | --- |
| 改正文 | `content/docs/*.mdx` |
| 改侧栏 | `content/docs/meta.json` |
| 改品牌/API 地址 | `lib/site.config.ts` |

## 构建（静态 HTML）

```bash
npm run build
```

构建完成后，所有页面输出到 **`out/`** 目录，纯静态文件，**无需 Node.js**。

> 构建会自动运行 `scripts/fix-static-export.mjs`，修复 Next.js 16 静态导出时 RSC 文件路径不匹配导致的 404。

```
out/
├── index.html
├── docs/
│   └── gpt-image-2.html
└── ...
```

本地预览静态产物：

```bash
npx serve out
```

## 部署

将 `out/` 目录上传到任意静态托管即可：

| 平台 | 操作 |
| --- | --- |
| Nginx | `root /path/to/out;` + `try_files $uri $uri.html $uri/ =404;` |
| 阿里云 OSS / 腾讯云 COS | 上传 `out/` 全部文件，开启静态网站托管 |
| GitHub Pages | 推送 `out/` 到 gh-pages 分支 |
| Cloudflare Pages | 构建命令 `npm run build`，输出目录 `out` |

可选环境变量（构建时设置）：

```bash
NEXT_PUBLIC_SITE_URL=https://你的域名 npm run build
```

## 说明

- 已启用 `output: 'export'`，产物为纯静态 HTML
- 搜索功能已关闭（原依赖服务端 API）
- 不需要 `npm start`，也不需要在服务器安装 Node.js
