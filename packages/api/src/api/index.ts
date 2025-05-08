import { IDifyAppItem } from '@dify-chat/core'

import XRequest from './../base-request'
import { IAgentThought, IRetrieverResource } from './../types'
import { IFileType } from './../types/file'

/**
 * 用户输入表单控件类型
 */
export type IUserInputFormItemType =
	| 'text-input'
	| 'paragraph'
	| 'select'
	| 'number'
	| 'file'
	| 'file-list'

/**
 * 用户输入表单控件对象
 */
export interface IUserInputFormItemValueBase {
	default: string
	label: string
	required: boolean
	variable: string
	options?: string[]
	/**
	 * 最大长度
	 */
	max_length?: number
	type: IUserInputFormItemType
	allowed_file_types?: IFileType[]
}

/**
 * 应用输入配置
 */
export type IUserInputForm = Record<IUserInputFormItemType, IUserInputFormItemValueBase>

/**
 * 获取应用参数-响应体
 */
export interface IGetAppParametersResponse {
	/**
	 * 开场白
	 */
	opening_statement?: string
	/**
	 * 用户输入表单
	 */
	user_input_form: IUserInputForm[]
	/**
	 * 开场建议问题
	 */
	suggested_questions?: string[]
	/**
	 * 下一轮问题建议
	 */
	suggested_questions_after_answer: {
		/**
		 * 是否启用
		 */
		enabled: boolean
	}
	/**
	 * 文件上传参数
	 */
	file_upload: {
		/**
		 * 是否允许上传文件
		 */
		enabled: boolean
		/**
		 * 允许上传的文件后缀名
		 */
		allowed_file_extensions: string[]
		/**
		 * 允许上传的文件类型
		 */
		allowed_file_types: IFileType[]
		/**
		 * 允许的上传方式 - remote_url-远程地址 local_file-本地文件
		 */
		allowed_file_upload_methods: Array<'remote_url' | 'local_file'>
		/**
		 * 文件上传配置
		 */
		fileUploadConfig: {
			/**
			 * 文件大小限制（单位：MB）
			 */
			file_size_limit: number
			/**
			 * 批量上传文件数量限制
			 */
			batch_count_limit: number
			/**
			 * 图片文件大小限制（单位：MB）
			 */
			image_file_size_limit: number
			/**
			 * 视频文件大小限制（单位：MB）
			 */
			video_file_size_limit: number
			/**
			 * 音频文件大小限制（单位：MB）
			 */
			audio_file_size_limit: number
			/**
			 * 工作流文件上传限制（单位：MB）
			 */
			workflow_file_upload_limit: number
		}
		/**
		 * 图片上传配置
		 */
		image: {
			/**
			 * 是否启用图片上传
			 */
			enabled: false
			/**
			 * 允许上传的图片最大数量
			 */
			number_limits: 3
			/**
			 * 允许的上传方式 - remote_url-远程地址 local_file-本地文件
			 */
			transfer_methods: ['local_file', 'remote_url']
		}
		/**
		 * 允许上传的文件数量
		 */
		number_limits: number
	}
	/**
	 * 文本转语音配置
	 */
	text_to_speech: {
		/**
		 * 是否启用
		 */
		enabled: boolean
		/**
		 * 是否开启自动播放 enabled-启用 disabled-禁用
		 */
		autoPlay: 'enabled' | 'disabled'
		/**
		 * 语言
		 */
		language: string
		/**
		 * 音色
		 */
		voice: string
	}
	/**
	 * 语音转文本配置
	 */
	speech_to_text: {
		/**
		 * 是否启用
		 */
		enabled: boolean
	}
}

export interface IConversationItem {
	created_at: number
	id: string
	inputs: Record<string, unknown>
	introduction: string
	name: string
	status: 'normal'
	updated_at: number
}

/**
 * 获取会话列表-参数
 */
interface IGetConversationListRequest {
	/**
	 * 返回条数
	 */
	limit: number
}

/**
 * 获取会话列表-响应体
 */
interface IGetConversationListResponse {
	data: IConversationItem[]
}

/**
 * 消息文件所属类型
 */
export enum MessageFileBelongsToEnum {
	'user' = 'user', // 用户
	'assistant' = 'assistant', // 助手
}

/**
 * 消息文件 Item 结构
 */
interface IMessageFileItem {
	id: string
	filename: string
	type: string
	url: string
	mime_type: string
	size: number
	transfer_method: string
	belongs_to: MessageFileBelongsToEnum
	upload_file_id: string
}

