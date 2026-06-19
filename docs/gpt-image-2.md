---
title: gpt-image-2
description: OpenAI Image API 兼容接口，支持文生图、图像编辑与多参考图融合
---

# gpt-image-2

<p class="page-desc">OpenAI Image API 兼容接口，支持文生图、图像编辑与多参考图融合</p>

gpt-image-2 是站点提供的 OpenAI GPT Image 图像生成模型。它通过 OpenAI Image API 兼容接口接入，适合高质量文生图、图像编辑、多参考图融合、商品图、海报、设计稿和需要灵活像素尺寸的生产图像场景。与 Gemini 图像模型不同，gpt-image-2 使用 OpenAI 风格的 `/v1/images/*` 路径，图片尺寸使用 `WxH` 像素或 `auto`，不是 1K、2K、4K 分辨率桶。

## 1. 模型基本信息

| 项目 | 说明 |
| --- | --- |
| 模型 ID | `gpt-image-2` |
| 接口类型 | OpenAI Image API 兼容接口 |
| 版本状态 | 以站点模型配置、上游可用性和上游账号权限为准 |
| 主要能力 | 文生图、图像编辑、多参考图、局部编辑、文字渲染、灵活像素尺寸输出 |
| 默认服务地址 | `https://v.openi.one` |

### 调用路径

文生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/generations</span></div>

图像编辑：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/edits</span></div>

示例：

<div class="url-list">
  <div class="url-item">https://v.openi.one/v1/images/generations</div>
  <div class="url-item">https://v.openi.one/v1/images/edits</div>
</div>

### 请求头

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | string | 是 | Bearer Token，格式为 `Bearer YOUR_API_KEY`。 |
| `Content-Type` | string | 是 | 文生图通常为 `application/json`；上传图片编辑时为 `multipart/form-data`。 |

## 2. 文生图入参规范

### 请求体

```json
{
  "model": "gpt-image-2",
  "prompt": "Create a premium product poster for a transparent perfume bottle on wet black stone, with crisp studio lighting and elegant typography.",
  "n": 1,
  "size": "1536x1024",
  "quality": "auto",
  "output_format": "png",
  "moderation": "auto"
}
```

### 顶层参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `model` | string | 是 | - | 固定传 gpt-image-2。 |
| `prompt` | string | 是 | - | 文本 prompt。建议写清主体、场景、材质、光线、构图、风格和需要渲染的文字。 |
| `n` | integer | 否 | 1 | 返回图片数量。建议生产调用先保持 1，便于控制延迟和成本。 |
| `size` | string | 否 | auto | 输出尺寸。可传 auto 或满足约束的 宽x高 像素值，例如 1024x1024、1536x1024、1024x1536。 |
| `quality` | string | 否 | auto | 渲染质量，可选 auto、low、medium、high。草稿可用 low，最终资产建议使用 medium 或 high。 |
| `output_format` | string | 否 | png | 输出格式，可选 png、jpeg、webp。关注延迟和体积时可优先考虑 jpeg。 |
| `output_compression` | integer | 否 | - | JPEG/WebP 压缩比例，范围 0 到 100；仅在 output_format 为 jpeg 或 webp 时有意义。 |
| `background` | string | 否 | auto | 背景策略。gpt-image-2 当前不支持 transparent，不要传透明背景。 |
| `moderation` | string | 否 | auto | 内容过滤强度，可选 auto、low。 |
| `response_format` | string | 否 | 渠道默认 | 网关扩展参数，非 OpenAI 官方字段。控制网关返回图片的形态，可选 b64_json、url；其他取值会被网关静默归一为 b64_json。默认值由渠道配置决定，未配置时使用 b64_json。当用户值与上游实际返回形态不一致时，网关会自动转换（URL 下载并 base64 编码，或 base64 上传至对象存储后返回 URL）。 |

### size 尺寸规则

gpt-image-2 支持动态像素尺寸，常用值如下：

| 场景 | 推荐值 |
| --- | --- |
| 自动选择 | auto |
| 正方形 | 1024x1024、2048x2048 |
| 横图 | 1536x1024、2048x1152、3840x2160 |
| 竖图 | 1024x1536、2160x3840 |

