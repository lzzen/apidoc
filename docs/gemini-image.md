---
title: Gemini 图像
description: Gemini 原生 generateContent 生图接口，支持文生图、图生图与多参考图编辑
---

# Gemini 图像

<p class="page-desc">Gemini 原生 generateContent 生图接口，支持文生图、图生图与多参考图编辑</p>

Gemini 图像模型通过 Google Gemini 原生路径接入，适合文生图、图生图、多参考图融合与自然语言编辑。与 gpt-image-2 的 OpenAI `/v1/images/*` 不同：模型名写在路径中，请求体使用 `contents` / `generationConfig`，尺寸用宽高比（如 `16:9`）与分辨率桶（`1K` / `2K` / `4K`），不是 `WxH` 像素。

异步调用请在同一路径追加 `?async=true`，详见 [异步生图](./async-image.html)。

## 1. 模型基本信息

| 项目 | 说明 |
| --- | --- |
| 接口类型 | Gemini API 兼容（`generateContent`） |
| 推荐模型 | `gemini-3-pro-image-preview`、`gemini-2.5-flash-image`、`gemini-3.1-flash-image-preview` |
| 别名参考 | `nano-banana-pro-preview`（以站点实际启用模型为准） |
| 版本状态 | 以站点模型配置、上游可用性和上游账号权限为准 |
| 主要能力 | 文生图、图生图、多参考图、自然语言编辑、宽高比与分辨率桶 |
| 默认服务地址 | `https://v.openi.one` |

### 调用路径

同步生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1beta/models/{model}:generateContent</span></div>

异步生图（同路径 + 查询参数）：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1beta/models/{model}:generateContent?async=true</span></div>

示例：

<div class="url-list">
  <div class="url-item">https://v.openi.one/v1beta/models/gemini-3-pro-image-preview:generateContent</div>
  <div class="url-item">https://v.openi.one/v1beta/models/gemini-2.5-flash-image:generateContent</div>
  <div class="url-item">https://v.openi.one/v1beta/models/gemini-3-pro-image-preview:generateContent?async=true</div>
</div>

### 请求头

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | string | 是 | Bearer Token，格式为 `Bearer YOUR_API_KEY`。 |
| `Content-Type` | string | 是 | `application/json`。 |

## 2. 文生图入参规范

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | Gemini 图像模型 ID，写在路径中，例如 `gemini-3-pro-image-preview`。 |

