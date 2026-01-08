# `@dify-chat/api`

![version](https://img.shields.io/npm/v/@dify-chat/api) ![NPM Last Update](https://img.shields.io/npm/last-update/@dify-chat/api) ![NPM Downloads](https://img.shields.io/npm/dm/@dify-chat/api)

`@dify-chat/api` 是 [Dify Chat](https://github.com/lexmin0412/dify-chat) 项目中的一个包，它提供了一套完整的方法来操作 Dify 应用，包括获取应用信息、管理会话、发送消息等功能。

下面将介绍如何在你的应用中集成和使用它。

## 安装

通过 npm/yarn/pnpm 安装：

```bash
# npm
npm install @dify-chat/api

# yarn
yarn add @dify-chat/api

# pnpm
pnpm add @dify-chat/api
```

## 基本使用

```ts
import { createDifyApiInstance, DifyApi } from '@dify-chat/api'

// 创建实例方式1：使用工厂函数
const api = createDifyApiInstance({
	user: 'user123',
	apiBase: 'https://api.dify.ai/v1',
	apiKey: 'app-YOUR_API_KEY',
})

// 创建实例方式2：直接实例化
const api2 = new DifyApi({
	user: 'user123',
	apiBase: 'https://api.dify.ai/v1',
	apiKey: 'app-YOUR_API_KEY',
})

// 调用API
api.getAppInfo().then(appInfo => {
	console.log(appInfo)
})
```

## API 实例配置

实例化 `DifyApi` 时需要提供以下配置：

```ts
interface IDifyApiOptions {
	/**
	 * 用户标识
	 */
	user: string
	/**
	 * API 前缀，默认 https://api.dify.ai/v1
	 */
	apiBase: string
	/**
	 * Dify APP API 密钥
	 */
	apiKey: string
}
```

## API 方法

> 注意：开发此包的初衷是为了实现主项目 Dify Chat 的相关功能，所以并不是所有的官方 API 都会存在对应的方法。如需调用其他 API，请自行参考官方文档。

### 更新 API 配置

当需要切换应用时，可以更新 API 配置。

```ts
api.updateOptions({
	user: 'newUser',
	apiBase: 'https://api.dify.ai/v1',
	apiKey: 'app-NEW_API_KEY',
})
```

### 获取应用基本信息

```ts
const appInfo = await api.getAppInfo()
```

**返回值类型：**

```ts
interface IGetAppInfoResponse {
	name: string
	description: string
	tags: string[]
}
```

### 获取应用 Meta 信息

```ts
const appMeta = await api.getAppMeta()
```

**返回值类型：**

```ts
interface IGetAppMetaResponse {
	tool_icons: {
		dalle2: string
		api_tool: {
			background: string
			content: string
		}
	}
}
```

### 获取应用参数

```ts
const appParameters = await api.getAppParameters()
```

**返回值类型：**

```ts
interface IGetAppParametersResponse {
	opening_statement?: string
	user_input_form: IUserInputForm[]
	suggested_questions?: string[]
	suggested_questions_after_answer: {
		enabled: boolean
	}
	file_upload: {
		enabled: boolean
		allowed_file_extensions: string[]
		allowed_file_types: IFileType[]
		allowed_file_upload_methods: Array<'remote_url' | 'local_file'>
		fileUploadConfig: {
			file_size_limit: number
			batch_count_limit: number
			image_file_size_limit: number
			video_file_size_limit: number
			audio_file_size_limit: number
			workflow_file_upload_limit: number
		}
		image: {
			enabled: false
			number_limits: 3
			transfer_methods: ['local_file', 'remote_url']
		}
		number_limits: number
	}
	text_to_speech: {
		enabled: boolean
		autoPlay: 'enabled' | 'disabled'
		language: string
		voice: string
	}
	speech_to_text: {
		enabled: boolean
	}
}
```

### 会话管理

#### 获取会话列表

```ts
const conversations = await api.listConversations({ limit: 20 })
```

**参数：**

```ts
interface IListConversationsRequest {
	limit: number
}
```

**返回值类型：**

```ts
interface IGetConversationListResponse {
	data: IConversationItem[]
}

interface IConversationItem {
	created_at: number
	id: string
	inputs: Record<string, unknown>
	introduction: string
	name: string
	status: 'normal'
	updated_at: number
}
```

#### 重命名会话

```ts
await api.renameConversation({
	conversation_id: 'conversation_id',
	name: '新的会话名称',
})

// 自动生成名称
await api.renameConversation({
	conversation_id: 'conversation_id',
	auto_generate: true,
})
```

**参数：**

```ts
{
  conversation_id: string;
  name?: string;
  auto_generate?: boolean;
}
```

#### 删除会话

```ts
await api.deleteConversation('conversation_id')
```

#### 获取会话历史消息

```ts
const history = await api.listMessages('conversation_id')
```

**返回值类型：**

```ts
interface IListMessagesResponse {
	data: IMessageItem[]
}

interface IMessageItem {
	id: string
	conversation_id: string
	inputs: Record<string, string>
	query: string
	answer: string
	message_files: []
	feedback?: {
		rating: 'like' | 'dislike'
	}
	status: 'normal' | 'error'
	error: string | null
	agent_thoughts?: IAgentThought[]
	created_at: number
	retriever_resources?: IRetrieverResource[]
}
```

### 消息相关

#### 发送消息

```ts
const response = await api.sendMessage({
	conversation_id: 'conversation_id', // 可选，不传则创建新会话
	inputs: {
		// 输入参数，键值对形式
		param1: 'value1',
	},
	files: [], // 附件，可以是远程URL或本地上传的文件ID
	user: 'user123',
	response_mode: 'streaming',
	query: '你好，请问...',
})
```

**参数：**

```ts
{
  conversation_id?: string;
  inputs: Record<string, string>;
  files: IFile[];
  user: string;
  response_mode: 'streaming';
  query: string;
}
```

#### 文件类型定义

```ts
export type IFileType = 'document' | 'image' | 'audio' | 'video' | 'custom'

export interface IFileBase {
	type: IFileType
}

export interface IFileRemote extends IFileBase {
	transfer_method: 'remote_url'
	url?: string
}

export interface IFileLocal extends IFileBase {
	transfer_method: 'local_file'
	upload_file_id?: string
}

export type IFile = IFileRemote | IFileLocal
```

#### 停止生成

```ts
await api.stopTask('taskId')
```

#### 获取下一轮建议问题

```ts
const suggestions = await api.getNextSuggestions({
	message_id: 'message_id',
})
```

**返回值类型：**

```ts
{
  data: string[]
}
```

#### 消息反馈

```ts
await api.createMessageFeedback({
	messageId: 'message_id',
	rating: 'like', // 'like' | 'dislike' | null
	content: '反馈内容',
})
```

**参数：**

```ts
{
	messageId: string
	rating: 'like' | 'dislike' | null
	content: string
}
```

### 文件操作

#### 上传文件

```ts
const fileInfo = await api.uploadFile(file)
```

**参数：**

- `file`: 浏览器 File 对象

**返回值类型：**

```ts
interface IUploadFileResponse {
	id: string
	name: string
	size: number
	extension: string
	mime_type: string
	created_by: number
	created_at: number
}
```

### 语音相关

#### 文字转语音

```ts
// 通过消息ID转换
const audioResponse = await api.text2Audio({
	message_id: 'message_id',
})

// 通过文本内容转换
const audioResponse2 = await api.text2Audio({
	text: '要转换的文本内容',
})
```

**参数：**

```ts
| {
    message_id: string;
  }
| {
    text: string;
  }
```

#### 语音转文字

```ts
const textResponse = await api.audio2Text(audioFile)
```

**参数：**

- `audioFile`: 语音文件。支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'] 文件大小限制：15MB

**返回值类型：**

```ts
interface IAudio2TextResponse {
	text: string
}
```

### 工作流相关

#### 执行 workflow

```ts
const workflowResponse = await api.runWorkflow({
	inputs: {
		// 输入参数，键值对形式
		param1: 'value1',
		param2: [
			/* 文件数组 */
		],
	},
})
```

参数：

```ts
{
	inputs: Record<string, IFile[] | unknown>
}
```

#### 获取 workflow 执行情况

```ts
const workflowResult = await api.getWorkflowResult({
	workflow_run_id: 'workflow_run_id',
})
```

参数：

```ts
{
	workflow_run_id: string
}
```

响应体：

```ts
{
	/** workflow 执行 ID */
	id: string
	/** 关联的 Workflow ID */
	workflow_id: string
	/** 执行状态 running / succeeded / failed / stopped */
	status: string
	/** 任务输入内容 */
	inputs: object
	/** 任务输出内容 */
	outputs: object
	/** 错误原因 */
	error: string
	/** 任务执行总步数 */
	total_steps: number
	/** 任务执行总 tokens */
	total_tokens: number
	/** 任务开始时间 */
	created_at: number
	/** 任务结束时间 */
	finished_at: number
	/** 耗时(s) */
	elapsed_time: number
}
```

### 文本生成相关

#### 执行文本生成

```ts
const completionResponse = await api.completion({
	inputs: {
		// 输入参数，键值对形式
		param1: 'value1',
		param2: [
			/* 文件数组 */
		],
	},
})
```

参数：

```ts
{
	inputs: Record<string, IFile[] | unknown>
}
```

## 完整事件类型

API 响应中包含各种事件类型，完整定义如下：

```ts
export enum EventEnum {
	MESSAGE = 'message',
	AGENT_MESSAGE = 'agent_message',
	AGENT_THOUGHT = 'agent_thought',
	MESSAGE_FILE = 'message_file',
	MESSAGE_END = 'message_end',
	TTS_MESSAGE = 'tts_message',
	TTS_MESSAGE_END = 'tts_message_end',
	MESSAGE_REPLACE = 'message_replace',
	ERROR = 'error',
	PING = 'ping',
	WORKFLOW_STARTED = 'workflow_started',
	WORKFLOW_FINISHED = 'workflow_finished',
	WORKFLOW_NODE_STARTED = 'node_started',
	WORKFLOW_NODE_FINISHED = 'node_finished',
}
```

## 示例：完整的对话流程

```ts
import { createDifyApiInstance } from '@dify-chat/api'

async function chatExample() {
	// 1. 创建API实例
	const api = createDifyApiInstance({
		user: 'user123',
		apiBase: 'https://api.dify.ai/v1',
		apiKey: 'app-YOUR_API_KEY',
	})

	// 2. 获取应用信息
	const appInfo = await api.getAppInfo()
	console.log('应用信息:', appInfo)

	// 3. 获取应用参数
	const appParams = await api.getAppParameters()
	console.log('应用参数:', appParams)

	// 4. 发送消息
	const messageStream = await api.sendMessage({
		inputs: {},
		files: [],
		user: 'user123',
		response_mode: 'streaming',
		query: '你好，请介绍一下自己',
	})

	// 5. 处理流式响应
	const reader = messageStream.body.getReader()
	const decoder = new TextDecoder()

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		const chunk = decoder.decode(value)
		const lines = chunk.split('\n').filter(line => line.trim() !== '')

		for (const line of lines) {
			if (line.startsWith('data: ')) {
				const data = JSON.parse(line.substring(6))
				console.log('收到事件:', data.event)

				if (data.event === 'message') {
					console.log('AI回复内容:', data.answer)
				} else if (data.event === 'error') {
					console.error('错误:', data.message)
				} else if (data.event === 'message_end') {
					console.log('消息结束')
				}
			}
		}
	}
}
```

## 注意事项

1. 所有 API 方法均返回 Promise，可以使用 async/await 或 .then() 处理
2. 消息发送采用流式响应，需要处理 ReadableStream
3. API 密钥格式通常为 `app-XXXXXXXX`，需要从 Dify 控制台获取
4. 用户ID可以是任意字符串，用于标识用户身份，便于区分不同用户的会话
