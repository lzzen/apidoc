# 使用与部署

## 构建

```bash
npm run build
```

把 `out/` **里面的所有文件**上传到你站点任意子目录（`docs/`、`mydocs/` 都行），**不用改任何配置**。

```
abc.com/
├── index.html          ← 你原有主页
└── docs/               ← out/ 内容放这里，文件夹名随意
    ├── gpt-image-2.html
    ├── _next/
    └── ...
```

访问：`abc.com/docs/gpt-image-2.html`（或 `abc.com/mydocs/gpt-image-2.html`）

## 本地

```bash
npm run dev          # 开发：http://localhost:3000/gpt-image-2
npm run preview      # 预览静态产物
```

## 编辑

| 操作 | 文件 |
| --- | --- |
| 改正文 | `content/docs/*.mdx` |
| 改侧栏 | `content/docs/meta.json` |
| 改品牌/API 地址 | `lib/site.config.ts` |

所有资源路径均为**相对路径**，放哪个子目录都能用。
