---
title: gpt-image-2.5
description: OpenAI Image API 兼容接口；参数与 gpt-image-2 相同
---

# gpt-image-2.5

<p class="page-desc">OpenAI Image API 兼容接口；参数与 gpt-image-2 相同</p>

gpt-image-2.5 是站点提供的 OpenAI GPT Image 图像生成模型。调用方式与 [gpt-image-2](./gpt-image-2.md) **完全相同**，仅模型 ID 不同。

## 1. 模型基本信息

| 项目 | 说明 |
| --- | --- |
| 模型 ID | `gpt-image-2.5` |
| 接口类型 | OpenAI Image API 兼容接口 |
| 入参规范 | 与 `gpt-image-2` 相同：`size` / `quality` / `n` / `response_format` / 编辑 multipart 等 |
| 版本状态 | 以站点模型配置与可用性为准 |
| 默认服务地址 | `https://v.openi.one` |

### 调用路径

文生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/generations</span></div>

图像编辑：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/edits</span></div>

异步调用请在同步路径后追加 `async=true`，再查 `GET /v1/tasks/{task_id}`，见 [异步生图](./async-image.md)。

## 2. 请求示例

```json
{
  "model": "gpt-image-2.5",
  "prompt": "a red apple on a wooden table",
  "size": "1024x1024",
  "quality": "high",
  "n": 1,
  "response_format": "url"
}
```

## 3. 完整入参

完整字段说明请参阅 gpt-image-2 文档：

- [gpt-image-2 - 文生图入参](./gpt-image-2.md#2-文生图入参规范)
- [gpt-image-2 - 图生图和图像编辑](./gpt-image-2.md#3-图生图和图像编辑入参规范)
- [gpt-image-2 - 完整文档](./gpt-image-2.md)

调用时请将 `model` 改为 `gpt-image-2.5` 即可。