/**
 * 会话历史 Item 结构
 */
interface IMessageItem {
	/**
	 * 消息 ID
	 */
	id: string
	/**
	 * 对话 ID
	 */
	conversation_id: string
	/**
	 * 输入参数，键值对形式
	 */
	inputs: Record<string, string>
	/**
	 * 问题
	 */
	query: string
	/**
	 * 答案
	 */
	answer: string
	/**
	 * 消息关联的文件列表
	 */
	message_files?: IMessageFileItem[]
	/**
	 * 消息反馈信息
	 */
	feedback?: {
		/**
		 * 反馈类型，like 表示点赞，dislike 表示点踩
		 */
		rating: 'like' | 'dislike'
	}
	/**
	 * 消息状态，normal 表示正常，error 表示出错
	 */
	status: 'normal' | 'error'
	/**
	 * 错误信息，若消息状态为 error 时，该字段包含具体错误信息，否则为 null
	 */
	error: string | null
	/**
	 * 智能体思考过程列表
	 */
	agent_thoughts?: IAgentThought[]
	/**
	 * 消息创建时间戳
	 */
	created_at: number
	/**
	 * 知识库引用列表
	 */
	retriever_resources?: IRetrieverResource[]
}

interface IGetConversationHistoryResponse {
	data: IMessageItem[]
}

export interface IDifyApiOptions {
	/**
	 * 用户
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

export type IGetAppInfoResponse = IDifyAppItem['info']

export interface IGetAppMetaResponse {
	tool_icons: {
		dalle2: string
		api_tool: {
			background: string
			content: string
		}
	}
}

export interface IFileBase {
	/**
	 * 文件类型
	 */
	type: IFileType
}

export interface IFileRemote extends IFileBase {
	/**
	 * 传递方式 remote_url-远程地址 local_file-本地文件
	 */
	transfer_method: 'remote_url'
	/**
	 * 图片地址（仅当传递方式为 remote_url 时）
	 */
	url?: string
}

export interface IFileLocal extends IFileBase {
	/**
	 * 传递方式 remote_url-远程地址 local_file-本地文件
	 */
	transfer_method: 'local_file'
	/**
	 * 上传文件 ID（仅当传递方式为 local_file 时）
	 */
	upload_file_id?: string
}

export type IFile = IFileRemote | IFileLocal

/**
 * 上传文件接口详情
 */
export interface IUploadFileResponse {
	id: string
	name: string
	size: number
	extension: string
	mime_type: string
	created_by: number
	created_at: number
}

/**
 * 语音转文字的响应
 */
export interface IAudio2TextResponse {
	/**
	 * 生成的文本内容
	 */
	text: string
}

/**
 * Dify API 类
 */
export class DifyApi {
	constructor(options: IDifyApiOptions) {
		this.options = options
		this.baseRequest = new XRequest({
			baseURL: options.apiBase,
			apiKey: options.apiKey,
		})
	}

	options: IDifyApiOptions
	baseRequest: XRequest

	/**
	 * 更新 API 配置, 一般在切换应用时调用
	 */
	updateOptions(options: IDifyApiOptions) {
		this.options = options
		this.baseRequest = new XRequest({
			baseURL: options.apiBase,
			apiKey: options.apiKey,
		})
	}

	/**
	 * 获取应用基本信息
	 */
	async getAppInfo() {
		return this.baseRequest.get('/info') as Promise<IGetAppInfoResponse>
	}

	/**
	 * 获取应用 Meta 信息
	 */
	async getAppMeta() {
		return this.baseRequest.get('/meta') as Promise<IGetAppMetaResponse>
	}

	/**
	 * 获取应用参数
	 */
	getAppParameters = () => {
		return this.baseRequest.get('/parameters') as Promise<IGetAppParametersResponse>
	}

	/**
	 * 获取当前用户的会话列表（默认返回最近20条）
	 */
	getConversationList(params?: IGetConversationListRequest) {
		return this.baseRequest.get('/conversations', {
			user: this.options.user,
			limit: (params?.limit || 100).toString(),
		}) as Promise<IGetConversationListResponse>
	}

	/**
	 * 会话重命名
	 */
	renameConversation = (params: {
		/**
		 * 会话 ID
		 */
		conversation_id: string
		/**
		 * 名称，若 auto_generate 为 true 时，该参数可不传。
		 */
		name?: string
		/**
		 * 自动生成标题，默认 false
		 */
		auto_generate?: boolean
	}) => {
		const { conversation_id, ...restParams } = params
		return this.baseRequest.post(`/conversations/${conversation_id}/name`, {
			...restParams,
			user: this.options.user,
		})
	}

