# Dify API 代理接口补全总结（基于 packages/platform 最新代码）

本文档根据 `packages/platform` 的最新实现，汇总平台侧全部 Dify API 代理接口以及相关的客户端辅助接口，便于对齐联调和前后端使用方式。

## 已完成的接口

### 应用信息相关 (4个)

- `GET /api/client/dify/{appId}/info` — 获取应用基本信息
- `GET /api/client/dify/{appId}/meta` — 获取应用元数据
- `GET /api/client/dify/{appId}/site` — 获取应用站点设置
- `GET /api/client/dify/{appId}/parameters` — 获取应用参数

### 聊天与消息相关 (4个)

- `POST /api/client/dify/{appId}/chat-messages` — 发送聊天消息；当 `response_mode = 'streaming'` 时返回 SSE 流
- `POST /api/client/dify/{appId}/chat-messages/{taskId}/stop` — 停止聊天消息生成
- `POST /api/client/dify/{appId}/completion-messages` — 文本完成（流式输出）
- `GET /api/client/dify/{appId}/messages/{messageId}/suggested?user={user}` — 获取消息建议

### 会话管理相关 (4个)

- `GET /api/client/dify/{appId}/conversations?limit&last_id&sort_by&user` — 获取会话列表
- `GET /api/client/dify/{appId}/conversation/{conversationId}/messages?first_id&limit&user` — 获取会话消息历史
- `DELETE /api/client/dify/{appId}/conversation/{conversationId}` — 删除会话（请求体携带 `user`）
- `POST /api/client/dify/{appId}/conversation/{conversationId}/name` — 重命名会话（支持 `auto_generate`）

### 文件与媒体相关 (4个)

- `POST /api/client/dify/{appId}/files/upload` — 上传文件（`FormData` 透传）
- `GET /api/client/dify/{appId}/files/{fileId}/preview?as_attachment=true|false` — 文件预览/下载（二进制透传，保留 `Content-Type`/`Content-Disposition`）
- `POST /api/client/dify/{appId}/audio2text` — 音频转文字（追加 `user` 后转发到 Dify `/audio-to-text`）
- `POST /api/client/dify/{appId}/text2audio` — 文字转音频（转发到 Dify `/text-to-audio`，返回原始音频流）

### 反馈相关 (2个)

- `POST /api/client/dify/{appId}/feedback` — 提交消息反馈（请求体包含 `messageId`，服务端从请求头获取 `user` 并写入 `/messages/{messageId}/feedbacks`）
- `POST /api/client/dify/{appId}/messages/{messageId}/feedbacks` — 提交消息反馈（请求体需提供 `user`/`rating`/`content`）

### 工作流相关 (2个)

- `POST /api/client/dify/{appId}/workflows/run` — 运行工作流（流式输出，`response_mode = 'streaming'`）
- `GET /api/client/dify/{appId}/workflows/run?id={runId}` — 获取工作流运行结果

### 客户端辅助接口 (2个)

- `GET /api/client/apps` — 获取应用列表（过滤敏感信息，不返回 API Key）
- `GET /api/client/apps/{id}` — 获取单个应用详情（过滤敏感信息，不返回 API Key）

## 工具函数增强（lib/api-utils.ts）

- `handleApiError()` — 统一的 API 错误处理
- `createSafeApp()` — 创建安全的应用对象（隐藏敏感信息）
- `proxyDifyRequest()` — 代理 Dify API 请求的通用函数
- `createDifyResponseProxy()` — 创建 Dify 响应代理（适配流式/二进制场景）
- `createFormDataProxy()` — 生成 FormData 代理（文件上传场景）
- `createDifyApiResponse()` — 统一的 Dify API 响应格式（接口返回 `{ code, data }`）
- `getUserIdFromRequest()` — 从请求中获取用户ID（读取 `x-user-id`，默认 `anonymous`）

## 文件结构（平台版）

