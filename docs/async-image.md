---
title: 异步生图
description: 异步图像生成与编辑任务接口，支持提交与查询
---

# 异步生图

<p class="page-desc">异步图像生成与编辑任务接口，支持提交与查询</p>

异步生图在**既有同步路径**上通过查询参数 `async=true` 开启。客户端提交后立即拿到 `task_id`，再通过统一任务接口轮询状态；任务成功后从 `result_url` 获取结果图。

- **GPT 系列**：与同步相同的 `/v1/images/*` 路径，追加 `?async=true`。
- **Gemini 系列**：与同步相同的 `/v1beta/models/{model}:generateContent` 路径，追加 `?async=true`。
- **查询**：统一走 `GET /v1/tasks/{task_id}`，与系列无关。**不提供取消接口**（受理即计费，取消易造成费用损失）。

## 1. 接口概览

| 项目 | 说明 |
| --- | --- |
| 接口类型 | 异步任务 API（提交 → 查询） |
| 开启方式 | 同步路径上加查询参数 `async=true`（也可在 JSON 体传 `"async": true`；**查询参数优先**） |
| 认证方式 | Bearer Token（`Authorization: Bearer YOUR_API_KEY`） |
| 默认服务地址 | `https://v.openi.one` |
| 提交成功状态码 | `202 Accepted` |
| 与同步接口关系 | 同一路径；不带 `async=true` 为同步，带则为异步 |

### 调用路径

#### GPT 系列

提交异步生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/generations?async=true</span></div>

提交异步编辑：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/images/edits?async=true</span></div>

#### Gemini 系列

提交异步生图 / 图生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1beta/models/{model}:generateContent?async=true</span></div>

#### 统一任务

查询任务：

<div class="endpoint-block"><span class="http-method get">GET</span><span class="http-path">{BASE_URL}/v1/tasks/{task_id}</span></div>

示例：

<div class="url-list">
  <div class="url-item">https://v.openi.one/v1/images/generations?async=true</div>
  <div class="url-item">https://v.openi.one/v1/images/edits?async=true</div>
  <div class="url-item">https://v.openi.one/v1beta/models/{model}:generateContent?async=true</div>
  <div class="url-item">https://v.openi.one/v1/tasks/{task_id}</div>
</div>

### 推荐调用流程

1. 按模型系列调用对应提交路径并带上 `async=true`，拿到响应中的 `id`（即 `task_id`）。
2. 轮询 `GET /v1/tasks/{task_id}`，观察 `status` 从 `QUEUED` / `IN_PROGRESS` 变为 `SUCCESS` 或 `FAILURE`。
3. 成功时读取 `result_url` 下载结果图；失败时读取 `fail_reason`。
4. **不要**调用取消接口：网关不提供 `DELETE /v1/tasks/{task_id}`；任务一旦受理即完成计费结算。

### 请求头

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | string | 是 | Bearer Token，格式为 `Bearer YOUR_API_KEY`。 |
| `Content-Type` | string | 提交时必填 | 提交接口使用 `application/json`（GPT 编辑若走 multipart，则为 `multipart/form-data`）。 |
| `Idempotency-Key` | string | 否 | 提交幂等键。相同 Key 的重复提交由上游/网关去重，适合重试场景。 |
| `X-Async-Callback-URL` | string | 否 | 任务完成回调地址。若上游支持 Webhook，将按该 URL 通知。 |
| `X-Async-Callback-Secret` | string | 否 | 回调签名密钥，与 `X-Async-Callback-URL` 配合使用。 |
| `X-Async-Expires-In` | string | 否 | 任务过期时间提示，透传给上游异步通道。 |

## 2. GPT：提交异步生图

`POST /v1/images/generations?async=true`

请求体与同步文生图一致，兼容 OpenAI Image API。`model` 与 `prompt` 为必填；其余参数按站点模型能力与上游通道支持情况生效。

### 请求体

```json
{
  "model": "gpt-image-2",
  "prompt": "Create a premium product poster for a transparent perfume bottle on wet black stone, with crisp studio lighting and elegant typography.",
  "n": 1,
  "size": "1536x1024",
  "quality": "auto",
  "output_format": "png"
}
```