	/**
	 * 删除会话
	 */
	deleteConversation = (conversation_id: string) => {
		return this.baseRequest.delete(`/conversations/${conversation_id}`, {
			user: this.options.user,
		})
	}

	/**
	 * 获取会话历史消息
	 */
	getConversationHistory = (conversation_id: string) => {
		return this.baseRequest.get(`/messages`, {
			user: this.options.user,
			conversation_id,
		}) as Promise<IGetConversationHistoryResponse>
	}

	/**
	 * 发送对话消息
	 */
	sendMessage(params: {
		/**
		 * 对话 ID
		 */
		conversation_id?: string
		/**
		 * 输入参数
		 */
		inputs: Record<string, string>
		/**
		 * 附件
		 */
		files: IFile[]
		/**
		 * 用户
		 */
		user: string
		/**
		 * 响应模式
		 */
		response_mode: 'streaming'
		/**
		 * 问题
		 */
		query: string
	}) {
		return this.baseRequest.baseRequest('/chat-messages', {
			method: 'POST',
			body: JSON.stringify(params),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}

	/**
	 * 停止对话流式响应
	 */
	async stopTask(taskId: string) {
		return this.baseRequest.post(`/chat-messages/${taskId}/stop`, {
			user: this.options.user,
		})
	}

	/**
	 * 上传文件
	 */
	async uploadFile(file: File) {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('user', this.options.user)
		return this.baseRequest
			.baseRequest('/files/upload', {
				method: 'POST',
				body: formData,
			})
			.then(res => res.json()) as Promise<IUploadFileResponse>
	}

	/**
	 * 获取下一轮建议问题列表
	 */
	async getNextSuggestions(params: {
		/**
		 * 消息 ID
		 */
		message_id: string
	}) {
		return this.baseRequest.get(`/messages/${params.message_id}/suggested`, {
			user: this.options.user,
		}) as Promise<{
			data: string[]
		}>
	}

	/**
	 * 消息反馈
	 */
	feedbackMessage(params: {
		/**
		 * 消息 ID
		 */
		messageId: string
		/**
		 * 反馈类型 like-点赞 dislike-点踩 null-取消
		 */
		rating: 'like' | 'dislike' | null
		/**
		 * 反馈内容
		 */
		content: string
	}) {
		const { messageId, ...restParams } = params
		return this.baseRequest.post(`/messages/${messageId}/feedbacks`, {
			...restParams,
			user: this.options.user,
		}) as Promise<{
			// 固定返回 success
			result: 'success'
		}>
	}

	/**
	 * 文字转语音
	 */
	async text2Audio(
		params:
			| {
					/**
					 * 消息 ID，优先级高于 text
					 */
					message_id: string
			  }
			| {
					/**
					 * 文本内容
					 */
					text: string
			  },
	) {
		return this.baseRequest.baseRequest('/text-to-audio', {
			method: 'POST',
			body: JSON.stringify({
				...params,
				user: this.options.user,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}

	/**
	 * 语音转文本
	 * @param file 语音文件。 支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'] 文件大小限制：15MB
	 */
	async audio2Text(file: File) {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('user', this.options.user)
		return this.baseRequest
			.baseRequest('/audio-to-text', {
				method: 'POST',
				body: formData,
			})
			.then(res => res.json()) as Promise<IAudio2TextResponse>
	}

	/**
	 * 执行 workflow
	 */
	async runWorkflow(params: { inputs: Record<string, IFile[] | unknown> }) {
		return this.baseRequest.baseRequest('/workflows/run', {
			method: 'POST',
			body: JSON.stringify({
				...params,
				response_mode: 'streaming',
				user: this.options.user,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}

	/**
	 * 获取 workflow 执行情况
	 */
	async getWorkflowResult(params: { workflow_run_id: string }) {
		return this.baseRequest.get(`/workflows/run/${params.workflow_run_id}`)
	}

	/**
	 * 执行文本生成
	 */
	async completion(params: { inputs: Record<string, IFile[] | unknown> }) {
		return this.baseRequest.baseRequest('/completion-messages', {
			method: 'POST',
			body: JSON.stringify({
				...params,
				response_mode: 'streaming',
				user: this.options.user,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}
}

/**
 * 创建 Dify API 实例
 */
export const createDifyApiInstance = (options: IDifyApiOptions) => {
	return new DifyApi(options)
}
