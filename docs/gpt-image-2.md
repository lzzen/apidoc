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
| 默认服务地址 | 主节点：`https://v.openi.one` |

## 2. 调用路径

### 文生图

<div class="endpoint-block">POST https://v.openi.one/v1/images/generations</div>

### 图像编辑

<div class="endpoint-block">POST https://v.openi.one/v1/images/edits</div>

## 3. 鉴权方式

所有请求需在 Header 中携带 API Key：

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## 4. 文生图请求参数

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
| `response_format` | string | 否 | 渠道默认 | 网关扩展参数，非 OpenAI 官方字段。控制网关返回图片的形态，可选 b64_json、url；其他取值会被网关静默归一为 b64_json。默认值由渠道配置决定，未配置时使用 b64_json。当用户值与上游实际返回形态不一致时，网关会自动转换(URL 下载并 base64 编码，或 base64 上传至对象存储后返回 URL)。 |

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