### 顶层参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `model` | string | 是 | - | 模型 ID，例如 `gpt-image-2`。需匹配站点已启用的异步生图通道。 |
| `prompt` | string | 是 | - | 文本 prompt。建议写清主体、场景、材质、光线、构图、风格和需要渲染的文字。 |
| `n` | integer | 否 | 1 | 返回图片数量。异步场景建议先保持 1，便于控制成本与轮询逻辑。 |
| `size` | string | 否 | 模型默认 | 输出尺寸。具体可选值以所用模型为准，例如 `1024x1024`、`1536x1024`、`auto`。 |
| `quality` | string | 否 | 模型默认 | 渲染质量，常见取值 `auto`、`low`、`medium`、`high`。 |
| `output_format` | string | 否 | 模型默认 | 输出格式，常见取值 `png`、`jpeg`、`webp`。 |
| `output_compression` | integer | 否 | - | JPEG/WebP 压缩比例，范围 0 到 100。 |
| `background` | string | 否 | 模型默认 | 背景策略，是否支持透明取决于模型。 |
| `moderation` | string | 否 | 模型默认 | 内容过滤强度，常见取值 `auto`、`low`。 |
| `response_format` | string | 否 | - | 异步任务最终通过 `result_url` 取图；该字段可能被上游忽略。 |
| `async` | boolean | 否 | - | 体内容异步开关。若同时传查询参数 `async=`，**以查询参数为准**。推荐直接用 `?async=true`。 |

### 提交成功响应

HTTP `202 Accepted`：

```json
{
  "id": "task_abc123",
  "object": "image_task",
  "status": "queued",
  "created_at": 1777347817
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 公开任务 ID。后续查询均使用该值，对应路径参数 `{task_id}`。 |
| `object` | string | 固定为 `image_task`。 |
| `status` | string | 提交时通常为 `queued`。 |
| `created_at` | integer | 任务创建时间（Unix 秒）。 |

### cURL 示例

```bash
curl -X POST "https://v.openi.one/v1/images/generations?async=true" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: gen-20260713-001" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
    "n": 1,
    "size": "1536x1024",
    "quality": "auto",
    "output_format": "png"
  }'
```

## 3. GPT：提交异步编辑

`POST /v1/images/edits?async=true`

用于基于参考图做异步编辑或图生图。请求体与同步编辑一致；参考图通过 `images`（URL / base64）传入。

### 请求体

```json
{
  "model": "gpt-image-2",
  "prompt": "Place the product into the background scene and keep the product label sharp.",
  "images": [
    "https://example.com/product.png",
    "https://example.com/background.png"
  ],
  "size": "1536x1024",
  "quality": "high"
}
```

### 顶层参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `model` | string | 是 | - | 模型 ID。 |
| `prompt` | string | 是 | - | 编辑指令。建议说明保留哪些元素、修改哪些区域、目标风格和文字要求。 |
| `images` | array | 是 | - | 参考图列表。每个元素可以是 HTTP/HTTPS URL、`data:image/...;base64,...` data URL、纯 base64 字符串，或 `{"image_url":"..."}` / `{"url":"..."}` 对象。 |
| `image` | string / object | 否 | - | 单图输入别名，部分客户端会使用该字段；优先推荐 `images`。 |
| `mask` | string / object | 否 | - | 局部编辑遮罩。尺寸与格式通常需与待编辑图一致。 |
| `size` | string | 否 | 模型默认 | 输出尺寸。 |
| `quality` | string | 否 | 模型默认 | 渲染质量。 |
| `output_format` | string | 否 | 模型默认 | 输出格式。 |
| `moderation` | string | 否 | 模型默认 | 内容过滤强度。 |
| `async` | boolean | 否 | - | 体内容异步开关；查询参数 `async=` 优先。 |

`images` URL 下载规则与同步编辑接口一致：仅允许 `http`/`https`，禁止访问私有网段，单图大小与超时受网关限制。任一 URL 下载失败时，提交会返回 400。

### 提交成功响应

与异步生图相同，HTTP `202 Accepted`，返回 `image_task` 对象。

### cURL 示例

```bash
curl -X POST "https://v.openi.one/v1/images/edits?async=true" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "Replace the masked area with a flamingo-shaped pool float while preserving the original lighting.",
    "images": [
      "https://example.com/input.png"
    ],
    "size": "1024x1024",
    "quality": "high"
  }'
