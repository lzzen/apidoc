---
title: ImgTools
description: 图像工具接口，同步 POST /v1/imgtools，异步 POST /v1/aimgtools
---

# ImgTools

<p class="page-desc">图像工具接口。用站点 `action` 选择工具，同步走 `/v1/imgtools`，异步走 `/v1/aimgtools`。</p>

ImgTools 是站点的图像工具大类。上游目前是抠抠图（koukoutu），但客户端不要按官方原生路径或官方鉴权来调用。站点只开放两条 POST：同步创建、异步创建/查询。客户端用 `action` 指定工具名，站点转发前会改写成上游的 `model_key`。

## 1. 基本信息

| 项目 | 说明 |
| --- | --- |
| 渠道类型 | 控制台新建渠道，类型选 **ImgTools** |
| 密钥 | 渠道密钥填抠抠图 API Key，不要让客户端带 `X-API-Key` |
| 模型列表 | 填写 `action` 名称，例如 `background-removal` |
| 默认 Base URL | `https://sync.koukoutu.com`；异步请求会自动切到 `https://async.koukoutu.com` |
| 认证 | 只接受站点 Bearer Token |

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

不要传 `X-API-Key`。上游密钥只来自渠道配置。

站点不开放官方 `GET /v1/score`。

## 2. action 与工具

`action` 可以放在 POST body 或 URL query，body 优先。站点会删掉客户端的 `action`，再写成上游 `model_key`。查询时 `action=query`，上游不会收到 `model_key=query`。

| action | 说明 |
| --- | --- |
| `background-removal` | 普通抠图 |
| `stamp-background-removal` | 印章抠图 |
| `image-extract` | 主体提取 |
| `image-extract-v2` | 主体提取 v2 |
| `image-to-image` | 图生图 |
| `stamp-crop` | 印章裁切 |
| `upscale2stamp` | 超分到印章 |
| `image-to-svg` | 转 SVG |
| `image-shadow-v3` | 投影 |
| `image-retouch` | 修图 |
| `image-eliminate` | 消除 |
| `image-outpaint` | 扩图 |
| `image-watermark` | 水印 |
| `image-watermark-v2` | 水印 v2 |
| `query` | 仅异步查询，禁止出现在 `/v1/imgtools` |

各工具的其余官方字段（如 `image_url`、`image`、`crop`）原样透传。字段含义以 [抠抠图文档](https://doc.koukoutu.com/) 为准。

## 3. 同步抠图

`POST /v1/imgtools` 必须带真实工具 `action`。`action=query` 或缺少 `action` 返回 400。

```bash
curl -X POST "https://v.openi.one/v1/imgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "action=background-removal" \
  -d "image_url=https://example.com/photo.jpg" \
  -d "response=url"
```

上传本地文件：

```bash
curl -X POST "https://v.openi.one/v1/imgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "action=background-removal" \
  -F "image=@photo.jpg" \
  -F "response=url"
```

成功时返回上游风格 JSON，结果图在 `data.result_file`。若渠道开启了「替换上游图片 URL」，这里会是站点 `/oss/...` 地址。

## 4. 异步提交

`POST /v1/aimgtools` 带工具 `action` 时为提交。受理后返回 **202**，并按次计费，不能通过取消接口免计费。

```bash
curl -X POST "https://v.openi.one/v1/aimgtools" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "action=background-removal" \
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
| 401 / 403 | Bearer 无效或无权访问对应模型 |
| 404 | `action=query` 时任务不存在 |
| 502 | 上游失败或渠道不可用 |
