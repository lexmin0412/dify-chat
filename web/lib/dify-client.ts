import { IAnnotationItem, ICreateAnnotationRequest } from '@/lib/api'
import type { IHumanInputFormData, IHumanInputSubmitBody } from '@/lib/api/types'
import { IDifyAppSiteSetting } from '@/lib/core'
import { LocalStorageStore, BaseRequest as XRequest } from '@/lib/helpers'

// Re-export types from canonical source
export type {
	IUserInputFormItemType,
	IUserInputFormItemValueBase,
	IUserInputForm,
	IGetAppParametersResponse,
	IConversationItem,
	IGetWorkflowResultResponse,
	IDifyApiOptions,
	IGetAppInfoResponse,
	IGetAppMetaResponse,
} from '@/lib/api'
export { MessageFileBelongsToEnum } from '@/lib/api'

const PLATFORM_API_BASE = '/api/client/dify'

const genXRequestOptions = (options: IDifyApiOptions) => ({
	baseURL: `${PLATFORM_API_BASE}/${options.appId}`,
	headers: {
		'x-user-id': LocalStorageStore.get('USER_ID'),
	},
})

/**
 * Dify API 类
 */
export class DifyApi {
	constructor(options: IDifyApiOptions) {
		this.options = options
		this.baseRequest = new XRequest(genXRequestOptions(options))
	}

	options: IDifyApiOptions
	private baseRequest: XRequest

	/**
	 * 更新 API 配置, 一般在切换应用时调用
	 */
	updateOptions = (options: IDifyApiOptions) => {
		this.options = options
		this.baseRequest = new XRequest(genXRequestOptions(options))
	}

	/**
	 * 获取应用基本信息
	 */
	getAppInfo = async () => {
		return this.baseRequest.get('/info') as Promise<IGetAppInfoResponse>
	}

	/**
	 * 获取应用 Meta 信息
	 */
	getAppMeta = async () => {
		return this.baseRequest.get('/meta') as Promise<IGetAppMetaResponse>
	}

	/**
	 * 获取应用参数
	 */
	getAppParameters = () => {
		return this.baseRequest.get('/parameters') as Promise<IGetAppParametersResponse>
	}

	/**
	 * 获取应用 WebAPP 设置
	 * @Limited Dify v1.4.0 版本开始支持
	 */
	getAppSiteSetting = () => {
		return this.baseRequest.get('/site').then(res => res.data) as Promise<IDifyAppSiteSetting>
	}

	/**
	 * 获取当前用户的会话列表（默认返回最近20条）
	 */
	listConversations = (params?: IListConversationsRequest) => {
		return this.baseRequest.get('/conversations', {
			user: this.options.user,
			limit: (params?.limit || 100).toString(),
			...(params?.last_id && { last_id: params.last_id }),
			...(params?.sort_by && { sort_by: params.sort_by }),
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
		return this.baseRequest.post(`/conversation/${conversation_id}/name`, {
			...restParams,
			user: this.options.user,
		})
	}

	/**
	 * 创建标注
	 */
	createAnnotation = async (params: ICreateAnnotationRequest) => {
		return this.baseRequest.post(
			'/annotations',
			params as unknown as Record<string, unknown>,
		) as Promise<IAnnotationItem>
	}

	/**
	 * 删除会话
	 */
	deleteConversation = (conversation_id: string) => {
		return this.baseRequest.delete(`/conversation/${conversation_id}`, {
			user: this.options.user,
		})
	}

	/**
	 * 获取会话历史消息
	 */
	listMessages = (
		conversation_id: string,
		options?: {
			/**
			 * 当前页第一条聊天记录的 ID，默认 null
			 */
			first_id?: string | null
			/**
			 * 一次请求返回多少条聊天记录，默认 100 条
			 */
			limit?: number
		},
	) => {
		const { first_id, limit } = options || {}
		const params: Record<string, string> = {
			user: this.options.user,
			conversation_id,
		}

		if (first_id !== undefined && first_id !== null) {
			params.first_id = first_id
		}

		if (limit !== undefined) {
			params.limit = limit.toString()
		}

		return this.baseRequest.get(
			`/conversation/${conversation_id}/messages`,
			params,
		) as Promise<IListMessagesResponse>
	}

	/**
	 * 发送对话消息
	 */
	sendMessage = (params: {
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
	}) => {
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
	stopTask = async (taskId: string) => {
		return this.baseRequest.post(`/chat-messages/${taskId}/stop`, {
			user: this.options.user,
		})
	}

	/**
	 * 上传文件
	 */
	uploadFile = async (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('user', this.options.user)
		return this.baseRequest
			.baseRequest('/files/upload', {
				method: 'POST',
				body: formData,
			})
			.then(res => res.json())
			.then(res => res.data) as Promise<IUploadFileResponse>
	}

	/**
	 * 获取下一轮建议问题列表
	 */
	getNextSuggestions = async (params: {
		/**
		 * 消息 ID
		 */
		message_id: string
	}) => {
		return this.baseRequest.get(`/messages/${params.message_id}/suggested`, {
			user: this.options.user,
		}) as Promise<{
			data: string[]
		}>
	}

	/**
	 * 消息反馈
	 */
	createMessageFeedback = (params: {
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
	}) => {
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
	text2Audio = async (
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
	) => {
		return this.baseRequest.baseRequest('/text2audio', {
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
	audio2Text = async (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('user', this.options.user)
		return this.baseRequest
			.baseRequest('/audio2text', {
				method: 'POST',
				body: formData,
			})
			.then(res => res.json())
			.then(res => res.data) as Promise<IAudio2TextResponse>
	}

	/**
	 * 执行 workflow
	 */
	runWorkflow = async (params: { inputs: Record<string, IFile[] | unknown> }) => {
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
	getWorkflowResult = async (params: { workflow_run_id: string }) => {
		return this.baseRequest.get(
			`/workflows/run/${params.workflow_run_id}`,
		) as Promise<IGetWorkflowResultResponse>
	}

	/**
	 * 执行文本生成
	 */
	completion = async (params: { inputs: Record<string, IFile[] | unknown> }) => {
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

	/**
	 * 获取文件预览
	 */
	filePreview = async (params: { file_id: string; as_attachment?: boolean }) => {
		return this.baseRequest.baseRequest(
			`/files/${params.file_id}/preview${params.as_attachment ? '?as_attachment=true' : ''}`,
			{
				method: 'GET',
			},
		)
	}

	/**
	 * 获取暂停中的人工介入表单
	 */
	async getHumanInputForm(formToken: string): Promise<IHumanInputFormData> {
		return this.baseRequest.get(`/form/human_input/${formToken}`)
	}

	/**
	 * 提交人工介入表单
	 */
	async submitHumanInput(
		formToken: string,
		body: IHumanInputSubmitBody,
	): Promise<void> {
		return this.baseRequest.post(
			`/form/human_input/${formToken}`,
			body as unknown as Record<string, unknown>,
		)
	}
}

/**
 * 创建 Dify API 实例
 */
export const createDifyApiInstance = (options: IDifyApiOptions) => {
	return new DifyApi(options)
}