```

## 4. Gemini：提交异步生成

`POST /v1beta/models/{model}:generateContent?async=true`

用于 Gemini 原生 `generateContent` 路径的异步生图 / 图生图。请求体与同步 Gemini 调用一致；模型名写在路径 `{model}` 中，例如 `gemini-2.0-flash-preview-image-generation`。

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | Gemini 模型 ID，出现在路径中。 |

### 请求体示例（文生图）

```json
{
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
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

### 请求体示例（带参考图）

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
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

### 说明

| 项目 | 说明 |
| --- | --- |
| 请求体 | 与同步 `generateContent` 相同；网关按 Gemini 协议解析 `contents` / `generationConfig` 等字段。 |
| 异步开关 | 推荐 `?async=true`。也可在 JSON 顶层传 `"async": true`；两者同时存在时以查询参数为准。 |
| 成功响应 | 与 GPT 系列相同：HTTP `202 Accepted`，返回 `image_task`（含 `id`）。 |
| 结果获取 | 仍通过 `GET /v1/tasks/{task_id}` 读取 `result_url`，不在提交响应中直接返回图片。 |

### cURL 示例

```bash
curl -X POST "https://v.openi.one/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?async=true" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: gemini-gen-001" \
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
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

## 5. 查询任务

`GET /v1/tasks/{task_id}`

查询当前用户名下的异步任务状态与结果。该接口为统一任务查询入口，GPT / Gemini 异步生图任务与其它异步任务共用。

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `task_id` | string | 是 | 提交接口返回的 `id`。 |

### 成功响应

```json
{
  "code": "success",
  "message": "",
  "data": {
    "id": 1001,
    "created_at": 1777347817,
    "updated_at": 1777347900,
    "task_id": "task_abc123",
    "platform": "bananarouter",
    "user_id": 12,
    "group": "default",
    "channel_id": 3,
    "quota": 0,
    "action": "generate",
    "status": "SUCCESS",
    "fail_reason": "",
    "result_url": "https://cdn.example.com/task_abc123.png",
    "submit_time": 1777347817,
    "start_time": 1777347820,
    "finish_time": 1777347900,
    "progress": "100%",
    "properties": {},
    "data": {}
  }
}
```

### data 字段

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `task_id` | string | 公开任务 ID。 |
| `status` | string | 任务状态，见下方状态表。 |
| `progress` | string | 进度文本，例如 `0%`、`50%`、`100%`。 |
| `result_url` | string | 成功时的结果图 URL；未完成或不成功时可能为空。 |
| `fail_reason` | string | 失败原因。 |
| `action` | string | 任务动作，生图通常为 `generate`。 |
| `platform` | string | 上游平台标识。 |
| `submit_time` / `start_time` / `finish_time` | integer | 提交、开始、完成时间（Unix 秒）。 |
| `data` | object | 上游原始/扩展数据，结构因通道而异。 |

### 任务状态

| status | 说明 |
| --- | --- |
| `NOT_START` | 已落库但尚未开始。 |
| `SUBMITTED` | 已提交到上游。 |
| `QUEUED` | 排队中。 |
| `IN_PROGRESS` | 处理中（含上游 retry）。 |
| `SUCCESS` | 成功，可读取 `result_url`。 |
| `FAILURE` | 失败或过期，可读取 `fail_reason`。 |
| `UNKNOWN` | 未知状态。 |

### cURL 示例

```bash
curl -X GET "https://v.openi.one/v1/tasks/task_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 6. 接入代码示例

### TypeScript：GPT 提交并轮询

```ts
const BASE_URL = "https://v.openi.one";
const API_KEY = process.env.API_KEY!;

async function createImageTask() {
  const submitRes = await fetch(
    `${BASE_URL}/v1/images/generations?async=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `gen-${Date.now()}`,
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt:
          "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
        n: 1,
        size: "1536x1024",
        quality: "auto",
        output_format: "png",
      }),
    },
  );

  if (submitRes.status !== 202) {
    throw new Error(`submit failed: ${await submitRes.text()}`);
  }

  const task = (await submitRes.json()) as {
    id: string;
    status: string;
  };

  for (;;) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${BASE_URL}/v1/tasks/${task.id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = (await pollRes.json()) as {
      code: string;
      data: {
        status: string;
        result_url?: string;
        fail_reason?: string;
      };
    };

    const status = body.data.status;
    if (status === "SUCCESS") {
      console.log("result:", body.data.result_url);
      return body.data.result_url;
    }
    if (status === "FAILURE") {
      throw new Error(body.data.fail_reason || "task failed");
    }
  }
}

