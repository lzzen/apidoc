---
title: 异步生图
description: 异步图像生成与编辑任务接口，支持提交、查询与取消
---

# 异步生图

<p class="page-desc">异步图像生成与编辑任务接口，支持提交、查询与取消</p>

异步生图接口用于提交耗时较长的图像生成 / 编辑任务。客户端先拿到 `task_id`，再通过统一任务查询接口轮询状态；任务成功后从 `result_url` 获取结果图。与同步接口 `POST /v1/images/generations`、`POST /v1/images/edits` 相互独立，互不影响。

## 1. 接口概览

| 项目 | 说明 |
| --- | --- |
| 接口类型 | 异步任务 API（提交 → 查询 / 取消） |
| 认证方式 | Bearer Token（`Authorization: Bearer YOUR_API_KEY`） |
| 默认服务地址 | `https://v.openi.one` |
| 提交成功状态码 | `202 Accepted` |
| 与同步接口关系 | 不改动同步 `/v1/images/*`；异步流量走 `/v1/tasks/*` |

### 调用路径

提交异步生图：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/tasks/images/generations</span></div>

提交异步编辑：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/tasks/images/edits</span></div>

查询任务：

<div class="endpoint-block"><span class="http-method get">GET</span><span class="http-path">{BASE_URL}/v1/tasks/{task_id}</span></div>

取消任务：

<div class="endpoint-block"><span class="http-method delete">DELETE</span><span class="http-path">{BASE_URL}/v1/tasks/{task_id}</span></div>

示例：

<div class="url-list">
  <div class="url-item">https://v.openi.one/v1/tasks/images/generations</div>
  <div class="url-item">https://v.openi.one/v1/tasks/images/edits</div>
  <div class="url-item">https://v.openi.one/v1/tasks/{task_id}</div>
</div>

### 推荐调用流程

1. 调用 `POST /v1/tasks/images/generations` 或 `POST /v1/tasks/images/edits` 提交任务，拿到 `id`（即 `task_id`）。
2. 轮询 `GET /v1/tasks/{task_id}`，观察 `status` 从 `QUEUED` / `IN_PROGRESS` 变为 `SUCCESS` 或 `FAILURE`。
3. 成功时读取 `result_url` 下载结果图；失败时读取 `fail_reason`。
4. 若任务仍在排队或运行中，可调用 `DELETE /v1/tasks/{task_id}` 取消（需站点开启取消能力）。

### 请求头

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | string | 是 | Bearer Token，格式为 `Bearer YOUR_API_KEY`。 |
| `Content-Type` | string | 提交时必填 | 提交接口使用 `application/json`。 |
| `Idempotency-Key` | string | 否 | 提交幂等键。相同 Key 的重复提交由上游/网关去重，适合重试场景。 |
| `X-Async-Callback-URL` | string | 否 | 任务完成回调地址。若上游支持 Webhook，将按该 URL 通知。 |
| `X-Async-Callback-Secret` | string | 否 | 回调签名密钥，与 `X-Async-Callback-URL` 配合使用。 |
| `X-Async-Expires-In` | string | 否 | 任务过期时间提示，透传给上游异步通道。 |

## 2. 提交异步生图

`POST /v1/tasks/images/generations`

请求体兼容 OpenAI Image API 文生图字段。`model` 与 `prompt` 为必填；其余参数按站点模型能力与上游通道支持情况生效。

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
| `id` | string | 公开任务 ID。后续查询、取消均使用该值，对应路径参数 `{task_id}`。 |
| `object` | string | 固定为 `image_task`。 |
| `status` | string | 提交时通常为 `queued`。 |
| `created_at` | integer | 任务创建时间（Unix 秒）。 |

### cURL 示例

