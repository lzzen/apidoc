---
title: ImgTools
description: 图像工具接口，同步 POST /v1/imgtools，异步 POST /v1/aimgtools
---

# ImgTools

<p class="page-desc">图像工具接口。用 `action` 选择工具，同步走 `/v1/imgtools`，异步走 `/v1/aimgtools`。</p>

ImgTools 提供抠图、主体提取、修图、扩图等图像处理能力。客户端只需调用本站开放的两条 POST，并用 `action` 指定工具名。

## 1. 基本信息

| 项目 | 说明 |
| --- | --- |
| 接口类型 | 图像工具 API（同步 / 异步） |
| 认证方式 | Bearer Token（`Authorization: Bearer YOUR_API_KEY`） |
| 默认服务地址 | `https://v.openi.one` |
| 同步提交 | `POST /v1/imgtools`，成功返回处理结果 |
| 异步提交 | `POST /v1/aimgtools`，受理返回 `202` + 任务 `id` |
| 异步查询 | 同一路径，`action=query`，用 `task_id` 查询 |

### 调用路径

同步：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/imgtools</span></div>

异步提交 / 查询：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/aimgtools</span></div>

示例：

<div class="url-list">
  <div class="url-item">https://v.openi.one/v1/imgtools</div>
  <div class="url-item">https://v.openi.one/v1/aimgtools</div>
</div>

### 请求头

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | string | 是 | Bearer Token，格式为 `Bearer YOUR_API_KEY`。 |
| `Content-Type` | string | 是 | `application/x-www-form-urlencoded`、`multipart/form-data` 或 `application/json`。上传文件时用 multipart。 |

## 2. action 与工具

`action` 可以放在 POST body 或 URL query，body 优先。

| action | 说明 |
| --- | --- |
| `cutout` | 抠图 |
| `stamp-cutout` | 印章抠图 |
| `extract` | 主体提取 |
| `extract-v2` | 主体提取 v2 |
| `stamp-crop` | 印章裁切 |
| `stamp-upscale` | 印章超分 |
| `to-svg` | 转 SVG |
| `shadow` | 投影 |
| `retouch` | 修图 |
| `erase` | 消除 |
| `expand` | 扩图 |
| `watermark` | 水印 |
| `watermark-v2` | 水印 v2 |
| `query` | 仅异步查询，禁止出现在 `/v1/imgtools` |

本接口不提供图生图。需要图生图请使用本站生图接口（如 `/v1/images/*`、Gemini `generateContent`）。

各工具还可传 `image_url`、`image`、`crop`、`response` 等字段，具体以所用工具支持情况为准。

## 3. 同步调用

`POST /v1/imgtools` 必须带真实工具 `action`。`action=query` 或缺少 `action` 返回 400。

```bash
curl -X POST "https://v.openi.one/v1/imgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "action=cutout" \
  -d "image_url=https://example.com/photo.jpg" \
  -d "response=url"
```

上传本地文件：

```bash
curl -X POST "https://v.openi.one/v1/imgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "action=cutout" \
  -F "image=@photo.jpg" \
  -F "response=url"
```

成功时返回 JSON，结果图在 `data.result_file`（可能是站点 `/oss/...` 地址）。

## 4. 异步提交

`POST /v1/aimgtools` 带工具 `action` 时为提交。受理后返回 **202**，并按次计费。

```bash
curl -X POST "https://v.openi.one/v1/aimgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "action=cutout" \
  -d "image_url=https://example.com/photo.jpg" \
  -d "response=url"
```

```json
{
  "id": "task_xxxx",
  "object": "imgtools_task",
  "status": "queued",
  "created_at": 1710000000
}
```

后续查询请把返回的 `id` 当作 `task_id`。

## 5. 异步查询

同一条 `POST /v1/aimgtools`，`action=query`。查询不再扣费。

```bash
curl -X POST "https://v.openi.one/v1/aimgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "action=query" \
  -d "task_id=task_xxxx" \
  -d "response=url"
```

| `data.state` | 含义 |
| --- | --- |
| `0` | 处理中 |
| `1` | 成功，`data.result_file` 为结果图 |
| `2` | 失败，原因在 `data.message` / `fail_reason`，不会写进 `result_file` |

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "state": 1,
    "result_file": "https://v.openi.one/oss/...."
  }
}
```

## 6. 错误

| HTTP | 场景 |
| --- | --- |
| 400 | 缺少 `action`；同步路径使用 `action=query`；异步查询缺少 `task_id` |
| 401 / 403 | Bearer 无效或无权使用对应工具 |
| 404 | `action=query` 时任务不存在 |
| 502 / 503 | 服务暂时不可用 |