自定义尺寸必须同时满足：

| 约束 | 规则 |
| --- | --- |
| 最大边长 | 宽和高都必须小于或等于 3840px。 |
| 边长倍数 | 宽和高都必须是 16px 的倍数。 |
| 宽高比 | 长边与短边比例不能超过 3:1。 |
| 总像素 | 总像素不能小于 655360，不能大于 8294400。 |

超过 2560x1440（3686400 像素）的输出通常可视为 2K 以上实验性尺寸，建议先做小批量验证再进入生产流量。

## 3. 图生图和图像编辑入参规范

`/v1/images/edits` 同时支持以下两种方式上传参考图：

| 方式 | 路径 | Content-Type | 图片参数 |
| --- | --- | --- | --- |
| 二进制上传 | `/v1/images/edits` | `multipart/form-data` | `image[]` |
| JSON + URL/Base64 | `/v1/images/edits` | `application/json` | `images`（URL 或 base64 字符串数组） |

JSON 方式由网关下载并转换：网关接收到 URL 后会下载图片到内存，再以 `multipart/form-data` 二进制流的形式转发给上游 OpenAI，便于在不维护本地文件的场景下直接传图片链接。

OpenAI 侧可能要求账号完成 API Organization Verification 后才能使用 GPT Image 模型；如果上游返回权限类错误，请先检查上游账号状态。

### image[] 二进制请求

```bash
curl -X POST "https://v.openi.one/v1/images/edits" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "model=gpt-image-2" \
  -F "image[]=@product.png" \
  -F "image[]=@background.png" \
  -F "prompt=Place the product into the background scene and keep the product label sharp." \
  -F "size=1536x1024" \
  -F "quality=high"
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 固定传 gpt-image-2。 |
| `prompt` | string | 是 | 编辑指令。建议说明保留哪些元素、修改哪些区域、目标风格和文字要求。 |
| `image[]` | file[] | 是 | 输入图片二进制流。可传一张待编辑图，也可传多张参考图。 |
| `mask` | file | 否 | 局部编辑遮罩。多图场景下遮罩应用于第一张图片。 |
| `size` | string | 否 | 输出尺寸，规则同文生图。 |
| `quality` | string | 否 | 可选 auto、low、medium、high。 |
| `output_format` | string | 否 | 可选 png、jpeg、webp。 |
| `output_compression` | integer | 否 | JPEG/WebP 压缩比例，范围 0 到 100。 |
| `moderation` | string | 否 | 可选 auto、low。 |
| `response_format` | string | 否 | 网关扩展参数，非 OpenAI 官方字段。同文生图，可选 b64_json、url，无效值会被静默归一为 b64_json。 |

SDK 调用时字段通常名为 `image`，可以传文件数组；cURL/multipart 请求中使用重复的 `image[]` 表单字段。

### images JSON 请求（URL 或 base64）

```bash
curl -X POST "https://v.openi.one/v1/images/edits" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "Place the product into the background scene and keep the product label sharp.",
    "images": [
      "https://example.com/product.png",
      "https://example.com/background.png"
    ],
    "size": "1536x1024",
    "quality": "high"
  }'
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 固定传 gpt-image-2。 |
| `prompt` | string | 是 | 编辑指令。 |
| `images` | array | 是 | 参考图列表。每个元素可以是 HTTP/HTTPS URL、`data:image/...;base64,...` data URL、纯 base64 字符串，或 `{"image_url": "..."}` / `{"url": "..."}` 对象形式。URL 会由网关下载，等价于 `image[]` 文件上传。 |
| `size` | string | 否 | 输出尺寸，规则同文生图。 |
| `quality` | string | 否 | 可选 auto、low、medium、high。 |
| `response_format` | string | 否 | 网关扩展参数。同 image[] 二进制请求。 |

URL 下载的安全和限制：

