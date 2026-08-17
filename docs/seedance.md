---
title: Seedance 视频与素材库
description: Seedance 2.0 视频提交/查询，以及 BananaRouter 兼容素材库 Action 代理（尚未正式上线）
---

# Seedance 视频与素材库

<p class="page-desc">Seedance 2.0 视频提交/查询，以及 BananaRouter 兼容素材库 Action 代理</p>

::: warning 尚未正式上线
本接口文档仅供内部预览，**尚未正式对外开放**。路径、字段与能力可能变更；请勿用于生产接入。正式上线后会重新加入文档侧栏。
:::

本页描述站点对 **Seedance / 豆包视频** 与 **素材库（Asset）** 的对外接口。视频走既有异步视频任务路由；素材库以本站令牌调用，网关按渠道 BaseURL + Key 转发 BananaRouter「新版 Action」接口，**客户端不能指定上游主机**。

上游能力说明可参考 [BananaRouter Seedance 2.0 文档](https://bananarouter.com/docs/doubao-seedance-2-0#%E6%96%B0%E7%89%88%E6%8E%A5%E5%8F%A3%E6%8E%A8%E8%8D%90)。素材库请求/响应体由上游透传，字段以渠道实际上游为准。

## 1. 接口概览

| 项目 | 说明 |
| --- | --- |
| 接口类型 | 异步视频任务 + 素材库 Action 代理 |
| 认证方式 | Bearer Token（`Authorization: Bearer YOUR_API_KEY`） |
| 默认服务地址 | `https://v.openi.one` |
| 推荐模型 | `doubao-seedance-2-0-260128`（Fast：`doubao-seedance-2-0-fast-260128`） |
| 视频提交 | `POST /v1/video/generations`（兼容别名 `POST /v1/videos`） |
| 视频查询 | `GET /v1/video/generations/{task_id}`（兼容别名 `GET /v1/videos/{task_id}`） |
| 素材库（推荐） | `POST /api/v3/assets/01/?Action={Action}&Version=2026-07-20` |
| 素材库（别名） | `POST /doubao/open/{Action}` |

### 调用路径

提交视频：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/v1/video/generations</span></div>

查询视频：

<div class="endpoint-block"><span class="http-method get">GET</span><span class="http-path">{BASE_URL}/v1/video/generations/{task_id}</span></div>

素材库 Action（BananaRouter 兼容）：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/api/v3/assets/01/?Action={Action}&Version=2026-07-20</span></div>

素材库别名：

<div class="endpoint-block"><span class="http-method post">POST</span><span class="http-path">{BASE_URL}/doubao/open/{Action}</span></div>

示例：

<div class="url-list">
  <div class="url-item">https://v.openi.one/v1/video/generations</div>
  <div class="url-item">https://v.openi.one/v1/video/generations/{task_id}</div>
  <div class="url-item">https://v.openi.one/api/v3/assets/01/?Action=CreateAssetGroup&Version=2026-07-20</div>
  <div class="url-item">https://v.openi.one/doubao/open/CreateAsset</div>
</div>

### 推荐调用流程（含素材）

1. 调用 `CreateAssetGroup` 创建素材组，拿到 `GroupId` / `Id`。
2. 调用 `CreateAsset`，传入 `GroupId` 与公网可访问的 `URL`，拿到素材 `Id`。
3. 轮询 `GetAsset`，直到素材状态为 `Active`（具体字段名以上游响应为准，常见为 `Result.Status`）。
4. 提交视频任务；参考图/视频/音频可用 `asset://{AssetId}`（写在 `metadata.content` 中）。
5. 轮询 `GET /v1/video/generations/{task_id}`，成功时从 `data.result_url` 取视频地址。

### 请求头（共用）

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Authorization` | string | 是 | 本站令牌，格式 `Bearer YOUR_API_KEY`。网关再用所选渠道的 Key 作为上游 Bearer。 |
| `Content-Type` | string | 提交时必填 | 通常为 `application/json`。 |

## 2. 计费说明（按秒）

| 成本项 | 规则 |
| --- | --- |
| 模型单价配置 | 站点侧将 Seedance 模型价格配置为**按秒单价**（与后台模型倍率一致）。 |
| 时长倍率 | 预扣时写入 `OtherRatios["seconds"]`，等于请求时长（秒），与单价相乘。 |
| 时长来源优先级 | `metadata.duration` → 顶层 `duration` → 顶层 `seconds` → 默认 `5`。 |
| 分辨率 / 视频输入 | 部分模型还会叠加 `video_input` 相对倍率（如 1080p/4K、含参考视频时），以渠道价格表为准。 |
| 结算 | 任务受理即按上述倍率预扣；完成时保持按秒预扣口径，不按上游 token 再抬高时长。 |

运维配置提示：后台模型价格按「每秒」单位配置后，客户端传 `seconds=8`（或等价 `duration`）时，用量日志中应出现 `OtherRatios.seconds = 8`。

## 3. 视频：提交任务

`POST /v1/video/generations`

兼容别名：`POST /v1/videos`（OpenAI Videos 风格路径；响应形态见下文「OpenAI 兼容查询」）。

网关将站点任务请求转换为上游 Doubao/BananaRouter 的 `POST {channelBase}/api/v3/contents/generations/tasks`。客户端**不要**直接拼上游主机。

### 请求体（站点任务格式）

```json
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "一位短发女生在街头回头微笑，电影感，镜头稳定推进",
  "seconds": "5",
  "images": ["https://example.com/first-frame.png"],
  "metadata": {
    "resolution": "720p",
    "ratio": "16:9",
    "watermark": false,
    "generate_audio": true
  }
}
```

使用素材库 `asset://` 引用（推荐写在 `metadata.content`）：

