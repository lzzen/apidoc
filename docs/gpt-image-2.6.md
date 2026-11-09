---
title: gpt-image-2.6
description: OpenAI Image API 兼容接口；在 gpt-image-2 基础上支持 flare / sunburst 模型与 gif、svg 输出
---

# gpt-image-2.6

<p class="page-desc">OpenAI Image API 兼容接口；在 gpt-image-2 基础上支持 flare / sunburst 模型与 gif、svg 输出</p>

gpt-image-2.6 系列在调用路径与整体入参上与 [gpt-image-2](./gpt-image-2.md) 一致，提供两个模型 ID 可选，并在 `output_format` 上额外支持 `gif`、`svg`。

## 1. 模型基本信息

| 项目 | 说明 |
| --- | --- |
| 模型 ID | `gpt-image-2.6-flare`、`gpt-image-2.6-sunburst` |
| 接口类型 | OpenAI Image API 兼容接口 |
| 入参规范 | 与 `gpt-image-2` 相同：`size` / `quality` / `n` / `response_format` / 编辑 multipart 等；`output_format` 见下文 |
| 版本状态 | 以站点模型配置与可用性为准 |
| 默认服务地址 | `https://openi.one` |

### 模型选型

| 模型 ID | 说明 |
| --- | --- |
| `gpt-image-2.6-flare` | 2.6 系列模型之一，按站点已启用能力调用 |
| `gpt-image-2.6-sunburst` | 2.6 系列模型之一，按站点已启用能力调用 |

### 调用路径

文生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/generations</span></div>

图像编辑：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/edits</span></div>

异步调用请在同步路径后追加 `async=true`，再查 `GET /v1/tasks/{task_id}`，见 [异步生图](./async-image.md)。

## 2. 请求示例

### gpt-image-2.6-flare（静态图）

```json
{
  "model": "gpt-image-2.6-flare",
  "prompt": "a red apple on a wooden table",
  "size": "1024x1024",
  "quality": "high",
  "n": 1,
  "output_format": "png",
  "response_format": "url"
}
```

### gpt-image-2.6-sunburst（gif）

```json
{
  "model": "gpt-image-2.6-sunburst",
  "prompt": "a looping sparkle animation around a product logo",
  "size": "1024x1024",
  "quality": "high",
  "n": 1,
  "output_format": "gif",
  "response_format": "url"
}
```

## 3. output_format（2.6 扩展）

在 gpt-image-2 的 `png`、`jpeg`、`webp` 基础上，2.6 系列另支持：

| 取值 | 说明 |
| --- | --- |
| `png` | 静态 PNG |
| `jpeg` | 静态 JPEG |
| `webp` | 静态 WebP |
| `gif` | GIF 动图或动效输出（以模型与站点能力为准） |
| `svg` | SVG 矢量输出（以模型与站点能力为准） |

其余参数含义与 [gpt-image-2 文生图入参](./gpt-image-2.md#2-文生图入参规范) 一致。`output_compression` 仍仅对 `jpeg` / `webp` 有意义。

## 4. 完整入参

完整字段说明请参阅 gpt-image-2 文档：

- [gpt-image-2 - 文生图入参](./gpt-image-2.md#2-文生图入参规范)
- [gpt-image-2 - 图生图和图像编辑](./gpt-image-2.md#3-图生图和图像编辑入参规范)
- [gpt-image-2 - 出参规范](./gpt-image-2.md#4-出参规范)
- [gpt-image-2 - 完整文档](./gpt-image-2.md)

调用时将 `model` 设为 `gpt-image-2.6-flare` 或 `gpt-image-2.6-sunburst`；需要 gif / svg 时设置对应 `output_format` 即可。