### 请求体

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Create a premium product poster for a transparent perfume bottle on wet black stone, with crisp studio lighting and elegant typography."
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": {
      "aspectRatio": "16:9",
      "imageSize": "2K"
    }
  }
}
```

### 顶层参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `contents` | array | 是 | - | 对话内容列表。生图场景通常传一条 `role: "user"`，`parts` 中至少包含一段 `text`。 |
| `generationConfig` | object | 是 | - | 生成配置。生图时必须包含 `responseModalities`。 |
| `safetySettings` | array | 否 | 站点/上游默认 | 安全过滤设置，字段名与取值遵循 Gemini 协议。 |
| `systemInstruction` | object | 否 | - | 系统指令，结构与单条 content 类似。 |
| `response_format` | string | 否 | 渠道默认 | 网关扩展参数，非 Google 官方字段。控制同步响应中**图片 Part** 的形态：`url` 时每个图片 Part 为 `fileData`（对象存储 URL）；`b64_json` 或未传时保持官方 `inlineData`（base64）。当客户端取值与上游实际返回不一致时，网关会按需转换（base64 上传至对象存储后返回 `fileData`，或保留 `inlineData`）。 |
| `async` | boolean | 否 | - | 体内容异步开关。推荐用查询参数 `?async=true`；两者同时存在时以查询参数为准。 |

### generationConfig

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `responseModalities` | string[] | 是 | - | 输出模态。生图请包含 `IMAGE`；需要附带说明文字时用 `["TEXT","IMAGE"]`，只要图片可用 `["IMAGE"]`。 |
| `imageConfig` | object | 否 | 模型默认 | 图像输出配置，见下方。 |
| `temperature` / `topP` / `topK` | number | 否 | 模型默认 | 采样参数，是否生效取决于上游模型。 |
| `candidateCount` | integer | 否 | 1 | 候选数量。异步与生产调用建议保持 1。 |

### imageConfig

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `aspectRatio` | string | 否 | 模型默认（常见 `1:1`） | 输出宽高比。 |
| `imageSize` | string | 否 | `1K` | 分辨率桶，常见 `1K`、`2K`、`4K`。是否支持取决于具体模型。 |

### aspectRatio 常用值

| 场景 | 推荐值 |
| --- | --- |
| 正方形 | `1:1` |
| 横图 | `16:9`、`3:2`、`4:3`、`21:9` |
| 竖图 | `9:16`、`2:3`、`3:4` |
| 其它 | `5:4`、`4:5` |

具体可用比例以所用模型与上游为准；不支持的取值可能被忽略或返回错误。

### imageSize 说明

| 取值 | 说明 |
| --- | --- |
| `1K` | 默认档，延迟与成本通常最低。 |
| `2K` | 更高清晰度，适合海报、商品主图。 |
| `4K` | 最高清晰度档（若模型支持），成本与延迟更高。 |

Gemini 使用分辨率桶，不是 gpt-image-2 的 `1536x1024` 这类像素尺寸。

## 3. 图生图与图像编辑

在同一 `generateContent` 路径上，把参考图放进 `parts` 即可做图生图或自然语言编辑。参考图可用 `inlineData`（base64）或 `fileData`（公网 URL）。

### inlineData（base64）

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Place the product into the background scene and keep the product label sharp."
        },
        {
          "inlineData": {
            "mimeType": "image/png",
            "data": "<base64-encoded-image>"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": {
      "aspectRatio": "3:2",
      "imageSize": "2K"
    }
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `inlineData.mimeType` | string | 是 | 图片 MIME，常见 `image/png`、`image/jpeg`、`image/webp`。 |
| `inlineData.data` | string | 是 | 纯 base64 字符串（不要带 `data:image/...;base64,` 前缀，除非上游明确接受 data URL）。 |

### fileData（URL）

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Replace the background with a soft studio gradient while keeping the product unchanged."
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://example.com/product.png"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE"],
    "imageConfig": {
      "aspectRatio": "1:1"
    }
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fileData.fileUri` | string | 是 | 公网可访问的图片 URL（`http` / `https`）。 |
| `fileData.mimeType` | string | 建议 | 图片 MIME；便于上游识别格式。 |

可在同一 `parts` 中传多张参考图；prompt 中写清保留/修改/融合关系。URL 可用性与大小限制受上游与网关约束；私有网段地址通常会被拒绝。

## 4. 出参规范

同步成功时返回 **Gemini 原生** `generateContent` 风格 JSON（`candidates[].content.parts`），**不是** OpenAI `chat.completion`。请勿把 `message.content` 里的 `![image](url)` Markdown 当作本接口的出参形态——那是 `/v1/chat/completions` 等 OpenAI 兼容路径的展示格式。

图片出现在 `candidates[0].content.parts` 中，具体字段取决于请求里的 `response_format`：

| 请求 `response_format` | 图片 Part 形态 | 说明 |
| --- | --- | --- |
| `url` | `fileData` | 每个图片 Part 为 `{"fileData": {"fileUri": "<对象存储 URL>", "mimeType": "image/png"}}`；网关会按需将上游 base64 上传至对象存储并填入 URL。 |
| `b64_json` 或未指定 | `inlineData` | 保持 Google 官方 inline base64 形态（`inlineData.data` + `mimeType`）。 |

### response_format=url（fileData）

请求示例（在文生图 JSON 顶层增加 `response_format`）：

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Generate a premium product poster." }]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": { "aspectRatio": "16:9", "imageSize": "2K" }
  },
  "response_format": "url"
}
```

成功响应示例：

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          {
            "text": "Here is the generated poster."
          },
          {
            "fileData": {
              "fileUri": "https://img.openi.chat/enhance/results/d147be49f8f6ccd4afea17b8e6c20229.png?expires=1788330877",
              "mimeType": "image/png"
            }
          }
        ]
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 120,
    "candidatesTokenCount": 560,
    "totalTokenCount": 680
  }
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `fileData.fileUri` | string | 本站对象存储上的结果图 URL（通常带签名/过期参数）。直接 `GET` 下载即可。 |
| `fileData.mimeType` | string | 结果图 MIME，常见 `image/png`、`image/jpeg`、`image/webp`。 |

### 未指定或 response_format=b64_json（inlineData）

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          {
            "text": "Here is the generated poster."
          },
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "BASE64_IMAGE_DATA"
            }
          }
        ]
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 120,
    "candidatesTokenCount": 560,
    "totalTokenCount": 680
  }
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `inlineData.mimeType` | string | 结果图 MIME。 |
| `inlineData.data` | string | Base64 图片数据（不含 `data:image/...;base64,` 前缀）。 |

### 通用响应字段

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `candidates` | array | 候选结果列表。 |
| `candidates[].content.parts` | array | 可能混有 `text` 与图片 Part（`fileData` 或 `inlineData`，不会在同一 Part 上同时返回两者）。 |
| `usageMetadata` | object | token 用量；字段名因上游可能略有差异。 |

部分上游或中间层可能返回 snake_case（如 `inline_data`、`file_data`、`mime_type`、`file_uri`）。解析时建议同时兼容 camelCase 与 snake_case。

解析与保存图片示例（同时支持 `fileData` 与 `inlineData`）：

```ts
import { writeFile } from "node:fs/promises";

