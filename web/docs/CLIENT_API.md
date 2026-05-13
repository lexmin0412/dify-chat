# 客户端 API 接口文档

本文档描述了 Dify Chat Platform 为客户端应用（如 react-app）提供的 API 接口。

## 基础信息

- **基础 URL**: `http://localhost:5300/api/client` (开发环境)
- **响应格式**: JSON
- **错误处理**: 统一的错误响应格式

## 应用管理 API

### 1. 获取应用列表

**接口**: `GET /api/client/apps`

**描述**: 获取所有可用的应用列表，API Key 会被隐藏以保护安全性。

**响应示例**:

```json
[
	{
		"id": "app-123",
		"info": {
			"name": "聊天助手",
			"description": "智能聊天助手应用",
			"tags": ["聊天", "AI"],
			"mode": "chat"
		},
		"requestConfig": {
			"apiBase": "https://api.dify.ai/v1",
			"apiKey": "******"
		}
	}
]
```

### 2. 获取单个应用详情

**接口**: `GET /api/client/apps/{id}`

**参数**:

- `id` (路径参数): 应用 ID

**描述**: 获取指定应用的详细信息，API Key 会被隐藏。

## Dify API 代理

所有 Dify API 请求都通过平台代理，确保 API Key 安全性。

### 应用信息 API

#### 1. 获取应用基本信息

- **接口**: `GET /api/client/dify/{appId}/info`
- **描述**: 获取应用的基本信息

#### 2. 获取应用元数据

- **接口**: `GET /api/client/dify/{appId}/meta`
- **描述**: 获取应用的元数据信息

#### 3. 获取应用站点设置

- **接口**: `GET /api/client/dify/{appId}/site`
- **描述**: 获取应用的站点配置信息

#### 4. 获取应用参数

- **接口**: `GET /api/client/dify/{appId}/parameters`
- **描述**: 获取应用的参数配置，包括开场白、建议问题等

### 聊天和消息 API

#### 5. 发送聊天消息

- **接口**: `POST /api/client/dify/{appId}/chat-messages`
- **请求体**:

```json
{
	"query": "你好",
	"conversation_id": "conv-123",
	"response_mode": "streaming",
	"inputs": {},
	"files": []
}
```

- **描述**: 向指定应用发送聊天消息，支持流式和非流式响应

#### 6. 停止聊天消息生成

- **接口**: `POST /api/client/dify/{appId}/chat-messages/{taskId}/stop`
- **描述**: 停止正在生成的聊天消息

#### 7. 发送完成消息（文本生成）

- **接口**: `POST /api/client/dify/{appId}/completion-messages`
- **请求体**:

```json
{
	"inputs": {}
}
```

- **描述**: 发送文本生成请求

### 会话管理 API

#### 8. 获取会话列表

- **接口**: `GET /api/client/dify/{appId}/conversations`
- **参数**: `limit` (查询参数): 返回数量限制，默认 20
- **描述**: 获取指定应用的会话列表

#### 9. 获取会话消息历史

- **接口**: `GET /api/client/dify/{appId}/conversation/{conversationId}/messages`
- **描述**: 获取指定会话的消息历史

#### 10. 删除会话

- **接口**: `DELETE /api/client/dify/{appId}/conversation/{conversationId}`
- **描述**: 删除指定的会话

#### 11. 重命名会话

- **接口**: `PUT /api/client/dify/{appId}/conversation/{conversationId}/name`
- **请求体**:

```json
{
	"name": "新会话名称",
	"auto_generate": false
}
```

- **描述**: 重命名指定的会话

### 文件和媒体 API

#### 12. 上传文件

- **接口**: `POST /api/client/dify/{appId}/files/upload`
- **请求体**: FormData 格式，包含文件
- **描述**: 上传文件到 Dify 平台

#### 13. 音频转文字

- **接口**: `POST /api/client/dify/{appId}/audio2text`
- **请求体**: FormData 格式，包含音频文件
- **描述**: 将音频文件转换为文字

#### 14. 文字转音频

- **接口**: `POST /api/client/dify/{appId}/text2audio`
- **请求体**:

```json
{
	"message_id": "msg-123",
	"text": "要转换的文字"
}
```

- **描述**: 将文字转换为音频

### 反馈和建议 API

#### 15. 提交消息反馈

- **接口**: `POST /api/client/dify/{appId}/feedback`
- **请求体**:

```json
{
	"messageId": "msg-123",
	"rating": "like",
	"content": "反馈内容"
}
```

- **描述**: 对消息进行点赞或点踩反馈

#### 16. 获取消息建议

- **接口**: `GET /api/client/dify/{appId}/messages/{messageId}/suggested`
- **描述**: 获取基于消息的建议问题

### 工作流 API

#### 17. 运行工作流

- **接口**: `POST /api/client/dify/{appId}/workflows/run`
- **请求体**:

```json
{
	"inputs": {}
}
```

- **描述**: 运行工作流，支持流式响应

#### 18. 获取工作流运行结果

- **接口**: `GET /api/client/dify/{appId}/workflows/run?id={runId}`
- **参数**: `id` (查询参数): 工作流运行 ID
- **描述**: 获取工作流的运行结果

## 错误响应格式

所有 API 在出错时都会返回统一的错误格式：

```json
{
	"error": "错误描述信息"
}
```

常见的 HTTP 状态码：

- `200`: 成功
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

### JavaScript/TypeScript 客户端

```typescript
// 获取应用列表
const getApps = async () => {
	const response = await fetch('/api/client/apps')
	if (!response.ok) {
		throw new Error('Failed to fetch apps')
	}
	return response.json()
}

// 获取单个应用
const getApp = async (id: string) => {
	const response = await fetch(`/api/client/apps/${id}`)
	if (!response.ok) {
		throw new Error('Failed to fetch app')
	}
	return response.json()
}

// 发送聊天消息
const sendMessage = async (appId: string, message: string) => {
	const response = await fetch(`/api/client/dify/${appId}/chat-messages`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: message,
			response_mode: 'streaming',
		}),
	})

	return response
}

// 上传文件
const uploadFile = async (appId: string, file: File) => {
	const formData = new FormData()
	formData.append('file', file)

	const response = await fetch(`/api/client/dify/${appId}/files/upload`, {
		method: 'POST',
		body: formData,
	})

	return response.json()
}
```

## 安全性说明

1. **API Key 保护**: 所有 Dify API 调用都在服务端进行，客户端永远不会接触到真实的 API Key
2. **请求代理**: 客户端通过平台代理访问 Dify API，增加了一层安全控制
3. **错误处理**: 统一的错误处理机制，避免敏感信息泄露

## 部署配置

### 开发环境

```bash
# 启动平台服务
cd packages/nextjs-admin
npm run dev

# 客户端应用配置
API_BASE_URL=http://localhost:5300/api/client
```

### 生产环境

```bash
# 客户端应用配置
API_BASE_URL=https://your-platform-domain.com/api/client
```

## 注意事项

1. 所有 API 请求都需要通过平台代理，不要直接调用 Dify API
2. 应用配置中的 API Key 在客户端 API 中会被隐藏，这是正常的安全措施
3. 流式响应需要特殊处理，参考上面的示例代码
4. 建议在客户端实现适当的错误处理和重试机制
5. 文件上传和音频转换接口使用 FormData 格式
6. 用户ID会自动从请求头中获取，客户端无需手动传递