```json
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "让人物轻微点头并向镜头挥手",
  "seconds": "5",
  "metadata": {
    "resolution": "720p",
    "watermark": false,
    "content": [
      {
        "type": "image_url",
        "image_url": { "url": "asset://asset-xxxxxxxx" },
        "role": "first_frame"
      }
    ]
  }
}
```

### 顶层参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `model` | string | 是 | - | 站点已启用的 Seedance 模型 ID，例如 `doubao-seedance-2-0-260128`。 |
| `prompt` | string | 是 | - | 文本提示词。网关会映射为上游 `content` 中的 `text` 项。 |
| `seconds` | string | 否 | 见计费节 | 视频时长（秒），字符串形式，如 `"8"`。与 `duration` / `metadata.duration` 二选一即可。 |
| `duration` | integer | 否 | 见计费节 | 视频时长（秒），整数形式。 |
| `images` | string[] | 否 | - | 参考图 URL 列表；网关映射为上游 `image_url` 内容项。 |
| `image` | string | 否 | - | 单图别名；无 `images` 时可由网关归一为 `images`。 |
| `metadata` | object | 否 | - | 透传/映射到上游的扩展字段（见下表）。 |

### metadata 常用字段

以下字段由网关反序列化进上游任务体；未列出的字段也可能被上游接受，以渠道实际上游为准。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | array | 否 | 多模态内容数组。元素可含 `type`（`text` / `image_url` / `video_url` / `audio_url`）、对应 URL 对象，以及 `role`（如 `first_frame`、`last_frame`、`reference_image`、`reference_video`、`reference_audio`）。URL 可为公网链接或 `asset://{AssetId}`。 |
| `resolution` | string | 否 | 输出分辨率，常见 `480p`、`720p`、`1080p`、`4k`（能力因模型而异）。 |
| `ratio` | string | 否 | 画幅比，常见 `16:9`、`9:16`、`1:1`、`adaptive` 等。 |
| `duration` | integer | 否 | 时长（秒）；优先于顶层 `duration`/`seconds` 参与计费与上游映射。 |
| `watermark` | boolean | 否 | 是否加水印。 |
| `generate_audio` | boolean | 否 | 是否生成同步音频。 |
| `seed` | integer | 否 | 随机种子。 |
| `callback_url` | string | 否 | 上游回调地址（若渠道支持）。 |
| `tools` | array | 否 | 如 `[{"type":"web_search"}]`；生产前请先验证渠道是否开通。 |

说明：若同时提供顶层 `prompt` 与 `metadata.content` 中的 text，网关会去掉 content 里原有 text 项后再追加顶层 `prompt`，以避免重复文本。

### 提交成功响应

`POST /v1/video/generations` 成功时返回 OpenAI Videos 风格对象（HTTP `200`）：

```json
{
  "id": "task_abc123",
  "task_id": "task_abc123",
  "object": "video",
  "model": "doubao-seedance-2-0-260128",
  "status": "queued",
  "progress": 0,
  "created_at": 1777347817
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 本站公开任务 ID，后续查询使用。 |
| `object` | string | 固定为 `video`。 |
| `status` | string | 提交时通常为 `queued`。 |
| `model` | string | 请求使用的模型名。 |
| `created_at` | integer | 创建时间（Unix 秒）。 |

### cURL 示例

```bash
curl -X POST "https://v.openi.one/v1/video/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "prompt": "一位短发女生在街头回头微笑，电影感，镜头稳定推进",
    "seconds": "5",
    "metadata": {
      "resolution": "720p",
      "ratio": "16:9",
      "watermark": false
    }
  }'