type ImagePart =
  | { kind: "url"; mimeType: string; url: string }
  | { kind: "base64"; mimeType: string; data: string };

function extractImage(parts: Array<Record<string, unknown>>): ImagePart | null {
  for (const part of parts) {
    const fileData = (part.fileData ?? part.file_data) as
      | { fileUri?: string; file_uri?: string; mimeType?: string; mime_type?: string }
      | undefined;
    const uri = fileData?.fileUri ?? fileData?.file_uri;
    if (uri) {
      return {
        kind: "url",
        mimeType: fileData?.mimeType ?? fileData?.mime_type ?? "image/png",
        url: uri,
      };
    }

    const inline = (part.inlineData ?? part.inline_data) as
      | { data?: string; mimeType?: string; mime_type?: string }
      | undefined;
    if (inline?.data) {
      return {
        kind: "base64",
        mimeType: inline.mimeType ?? inline.mime_type ?? "image/png",
        data: inline.data,
      };
    }
  }
  return null;
}

const parts = response.candidates?.[0]?.content?.parts ?? [];
const image = extractImage(parts);
if (!image) throw new Error("No image returned");

if (image.kind === "url") {
  const res = await fetch(image.url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = image.mimeType.includes("jpeg") ? "jpg" : "png";
  await writeFile(`output.${ext}`, buf);
} else {
  const ext = image.mimeType.includes("jpeg") ? "jpg" : "png";
  await writeFile(`output.${ext}`, Buffer.from(image.data, "base64"));
}
```

## 5. 接入代码示例

### cURL：文生图（response_format=url）

```bash
curl -X POST "https://v.openi.one/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail."
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }
    },
    "response_format": "url"
  }'
```

响应中图片 Part 形如 `{"fileData": {"fileUri": "https://...", "mimeType": "image/png"}}`，可直接下载 `fileUri`。

### cURL：文生图

```bash
curl -X POST "https://v.openi.one/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail."
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }
    }
  }'
```

### cURL：图生图

```bash
curl -X POST "https://v.openi.one/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Place the product into the background scene and keep the product label sharp."
          },
          {
            "fileData": {
              "mimeType": "image/png",
              "fileUri": "https://example.com/product.png"
            }
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "3:2",
        "imageSize": "1K"
      }
    }
  }'
```

### TypeScript

```ts
const BASE_URL = "https://v.openi.one";
const API_KEY = process.env.API_KEY!;
const MODEL = "gemini-3-pro-image-preview";