| 项目 | 规则 |
| --- | --- |
| 协议 | 仅允许 `http://` 和 `https://`，禁止 `file://`、`ftp://` 等。 |
| SSRF 防护 | 私有 IP（10/8、172.16/12、192.168/16、127/8、169.254/16）和保留地址会被拒绝。 |
| 单图大小上限 | 20MB，超过会返回 `IMAGE_DOWNLOAD_FAILED` 错误。 |
| 单图下载超时 | 30s。 |
| 并发下载 | 单个请求内最多 5 并发。 |
| 允许的 Content-Type | image/jpeg、image/png、image/gif、image/webp、image/bmp。 |

任一 URL 下载失败时网关会返回 400 错误，错误信息中会列出失败的具体 URL：

```json
{
  "error": {
    "message": "failed to download 1 image(s): https://example.com/missing.png (HTTP 404)",
    "type": "invalid_request_error",
    "code": "IMAGE_DOWNLOAD_FAILED"
  }
}
```

### mask 要求

| 要求 | 说明 |
| --- | --- |
| 尺寸 | mask 必须和待编辑图片尺寸一致。 |
| 格式 | mask 必须和待编辑图片格式一致。 |
| 大小 | 单个图片或遮罩文件应小于 50MB。 |
| 透明通道 | mask 需要包含 alpha 通道。 |
| 精度 | GPT Image 会将 mask 作为提示引导，但不保证完全逐像素贴合遮罩形状。 |

gpt-image-2 对图片输入默认按高保真处理，不需要也不允许通过 `input_fidelity` 调低保真度。包含参考图或待编辑图的请求会产生图片输入 tokens，成本通常高于纯文生图。

## 4. 出参规范

成功响应为 OpenAI ImagesResponse：

```json
{
  "created": 1777347817,
  "data": [
    {
      "b64_json": "BASE64_IMAGE_DATA",
      "revised_prompt": "..."
    }
  ],
  "model": "gpt-image-2",
  "usage": {
    "total_tokens": 772,
    "input_tokens": 212,
    "output_tokens": 560,
    "input_tokens_details": {
      "text_tokens": 120,
      "image_tokens": 92
    }
  }
}
```

### 响应字段

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `created` | integer | 响应创建时间戳。 |
| `data` | Image[] | 图片结果列表。站点会优先返回 b64_json，便于直接保存为文件。 |
| `model` | string | 实际模型 ID，是否返回取决于上游。 |
| `usage` | object | token 使用量统计。计费通常需要同时关注文本输入、图片输入和图片输出 tokens。 |

### Image

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `b64_json` | string | Base64 编码图片数据。当 response_format 解析为 b64_json（默认）时返回该字段。 |
| `url` | string | 图片 URL。当 response_format 解析为 url 时返回该字段；网关会按需将上游 base64 上传至对象存储并填入该 URL。 |
| `revised_prompt` | string | 上游可能返回的改写后 prompt。 |

图片保存逻辑：

```ts
import { writeFile } from "node:fs/promises";

const imageBase64 = response.data[0]?.b64_json;
if (!imageBase64) {
  throw new Error("No image returned");
}

await writeFile("output.png", Buffer.from(imageBase64, "base64"));
```

## 5. 接入代码示例

### cURL

```bash
curl -X POST "https://v.openi.one/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
    "n": 1,
    "size": "1536x1024",
    "quality": "auto",
    "output_format": "png"
  }' | jq -r '.data[0].b64_json' | base64 --decode > output.png
```

### TypeScript

```ts
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({
  apiKey: process.env.BANANAROUTER_API_KEY,
  baseURL: "https://v.openi.one/v1",
});

async function main() {
  const response = await client.images.generate({
    model: "gpt-image-2",
    prompt:
      "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
    n: 1,
    size: "1536x1024",
    quality: "auto",
    output_format: "png",
  });

  const imageBase64 = response.data[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("No image returned");
  }

  await writeFile("output.png", Buffer.from(imageBase64, "base64"));
  console.log("Image saved to output.png");
}

main();
```

### Python

