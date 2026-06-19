---
title: gpt-image-2
description: OpenAI Image API 兼容接口，支持文生图与图像编辑
---

# gpt-image-2

<p class="page-desc">OpenAI Image API 兼容接口，支持文生图与图像编辑</p>

gpt-image-2 是 OpenAI GPT Image 生图模型，兼容 OpenAI Image API，适合高质量文生图、图像编辑、专业设计等场景。与 Gemini 系列模型的差异在于：路径使用 `/v1/images/*`，分辨率使用 `WxH` 或 `auto`，而非 1K / 2K / 4K 档位。

## 1. 模型基本信息

| 项目 | 说明 |
| --- | --- |
| 模型 ID | `gpt-image-2` |
| 接口类型 | OpenAI Image API 兼容接口 |
| 版本状态 | 以站点模型配置、上游可用性和上游账号权限为准 |
| 主要能力 | 文生图、图像编辑、多参考图、局部编辑、文字渲染、灵活像素尺寸输出 |
| 默认服务地址 | 主节点：`https://v.openi.one`；全球节点（120s 超时）：`https://global.example.com` |

## 2. 调用路径

### 文生图

<div class="endpoint-block">

```
POST https://v.openi.one/v1/images/generations
```

</div>

### 图像编辑

<div class="endpoint-block">

```
POST https://v.openi.one/v1/images/edits
```

</div>

## 3. 鉴权方式

所有请求需在 Header 中携带 API Key：

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## 4. 文生图请求参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 固定为 gpt-image-2 |
| `prompt` | string | 是 | 图像描述提示词 |
| `n` | integer | 否 | 生成张数，默认 1，范围 1-10 |
| `size` | string | 否 | auto 或 WxH。边长为 16 的倍数，单边最大 3840 |
| `quality` | string | 否 | auto、low、medium、high |
| `output_format` | string | 否 | png、jpeg、webp |
| `stream` | boolean | 否 | 是否以 SSE 流式返回 |

## 5. 文生图请求示例

```bash
curl https://v.openi.one/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "A futuristic cityscape at sunset, cinematic lighting",
    "n": 1,
    "size": "1024x1024",
    "quality": "high"
  }'
```

## 6. 图像编辑请求参数

图像编辑接口使用 `multipart/form-data`：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 固定为 gpt-image-2 |
| `image` | file | 是 | 待编辑图片，支持 png / jpg / webp |
| `prompt` | string | 是 | 编辑指令 |
| `mask` | file | 否 | 可选遮罩图，用于局部重绘 |
| `n` | integer | 否 | 生成张数，默认 1 |
| `size` | string | 否 | 输出尺寸，格式同文生图 |

## 7. 图像编辑请求示例

```bash
curl https://v.openi.one/v1/images/edits \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "model=gpt-image-2" \
  -F "image=@./input.png" \
  -F "prompt=Replace the background with cherry blossoms in spring" \
  -F "n=1" \
  -F "size=1024x1024"
```

## 8. 响应示例

gpt-image-2 默认返回 Base64 图片数据：

```json
{
  "created": 1713833628,
  "data": [{ "b64_json": "..." }]
}
```

## 9. 注意事项

- API 地址见 `lib/site.config.ts` 中的 `primaryBaseUrl` / `globalBaseUrl`
- 图像编辑请求体总大小建议不超过 50 MB
- `transparent` 背景可能不受支持，请优先使用 `auto` 或 `opaque`