async function generateGeminiImage() {
  const res = await fetch(
    `${BASE_URL}/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "2K",
          },
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`request failed: ${await res.text()}`);
  }

  const payload = await res.json();
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const fileData = part.fileData ?? part.file_data;
    if (fileData?.fileUri ?? fileData?.file_uri) {
      const url = fileData.fileUri ?? fileData.file_uri;
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error(`download failed: ${imgRes.status}`);
      const { writeFile } = await import("node:fs/promises");
      await writeFile("output.png", Buffer.from(await imgRes.arrayBuffer()));
      console.log("Image saved to output.png");
      return;
    }
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile("output.png", Buffer.from(inline.data, "base64"));
      console.log("Image saved to output.png");
      return;
    }
  }
  throw new Error("No image returned");
}

generateGeminiImage().catch(console.error);
```

### Python

```python
import base64
import os
import requests

BASE_URL = "https://v.openi.one"
API_KEY = os.environ["API_KEY"]
MODEL = "gemini-3-pro-image-preview"

resp = requests.post(
    f"{BASE_URL}/v1beta/models/{MODEL}:generateContent",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail."
                    }
                ],
            }
        ],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {
                "aspectRatio": "16:9",
                "imageSize": "2K",
            },
        },
    },
    timeout=120,
)
resp.raise_for_status()
payload = resp.json()

for part in payload.get("candidates", [{}])[0].get("content", {}).get("parts", []):
    file_data = part.get("fileData") or part.get("file_data") or {}
    file_uri = file_data.get("fileUri") or file_data.get("file_uri")
    if file_uri:
        img = requests.get(file_uri, timeout=120)
        img.raise_for_status()
        with open("output.png", "wb") as f:
            f.write(img.content)
        print("Image saved to output.png")
        break

    inline = part.get("inlineData") or part.get("inline_data") or {}
    data = inline.get("data")
    if data:
        with open("output.png", "wb") as f:
            f.write(base64.b64decode(data))
        print("Image saved to output.png")
        break
else:
    raise RuntimeError("No image returned")
```

## 6. 异步调用

在同步路径后加 `async=true`，提交立即返回 `202` + `task_id`，再轮询统一任务接口：

1. `POST /v1beta/models/{model}:generateContent?async=true`
2. `GET /v1/tasks/{task_id}` 直到 `SUCCESS` / `FAILURE`
3. 成功时读取 `result_url`

请求体与同步完全相同。完整说明、状态表与取消接口见 [异步生图](./async-image.html)。

```bash
curl -X POST "https://v.openi.one/v1beta/models/gemini-3-pro-image-preview:generateContent?async=true" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": "Generate a futuristic cyberpunk city at night." }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": { "aspectRatio": "16:9", "imageSize": "2K" }
    }
  }'
```

## 7. 成本与延迟

| 成本项 | 说明 |
| --- | --- |
| 文本输入 | prompt / systemInstruction 等文本。 |
| 图片输入 | 参考图会增加输入用量；多参考图成本通常更高。 |
| 图片输出 | 与 `imageSize`、画面复杂度相关；`2K` / `4K` 通常高于 `1K`。 |

分辨率越高、参考图越多，延迟与成本通常越高。草稿可先用 `1K` 或较小宽高比验证，再提升到 `2K` / `4K`。

## 8. 常见错误码

错误响应格式因上游与网关路径略有差异，常见为：

```json
{
  "error": {
    "message": "API key missing. Add your API key and try again.",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}
```

| HTTP 状态码 | 常见原因 |
| --- | --- |
| 400 | JSON 无效、缺少 `contents` / `responseModalities`、参考图无效、`aspectRatio` / `imageSize` 不被模型支持。 |
| 401 | 未传 API Key、Key 无效或已过期。 |
| 403 | Token 被禁用、分组未授权该模型，或上游账号无图片模型权限。 |
| 404 | 模型 ID 不存在或站点未启用。 |
| 429 | 限流、额度不足或余额不足。 |
| 500 / 503 | 网关内部错误、无可用通道或上游临时不可用。 |

开启 `async=true` 但站点未开通异步生图时，可能返回 `async_image_api_disabled` 等业务错误码，详见异步文档。

## 9. 与 gpt-image-2 的差异

| 项目 | Gemini 图像 | gpt-image-2 |
| --- | --- | --- |
| 路径 | `/v1beta/models/{model}:generateContent` | `/v1/images/generations`、`/v1/images/edits` |
| 模型位置 | 路径参数 `{model}` | JSON 字段 `model` |
| 尺寸 | `aspectRatio` + `imageSize`（1K/2K/4K） | `size`（如 `1536x1024` / `auto`） |
| 参考图 | `parts.inlineData` / `parts.fileData` | `images` / `image[]` |
| 返回格式控制 | 顶层 `response_format`：`url` → `parts[].fileData`；默认/`b64_json` → `parts[].inlineData` | 顶层 `response_format`：`url` → `data[].url`；默认/`b64_json` → `data[].b64_json` |
| 同步响应 | Gemini `candidates[].content.parts`（非 `chat.completion`） | OpenAI `data[].b64_json` / `url` |
| 异步 | 同路径 `?async=true` | 同路径 `?async=true` |

## 10. 官方参考

- [Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Generate content API](https://ai.google.dev/api/generate-content)