```bash
curl -X POST "https://v.openi.one/v1/tasks/images/generations" \
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

## 3. 提交异步编辑

`POST /v1/tasks/images/edits`

用于基于参考图做异步编辑或图生图。请求体同样兼容 OpenAI Image API 风格；参考图通过 `images`（URL / base64）传入。

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

`images` URL 下载规则与同步编辑接口一致：仅允许 `http`/`https`，禁止访问私有网段，单图大小与超时受网关限制。任一 URL 下载失败时，提交会返回 400。

### 提交成功响应

与异步生图相同，HTTP `202 Accepted`，返回 `image_task` 对象。

### cURL 示例

```bash
curl -X POST "https://v.openi.one/v1/tasks/images/edits" \
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

## 4. 查询任务

`GET /v1/tasks/{task_id}`

查询当前用户名下的异步任务状态与结果。该接口为统一任务查询入口，异步生图 / 编辑任务与其它异步任务共用。

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
| `FAILURE` | 失败、取消或过期，可读取 `fail_reason`。 |
| `UNKNOWN` | 未知状态。 |

### cURL 示例

```bash
curl -X GET "https://v.openi.one/v1/tasks/task_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 5. 取消任务

`DELETE /v1/tasks/{task_id}`

取消仍可中止的异步任务。该能力受站点开关 `task_cancel_api_enabled` 控制；关闭时返回不可用错误。

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `task_id` | string | 是 | 待取消任务 ID。 |

### 成功响应

```json
{
  "code": "success",
  "message": "",
  "data": {
    "task_id": "task_abc123",
    "status": "FAILURE",
    "fail_reason": "cancelled by user",
    "progress": "100%"
  }
}
```

取消成功后，任务通常进入不可继续执行的终态（例如 `FAILURE`），具体文案以返回为准。已成功或已不可取消的任务会返回冲突类错误。

### cURL 示例

```bash
curl -X DELETE "https://v.openi.one/v1/tasks/task_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 6. 接入代码示例

### TypeScript：提交并轮询

```ts
const BASE_URL = "https://v.openi.one";
const API_KEY = process.env.API_KEY!;

async function createImageTask() {
  const submitRes = await fetch(`${BASE_URL}/v1/tasks/images/generations`, {
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
  });

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

### Python：提交并轮询

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
    f"{BASE_URL}/v1/tasks/images/generations",
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

查询 / 取消接口成功时使用 `code: "success"` 信封；失败时同样返回 `code` + `message`。

| HTTP 状态码 | 常见 code | 常见原因 |
| --- | --- | --- |
| 400 | invalid_request | 缺少 `model` / `prompt`，JSON 格式错误，或参考图参数无效。 |
| 400 | async_image_channel_required | 选中通道未配置为异步生图通道。 |
| 401 | invalid_api_key | 未传 API Key、Key 无效或已过期。 |
| 403 | async_image_api_disabled | 站点未开启异步生图 API。 |
| 404 | task_not_exist | `task_id` 不存在，或不属于当前用户。 |
| 409 | task_not_cancelable | 任务已进入不可取消终态。 |
| 429 | rate_limited | 触发限流、额度不足或余额不足。 |
| 500 | get_task_failed / cancel_task_failed / internal_error | 网关内部错误。 |
| 501 | task_cancel_api_disabled | 站点未开启任务取消 API。 |
| 502 / 503 | upstream_error / internal_error | 上游异常或无可用异步通道。 |

## 8. 注意事项

| 项目 | 规则 |
| --- | --- |
| 同步 vs 异步 | 同步请继续调用 `/v1/images/generations` 与 `/v1/images/edits`；异步请调用本文 `/v1/tasks/images/*`。 |
| 轮询建议 | 提交后建议间隔 1–3 秒轮询；任务完成后停止请求。 |
| 结果有效期 | `result_url` 可能有过期时间，成功后请尽快下载落盘。 |
| 幂等重试 | 网络抖动重试提交时，建议固定传入 `Idempotency-Key`。 |
| 权限范围 | 只能查询 / 取消当前 API Key 对应用户自己的任务。 |
| 模型与通道 | 异步提交只会路由到已标记异步生图能力的通道；模型需在对应分组可用。 |
