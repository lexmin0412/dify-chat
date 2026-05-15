import {
	AbstractChatProvider,
	ChatProviderConfig,
	TransformMessage,
	XRequestOptions,
} from '@ant-design/x-sdk'
import {
	EventEnum,
	IAgentThought,
	IChunkChatCompletionResponse,
	IFile,
	IMessageFileItem,
	IWorkflowNode,
} from '@/lib/api'
import { Roles } from '@/lib/core'
import { isTempId } from '@/lib/helpers'

import { IAgentMessage } from '@/types'

import workflowDataStorage, { IWorkflowDataSetOptions } from './workflow-data-storage'

// 类型定义
export type CustomInput = {
	query: string
	conversation_id?: string
	inputs: Record<string, string>
	files: IFile[]
	user: string
	response_mode: 'streaming'
}

export type CustomOutput = {
	data: string
	event?: string
	id?: string
}

const getAppIdFromParams = () => {
	// 读取 path 的最后一段作为应用 ID
	const b = window.location.pathname.split('/')
	return b[b.length - 1]
}

interface ISetWorkflowDataOption {
	conversationId: string
	messageId: string
	value: IWorkflowDataSetOptions['value']
}

export interface CustomProviderOptions<Input, Output> {
	onTaskIdChange?: (taskId: string) => void
	onConversationIdChange?: (conversationId: string) => void
	request?: unknown
	// 占位使用，避免 TS 报错
	_ignore?: Input | Output
}

export class CustomProvider<
	ChatMessage extends IAgentMessage = IAgentMessage,
	Input extends CustomInput = CustomInput,
	Output extends CustomOutput = CustomOutput,