```

## 4. 视频：查询任务

### 通用查询（推荐）

`GET /v1/video/generations/{task_id}`

响应为站点统一任务包装：

```json
{
  "code": "success",
  "data": {
    "task_id": "task_abc123",
    "status": "SUCCESS",
    "progress": "100%",
    "result_url": "https://v.openi.one/oss/....mp4",
    "fail_reason": "",
    "created_at": 1777347817,
    "updated_at": 1777347901
  }
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `data.task_id` | string | 本站任务 ID。 |
| `data.status` | string | 常见 `QUEUED` / `IN_PROGRESS` / `SUCCESS` / `FAILURE`。 |
| `data.result_url` | string | 成功时的视频地址。若站点开启结果 URL 替换，可能是本站 `/oss/...` 路径。 |
| `data.fail_reason` | string | 失败原因；不要把失败信息当作 `result_url`。 |
| `data.progress` | string | 进度字符串，如 `50%`、`100%`。 |

### OpenAI 兼容查询

`GET /v1/videos/{task_id}` 返回 OpenAI Videos 对象；成功时视频地址通常在 `metadata.url`：

```json
{
  "id": "task_abc123",
  "object": "video",
  "model": "doubao-seedance-2-0-260128",
  "status": "completed",
  "progress": 100,
  "created_at": 1777347817,
  "completed_at": 1777347901,
  "metadata": {
    "url": "https://cdn.example.com/v.mp4"
  }
}
```

### 查询 cURL

```bash
curl -X GET "https://v.openi.one/v1/video/generations/task_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 5. 素材库 Action 代理

素材接口兼容 BananaRouter「新版 Action」推荐路径。网关行为：

1. 校验本站令牌，并按模型选择渠道。
2. 用**渠道 BaseURL 的主机**构造上游地址：`{channelBase}/api/v3/assets/01/?Action=...&Version=...`。
3. 将请求体原样转发；上游响应状态码、Content-Type 与正文透传给客户端。
4. **忽略**客户端想指定的任意上游主机；无渠道凭据时返回 `401`。

### 选渠方式

| 参数 | 位置 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `model` | Query | 否 | `doubao-seedance-2-0-260128` | 用于选择渠道的模型名。 |
| `X-Seedance-Model` | Header | 否 | 同上 | 与 Query `model` 二选一；**Query 优先**。 |

注意：选渠依赖 Query/Header，**不是**请求体里的 `model` 字段。若上游本身也接受 body 内 `model`，可同时传，但不影响本站选渠。

### Action 列表（白名单）

仅以下 Action 可通过代理；其它 Action 返回 `400`。

| Action | 用途 |
| --- | --- |
| `CreateAssetGroup` | 创建素材组 |
| `ListAssetGroups` | 列出素材组 |
| `GetAssetGroup` | 查询单个素材组 |
| `UpdateAssetGroup` | 更新素材组 |
| `DeleteAssetGroup` | 删除素材组（是否被上游接受取决于渠道） |
| `CreateAsset` | 从公网 URL 创建素材 |
| `ListAssets` | 列出素材 |
| `GetAsset` | 查询单个素材 |
| `UpdateAsset` | 更新素材 |
| `DeleteAsset` | 删除素材 |

### Version

| 参数 | 位置 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `Version` | Query | 否 | `2026-07-20` | BananaRouter 新版 Action API 版本。别名路径 `/doubao/open/{Action}` 未带 Version 时同样默认该值。 |
| `Action` | Query 或路径 | 是 | - | 推荐路径用 Query `Action`；别名路径用路径参数 `{Action}`。 |

### 路径对照

| 方式 | 方法 | 路径 |
| --- | --- | --- |
| BananaRouter 兼容（推荐） | `POST` | `/api/v3/assets/01/?Action={Action}&Version=2026-07-20` |
| 同左（无尾斜杠） | `POST` | `/api/v3/assets/01?Action={Action}&Version=2026-07-20` |
| new-api 兼容别名 | `POST` | `/doubao/open/{Action}` |

### 请求体字段（常见约定）

网关**不解析、不改写**素材请求体，以下为上游常见字段摘要，便于联调；完整 schema 以 BananaRouter / 火山方舟素材文档为准。

#### CreateAssetGroup

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Name` | string | 是 | 素材组名称。 |
| `Description` | string | 否 | 描述。 |
| `GroupType` | string | 否 | 常见默认 `AIGC`。 |
| `model` | string | 否 | 部分上游用于素材池路由；本站选渠仍看 Query/Header。 |

#### CreateAsset

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `GroupId` | string | 是 | 素材组 ID。 |
| `URL` | string | 是 | 公网可访问的 HTTPS 媒体地址。**不是** multipart 上传。 |
| `Name` | string | 否 | 素材名称。 |
| `AssetType` | string | 否 | 常见 `Image` / `Video` / `Audio`；默认多为 `Image`。 |
| `model` | string | 否 | 同上，上游素材池路由用。 |

#### GetAsset / UpdateAsset / DeleteAsset

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Id` | string | 是 | 素材 ID。 |

#### GetAssetGroup / UpdateAssetGroup / DeleteAssetGroup

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Id` | string | 是 | 素材组 ID。 |

#### ListAssets / ListAssetGroups

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `PageNumber` | integer | 否 | 常见默认 `1`。 |
| `PageSize` | integer | 否 | 常见默认 `20`，上限因上游而异。 |
| 其它过滤字段 | - | 否 | 如按组、名称过滤等，以上游为准。 |

### 响应形态

成功时多为火山/ARK 风格包装（字段名可能随上游略有差异）：

```json
{
  "ResponseMetadata": {
    "RequestId": "req-...",
    "Action": "CreateAsset",
    "Version": "2026-07-20"
  },
  "Result": {
    "Id": "asset-xxxxxxxx"
  }
}
```

本站鉴权/代理错误示例：

```json
{
  "error": {
    "message": "unauthorized: missing channel credentials",
    "type": "authentication_error"
  }
}
```

| HTTP | 常见含义 |
| --- | --- |
| `401` | 无本站令牌，或渠道缺少 BaseURL/Key。 |
| `400` | Action 不在白名单，或渠道 BaseURL 非法。 |
| `502` | 转发上游失败。 |
| 其它 | 上游原样状态码与正文。 |

### CreateAssetGroup 示例

推荐路径：

```bash
curl -X POST "https://v.openi.one/api/v3/assets/01/?Action=CreateAssetGroup&Version=2026-07-20&model=doubao-seedance-2-0-260128" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "demo-group",
    "Description": "seedance asset demo",
    "GroupType": "AIGC"
  }'
```

别名路径：

```bash
curl -X POST "https://v.openi.one/doubao/open/CreateAssetGroup?model=doubao-seedance-2-0-260128" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Seedance-Model: doubao-seedance-2-0-260128" \
  -d '{
    "Name": "demo-group",
    "GroupType": "AIGC"
  }'
```

### CreateAsset 示例

```bash
curl -X POST "https://v.openi.one/api/v3/assets/01/?Action=CreateAsset&Version=2026-07-20&model=doubao-seedance-2-0-260128" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "GroupId": "group-xxxxxxxx",
    "Name": "demo-asset-1",
    "AssetType": "Image",
    "URL": "https://example.com/demo-image.jpg"
  }'
```

### GetAsset 轮询示例

```bash
curl -X POST "https://v.openi.one/api/v3/assets/01/?Action=GetAsset&Version=2026-07-20&model=doubao-seedance-2-0-260128" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"Id":"asset-xxxxxxxx"}'
```

请轮询直到上游返回可用状态（常见 `Result.Status = "Active"`）后再用于视频任务。

## 6. 支持的模型 ID

以站点实际启用的模型与渠道映射为准。代码侧常见 ID：

| 模型 ID | 说明 |
| --- | --- |
| `doubao-seedance-2-0-260128` | Seedance 2.0 标准（素材选渠默认值） |
| `doubao-seedance-2-0-fast-260128` | Seedance 2.0 Fast |
| `doubao-seedance-2.0` | 显示名/别名（需渠道 `model_mapping` 时映射到上游） |
| `doubao-seedance-2.0-fast` | Fast 显示名/别名 |
| `doubao-seedance-1-5-pro-251215` 等 | 1.x 系列（若渠道仍配置） |

## 7. 已知缺口与注意点

| 要求 | 说明 |
| --- | --- |
| 素材请求体完整 schema | 本站代理透传；`CreateAsset`/`CreateAssetGroup` 等字段以 BananaRouter / 上游文档为准，本文仅列常见必填项。 |
| `DeleteAssetGroup` | 本站白名单允许转发；若上游未实现，会收到上游错误。 |
| 客户端指定上游 | **不支持**。上游主机只来自渠道 BaseURL。 |
| 直接调用上游视频路径 | 客户端应使用本站 `/v1/video/generations`，不要自行调用渠道的 `/api/v3/contents/generations/tasks`。 |
| 取消接口 | `/v1/video/generations/{id}` 与 `/v1/videos/{id}` 在路由上存在 DELETE，但异步计费场景请按产品策略谨慎使用；异步生图统一任务接口不提供取消。 |
| 媒体限制 | 图片/视频/音频大小、时长、格式限制由上游执行，网关素材代理不做二次校验。 |