```python
import base64
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://v.openi.one/v1",
)

response = client.images.generate(
    model="gpt-image-2",
    prompt="Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
    n=1,
    size="1536x1024",
    quality="auto",
    output_format="png",
)

image_base64 = response.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

with open("output.png", "wb") as f:
    f.write(image_bytes)

print("Image saved to output.png")
```

### Go

```go
package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	body := `{
		"model": "gpt-image-2",
		"prompt": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
		"n": 1,
		"size": "1536x1024",
		"quality": "auto",
		"output_format": "png"
	}`

	req, err := http.NewRequest(
		http.MethodPost,
		"https://v.openi.one/v1/images/generations",
		strings.NewReader(body),
	)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Authorization", "Bearer "+os.Getenv("BANANAROUTER_API_KEY"))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	if resp.StatusCode >= 400 {
		log.Fatalf("request failed: %s", respBody)
	}

	var payload struct {
		Data []struct {
			B64JSON string `json:"b64_json"`
		} `json:"data"`
	}
	if err := json.Unmarshal(respBody, &payload); err != nil {
		log.Fatal(err)
	}
	if len(payload.Data) == 0 || payload.Data[0].B64JSON == "" {
		log.Fatal("no image returned")
	}

	imageBytes, err := base64.StdEncoding.DecodeString(payload.Data[0].B64JSON)
	if err != nil {
		log.Fatal(err)
	}

	if err := os.WriteFile("output.png", imageBytes, 0644); err != nil {
		log.Fatal(err)
	}
	fmt.Println("Image saved to output.png")
}
```

### 图像编辑 cURL

```bash
curl -X POST "https://v.openi.one/v1/images/edits" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "model=gpt-image-2" \
  -F "image[]=@input.png" \
  -F "mask=@mask.png" \
  -F "prompt=Replace the masked area with a flamingo-shaped pool float while preserving the original lighting." \
  -F "size=1024x1024" \
  -F "quality=high" \
  | jq -r '.data[0].b64_json' | base64 --decode > edited.png
```

## 6. 成本与延迟

gpt-image-2 的成本通常由三部分组成：

| 成本项 | 说明 |
| --- | --- |
| 文本输入 tokens | 来自 prompt 和其他文本参数。 |
| 图片输入 tokens | 编辑或参考图请求会产生，gpt-image-2 默认高保真处理图片输入。 |
| 图片输出 tokens | 与 size、quality 和实际生成复杂度相关。 |

质量越高、尺寸越大、参考图越多，通常延迟和成本越高。复杂 prompt 或高分辨率请求可能需要更长处理时间；对低延迟场景，建议先用 `quality: "low"` 或较小尺寸进行草稿生成，再提升到 medium 或 high。

## 7. 常见错误码

错误响应格式：

```json
{
  "error": {
    "message": "API key missing. Add your API key and try again.",
    "type": "authentication_error",
    "param": null,
    "code": "invalid_api_key",
    "request_id": "req_xxx"
  }
}
```

| HTTP 状态码 | type | 常见 code | 常见原因 |
| --- | --- | --- | --- |
| 400 | invalid_request_error | invalid_request | JSON 或 multipart 格式错误、缺少 model 或 prompt、image 参数不正确、size 不满足约束、传入不支持的透明背景。 |
| 401 | authentication_error | invalid_api_key | 未传 API Key、Key 无效或已过期。 |
| 403 | permission_error | invalid_request | Token 被禁用、用户无权限、分组未授权该模型，或上游账号未开通所需图片模型权限。 |
| 404 | invalid_request_error | invalid_request | 模型 ID 不存在或站点未启用该模型。 |
| 413 | invalid_request_error | invalid_request | 上传图片或 mask 文件过大。 |
| 429 | rate_limit_error | rate_limited | 触发限流、额度不足或余额不足。 |
| 500 | server_error | internal_error | 网关内部错误或响应编码异常。 |
| 503 | server_error | internal_error | 没有可用上游通道或上游临时不可用。 |

## 8. 官方参考

- [OpenAI Image generation guide](https://platform.openai.com/docs/guides/image-generation)
- [OpenAI Images API reference](https://platform.openai.com/docs/api-reference/images)