createImageTask().catch(console.error);
```

### TypeScript：Gemini 提交并轮询

```ts
const BASE_URL = "https://v.openi.one";
const API_KEY = process.env.API_KEY!;
const MODEL = "gemini-2.0-flash-preview-image-generation";

async function createGeminiImageTask() {
  const submitRes = await fetch(
    `${BASE_URL}/v1beta/models/${MODEL}:generateContent?async=true`,
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
                text: "Generate a futuristic cyberpunk city at night with cinematic lighting.",
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  if (submitRes.status !== 202) {
    throw new Error(`submit failed: ${await submitRes.text()}`);
  }

  const task = (await submitRes.json()) as { id: string };

  for (;;) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${BASE_URL}/v1/tasks/${task.id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = (await pollRes.json()) as {
      data: { status: string; result_url?: string; fail_reason?: string };
    };
    if (body.data.status === "SUCCESS") return body.data.result_url;
    if (body.data.status === "FAILURE") {
      throw new Error(body.data.fail_reason || "task failed");
    }
  }
}
```

### Python：GPT 提交并轮询

```python
import os
import time
import requests

BASE_URL = "https://v.openi.one"
API_KEY = os.environ["API_KEY"]

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

submit = requests.post(
    f"{BASE_URL}/v1/images/generations",
    params={"async": "true"},
    headers={**headers, "Idempotency-Key": "gen-demo-001"},
    json={
        "model": "gpt-image-2",
        "prompt": "Generate a futuristic cyberpunk city at night with cinematic lighting and ultra-high detail.",
        "n": 1,
        "size": "1536x1024",
        "quality": "auto",
        "output_format": "png",
    },
    timeout=60,
)
submit.raise_for_status()
task_id = submit.json()["id"]

while True:
    time.sleep(2)
    poll = requests.get(
        f"{BASE_URL}/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {API_KEY}"},
        timeout=30,
    )
    poll.raise_for_status()
    data = poll.json()["data"]
    status = data["status"]
    if status == "SUCCESS":
        print("result:", data.get("result_url"))
        break
    if status == "FAILURE":
        raise RuntimeError(data.get("fail_reason") or "task failed")
```

## 7. 常见错误码

提交接口错误响应示例：

```json
{
  "code": "async_image_api_disabled",
  "message": "async image API is disabled",
  "data": null
}
```

查询接口成功时使用 `code: "success"` 信封；失败时同样返回 `code` + `message`。

| HTTP 状态码 | 常见 code | 常见原因 |
| --- | --- | --- |
| 400 | invalid_request | 缺少 `model` / `prompt`（或 Gemini `contents`），JSON 格式错误，或参考图参数无效。 |
| 400 | async_image_channel_required | 选中通道未配置为异步生图通道。 |
| 401 | invalid_api_key | 未传 API Key、Key 无效或已过期。 |
| 403 | async_image_api_disabled | 站点未开启异步生图 API。 |
| 404 | task_not_exist | `task_id` 不存在，或不属于当前用户。 |
| 404 | 路由不存在 | `DELETE /v1/tasks/{task_id}` 已下线，请勿调用取消。 |
| 429 | rate_limited | 触发限流、额度不足或余额不足。 |
| 500 | get_task_failed / internal_error | 网关内部错误。 |
| 502 / 503 | upstream_error / internal_error | 上游异常或无可用异步通道。 |

## 8. 注意事项

| 项目 | 规则 |
| --- | --- |
| 同步 vs 异步 | 同一路径：不带 `async=true` 为同步；带 `async=true` 为异步并返回 `202` + `task_id`。 |
| GPT 路径 | `POST /v1/images/generations?async=true`、`POST /v1/images/edits?async=true`。 |
| Gemini 路径 | `POST /v1beta/models/{model}:generateContent?async=true`。 |
| 查询参数优先 | URL `async=` 与 JSON 体 `async` 同时存在时，以查询参数为准。 |
| 轮询建议 | 提交后建议间隔 1–3 秒轮询；任务完成后停止请求。 |
| 结果有效期 | `result_url` 可能有过期时间，成功后请尽快下载落盘。 |
| 幂等重试 | 网络抖动重试提交时，建议固定传入 `Idempotency-Key`。 |
| 权限范围 | 只能查询当前 API Key 对应用户自己的任务。 |
| 不可取消 | 不提供客户端取消；任务受理后即结算，失败由网关退款。 |
| 模型与通道 | 异步提交只会路由到已标记异步生图能力的通道；模型需在对应分组可用。 |