```
packages/platform/app/api/client/dify/[appId]/
├── info/route.ts                                  # 应用基本信息
├── meta/route.ts                                  # 应用元数据
├── site/route.ts                                  # 应用站点设置
├── parameters/route.ts                            # 应用参数
├── chat-messages/
│   ├── route.ts                                   # 发送聊天消息（支持 SSE 流）
│   └── [taskId]/stop/route.ts                     # 停止聊天消息生成
├── completion-messages/route.ts                   # 文本完成（流式输出）
├── conversations/route.ts                         # 获取会话列表
├── conversation/
│   └── [conversationId]/
│       ├── route.ts                               # 删除会话
│       ├── messages/route.ts                      # 获取会话消息历史
│       └── name/route.ts                          # 重命名会话
├── files/
│   ├── upload/route.ts                            # 上传文件
│   └── [fileId]/preview/route.ts                  # 文件预览/下载
├── audio2text/route.ts                            # 音频转文字
├── text2audio/route.ts                            # 文字转音频
├── feedback/route.ts                              # 提交消息反馈（按 messageId 写入）
├── messages/[messageId]/suggested/route.ts        # 获取消息建议
└── messages/[messageId]/feedbacks/route.ts        # 提交消息反馈（按路径参数写入）

packages/platform/app/api/client/apps/
├── route.ts                                       # 客户端获取应用列表（安全信息）
└── [id]/route.ts                                  # 客户端获取应用详情（安全信息）
```

## 设计要点与行为说明

- 鉴权与安全
  - 平台侧统一持有并转发 `Authorization: Bearer {API_KEY}`，客户端不会接触到实际 API Key。
  - 允许跨域头已在 `next.config.ts` 中配置，包含 `Access-Control-Allow-Headers: X-USER-ID`。
- 用户标识
  - 需要区分用户的接口（如会话相关、反馈相关）从请求头读取 `X-USER-ID`（代码中以 `x-user-id` 获取）。
  - 未提供时默认 `anonymous`，可按需在前端补齐。
- 响应形态
  - 流式接口（聊天/文本完成/工作流）使用 `createDifyResponseProxy()` 或 SSE 直透，便于前端以流方式消费。
  - 二进制接口（文件预览/下载、音频转换）保留原始 `Content-Type`/`Content-Disposition` 头部。
  - 其余接口多数返回统一结构 `{ code, data }`，也有少量直接 `NextResponse.json` 的情况（如列表查询）。

## 使用方式示例

- 基础 URL：`http://localhost:5300/api/client`
- 获取应用信息：
  ```typescript
  const appInfo = await fetch(`${API_BASE}/dify/${appId}/info`).then(r => r.json())
  ```
- 发送聊天消息（流式）：
  ```typescript
  const resp = await fetch(`${API_BASE}/dify/${appId}/chat-messages`, {
  	method: 'POST',
  	headers: { 'Content-Type': 'application/json' },
  	body: JSON.stringify({ query: '你好', response_mode: 'streaming' }),
  })
  // 使用 EventSource/SSE 方式或手动读取 Response.body 流
  ```
- 上传文件：
  ```typescript
  const formData = new FormData()
  formData.append('file', file)
  const upload = await fetch(`${API_BASE}/dify/${appId}/files/upload`, {
  	method: 'POST',
  	body: formData,
  })
  const result = await upload.json()
  ```
- 文件预览/下载：
  ```typescript
  const res = await fetch(`${API_BASE}/dify/${appId}/files/${fileId}/preview?as_attachment=true`)
  // 读取二进制并保存，或作为 Blob 使用
  ```
- 提交反馈（路径参数版）：
  ```typescript
  await fetch(`${API_BASE}/dify/${appId}/messages/${messageId}/feedbacks`, {
  	method: 'POST',
  	headers: { 'Content-Type': 'application/json' },
  	body: JSON.stringify({ user: userId, rating: 1, content: '👍' }),
  })
  ```
- 提交反馈（消息ID在体内）：
  ```typescript
  await fetch(`${API_BASE}/dify/${appId}/feedback`, {
  	method: 'POST',
  	headers: { 'Content-Type': 'application/json', 'X-USER-ID': userId },
  	body: JSON.stringify({ messageId, rating: 1, content: '👍' }),
  })
  ```

以上内容与 `packages/platform/app/api` 目录的最新实现保持一致，可作为前后端联调与文档展示的权威来源。