> extends AbstractChatProvider<ChatMessage, Input, Output> {
	private onTaskIdChange?: (taskId: string) => void
	private onConversationIdChange?: (conversationId: string) => void
	private currentTaskId?: string
	private currentConversationId?: string

	constructor(options?: CustomProviderOptions<Input, Output>) {
		super(options as unknown as ChatProviderConfig<Input, Output>)
		this.onTaskIdChange = options?.onTaskIdChange
		this.onConversationIdChange = options?.onConversationIdChange
	}

	// 处理请求参数
	transformParams(requestParams: Partial<Input>, options: XRequestOptions<Input, Output>): Input {
		console.log('params', options.params, requestParams, {
			...options.params,
			...requestParams,
			query: requestParams.query,
			conversation_id: !isTempId(requestParams.conversation_id)
				? requestParams.conversation_id
				: undefined,
		})
		return {
			...options.params,
			...requestParams,
			query: requestParams.query,
			conversation_id: !isTempId(requestParams.conversation_id)
				? requestParams.conversation_id
				: undefined,
		} as Input
	}
	transformLocalMessage(requestParams: Partial<Input>): ChatMessage {
		console.log('enter transformLocalMessage', requestParams)
		return {
			content: requestParams.query,
			role: Roles.USER,
		} as unknown as ChatMessage
	}
	private async setWorkflowDataStorage({
		conversationId,
		messageId,
		value,
	}: ISetWorkflowDataOption) {
		const appId = getAppIdFromParams()
		await workflowDataStorage.set({
			key: 'workflows',
			appId,
			conversationId,
			messageId,
			value,
		})
	}
	transformMessage(info: TransformMessage<ChatMessage, Output>): ChatMessage {
		const { originMessage, chunk } = info || {}
		const workflows = (originMessage?.workflows as NonNullable<IAgentMessage['workflows']>) || {}
		const agentThoughts: IAgentThought[] = []
		const files: IMessageFileItem[] = []
		let messageId = originMessage?.id || ''

		if (!chunk || !chunk?.data || (chunk?.data && chunk?.data?.includes('[DONE]'))) {
			return originMessage as ChatMessage
		}
		let parsedData = {} as {
			id: string
			task_id: string
			position: number
			tool: string
			tool_input: string
			observation: string
			message_files: string[]

			event: IChunkChatCompletionResponse['event']
			answer: string
			conversation_id: string
			message_id: string

			// 类型
			type: 'image'
			// 图片链接
			url: string

			data: {
				// 工作流节点的数据
				id: string
				node_type: IWorkflowNode['type']
				title: string
				inputs: Record<string, unknown>
				outputs: Record<string, unknown>
				process_data: Record<string, unknown>
				elapsed_time: number
				execution_metadata: IWorkflowNode['execution_metadata']
			}
		}
		try {
			parsedData = JSON.parse(chunk.data)
		} catch (error) {
			console.error('解析 JSON 失败', error)
			return originMessage as ChatMessage
		}
		if (parsedData.conversation_id && parsedData.conversation_id !== this.currentConversationId) {
			this.currentConversationId = parsedData.conversation_id
			this.onConversationIdChange?.(this.currentConversationId)
		}
		const innerData = parsedData.data
		if (parsedData.message_id && parsedData.message_id !== messageId) {
			messageId = parsedData.message_id
		}
		if (parsedData.task_id && parsedData.task_id !== this.currentTaskId) {
			this.currentTaskId = parsedData.task_id
			this.onTaskIdChange?.(this.currentTaskId)
		}
		if (parsedData.event === EventEnum.WORKFLOW_STARTED) {
			workflows.status = 'running'
			workflows.nodes = []
			this.setWorkflowDataStorage({
				conversationId: this.currentConversationId!,
				messageId,
				value: workflows,
			})
			return {
				...originMessage,
				workflows,
			} as ChatMessage
		} else if (parsedData.event === EventEnum.WORKFLOW_FINISHED) {
			console.log('工作流结束', parsedData)
			workflows.status = 'finished'
			this.setWorkflowDataStorage({
				conversationId: this.currentConversationId!,
				messageId,
				value: workflows,
			})
			return {
				...originMessage,
				workflows,
			} as ChatMessage
		} else if (parsedData.event === EventEnum.WORKFLOW_NODE_STARTED) {
			console.log('节点开始', parsedData)
			workflows.nodes = [
				...(workflows.nodes || []),
				{
					id: innerData.id,
					status: 'running',
					type: innerData.node_type,
					title: innerData.title,
				} as IWorkflowNode,
			]
			this.setWorkflowDataStorage({
				conversationId: this.currentConversationId!,
				messageId,
				value: workflows,
			})
			return {
				...originMessage,
				workflows,
			} as ChatMessage
		} else if (parsedData.event === EventEnum.WORKFLOW_NODE_FINISHED) {
			workflows.nodes = workflows.nodes?.map(item => {
				if (item.id === innerData.id) {
					return {
						...item,
						status: 'success',
						inputs: JSON.stringify(innerData.inputs),
						outputs: innerData.outputs,
						process_data: JSON.stringify(innerData.process_data),
						elapsed_time: innerData.elapsed_time,
						execution_metadata: innerData.execution_metadata,
					} as IWorkflowNode
				}
				return item
			})
			this.setWorkflowDataStorage({
				conversationId: this.currentConversationId!,
				messageId,
				value: workflows,
			})
			return {
				...originMessage,
				workflows,
			} as ChatMessage
		}
		if (parsedData.event === EventEnum.MESSAGE_FILE) {
			const newContent = originMessage?.content + `<img src=""${parsedData.url} />`
			return {
				...originMessage,
				content: newContent,
			} as ChatMessage
		}
		if (parsedData.event === EventEnum.MESSAGE) {
			return {
				...originMessage,
				taskId: this.currentTaskId,
				content: (originMessage?.content || '') + parsedData.answer,
				id: messageId,
			} as ChatMessage
		}
		// if (parsedData.event === EventEnum.ERROR) {
		// 	onError({
		// 		name: `${(parsedData as unknown as IErrorEvent).status}: ${(parsedData as unknown as IErrorEvent).code}`,
		// 		message: (parsedData as unknown as IErrorEvent).message,
		// 	})
		// 	getConversationMessages(parsedData.conversation_id)
		// }
		if (parsedData.event === EventEnum.AGENT_MESSAGE) {
			const lastAgentThought = agentThoughts[agentThoughts.length - 1]

			if (lastAgentThought) {
				// 将agent_message以流式形式输出到最后一条agent_thought里
				const text = parsedData.answer
				lastAgentThought.thought += text
			}

			return {
				...originMessage,
				taskId: this.currentTaskId,
				agentThoughts,
				id: messageId,
			} as ChatMessage
		}
		if (parsedData.event === EventEnum.AGENT_THOUGHT) {
			const existAgentThoughtIndex = agentThoughts.findIndex(
				_agentThought => _agentThought.position === parsedData.position,
			)

			const newAgentThought = {
				conversation_id: parsedData.conversation_id,
				id: parsedData.id as string,
				task_id: parsedData.task_id,
				position: parsedData.position,
				tool: parsedData.tool,
				tool_input: parsedData.tool_input,
				observation: parsedData.observation,
				message_files: parsedData.message_files,
				message_id: parsedData.message_id,
			} as IAgentThought

			if (existAgentThoughtIndex !== -1) {
				// 如果已存在一条，则替换内容
				agentThoughts[existAgentThoughtIndex] = newAgentThought
			} else {
				// 如果不存在，则插入一条
				agentThoughts.push(newAgentThought)
			}

			return {
				...originMessage,
				taskId: this.currentTaskId,
				agentThoughts,
				id: messageId,
			} as ChatMessage
		}
		console.log('parsedData', parsedData)
		return {
			...originMessage,
			taskId: this.currentTaskId,
			content: (originMessage?.content || '') + (parsedData.answer || ''),
			role: Roles.AI,
			files,
			workflows,
			agentThoughts,
			id: messageId,
		} as unknown as ChatMessage
	}
}
