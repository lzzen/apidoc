# API 接口文档站点

基于 [Fumadocs](https://fumadocs.dev) 的 Markdown 接口文档工具，视觉风格参考 [BananaRouter 文档](https://bananarouter.com/docs/gpt-image-2)。

## 快速开始

```bash
npm install
npm run dev
```

打开 [http://localhost:3000/docs/gpt-image-2](http://localhost:3000/docs/gpt-image-2)

## 修改品牌与 API 地址

编辑 [`lib/site.config.ts`](lib/site.config.ts)：

```ts
export const siteConfig = {
  brandName: 'Vopeni',
  primaryBaseUrl: 'https://api.example.com',
  globalBaseUrl: 'https://global.example.com',
};
```

## 编辑文档

每篇文档对应一个 MDX 文件，使用标准 Markdown 语法：

- 文档目录：[`content/docs/`](content/docs/)
- 侧栏结构：[`content/docs/meta.json`](content/docs/meta.json)

示例：修改 `content/docs/gpt-image-2.mdx` 后，开发服务器会自动热更新。

### 可用 MDX 组件

| 组件 | 用途 |
| --- | --- |
| `<BaseUrl />` | 输出主节点地址 |
| `<BaseUrl variant="global" />` | 输出全球节点地址 |
| `<EndpointBlock method="POST" path="{BASE_URL}/v1/..." />` | API 路径代码块 |
| `<ParamTable rows={[...]} />` | 参数说明表格 |

## 新增页面

1. 在 `content/docs/` 新建 MDX 文件，例如 `nano-banana.mdx`：

```mdx
---
title: Nano Banana
description: Nano Banana 接口说明
icon: FileText
---

正文内容...
```

2. 在 `content/docs/meta.json` 的 `pages` 数组中添加文件名（不含扩展名）：

```json
{
  "pages": [
    "---接口文档---",
    "gpt-image-2",
    "nano-banana"
  ]
}
```

分组标题使用 `---分组名---` 格式。

## 构建与部署

```bash
npm run build   # 输出到 out/ 目录
```

产物为**纯静态 HTML**，上传到 Nginx / OSS / GitHub Pages 即可，**服务器无需 Node.js**。

详见 [`how-to-use.md`](how-to-use.md)。

## Swagger / OpenAPI 导入（Phase 2）

1. 将 OpenAPI 3.x 文件放入 `openapi/openapi.json`
2. 安装 `fumadocs-openapi`
3. 按 [`scripts/generate-openapi.ts`](scripts/generate-openapi.ts) 中的说明启用生成脚本
4. 运行 `npm run generate:openapi`

## 项目结构

```
content/docs/          # Markdown 文档
lib/site.config.ts     # 品牌与 API 地址
components/docs/       # 可复用 MDX 组件
scripts/               # OpenAPI 生成脚本（Phase 2）
openapi/               # Swagger / OpenAPI 文件目录
```
