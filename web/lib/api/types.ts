// web/lib/api/types.ts

export enum MessageFileBelongsToEnum {
	user = 'user',
	assistant = 'assistant',
}

// ── 文件类型 (原 file.ts) ──
// 合并自 src/types/file.ts, src/types/event.ts, src/types/message.ts

import { EventEnum } from './enums'
import type { IMessageRole } from '@/lib/core'

// ── 文件类型 (原 file.ts) ──
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

// ── 事件类型 (原 event.ts) ──
export type IUsage = {
	prompt_tokens: number
	prompt_unit_price: string
	prompt_price_unit: string
	prompt_price: string
	completion_tokens: number
	completion_unit_price: string
	completion_price_unit: string
	completion_price: string
	total_tokens: number
	total_price: string
	currency: string
	latency: number
}

export interface IRetrieverResource {
	id: string
	message_id: string
	position: number
	dataset_id: string
	dataset_name: string
	document_id: string
	document_name: string
	data_source_type: string
	segment_id: string
	score: number
	hit_count: number
	word_count: number
	segment_position: number
	index_node_hash: string
	content: string
	created_at: number
}

export type IMessageEvent = {
	event: EventEnum.MESSAGE
	task_id: string
	message_id: string
	conversation_id: string
	answer: string
	created_at: number
}

export type IAgentMessageEvent = {
	event: EventEnum.AGENT_MESSAGE
	task_id: string
	message_id: string
	conversation_id: string
	answer: string
	created_at: number
}

export type IAgentThoughtEvent = {
	event: EventEnum.AGENT_THOUGHT
	id: string
	task_id: string
	message_id: string
	position: number
	thought: string
	observation: string
	tool: string
	tool_input: string
	created_at: number
	message_files: string[]
	file_id: string
	conversation_id: string
}

export type IAgentThought = Omit<IAgentThoughtEvent, 'event'>

export type IMessageFileEvent = {
	event: EventEnum.MESSAGE_FILE
	id: string
	type: IFileType
	belongs_to: 'user' | 'assistant'
	url: string
	conversation_id: string
}

export type IMessageEndEvent = {
	event: EventEnum.MESSAGE_END
	task_id: string
	message_id: string
	conversation_id: string
	metadata: Record<string, unknown>
	usage: IUsage
	retriever_resources: IRetrieverResource[]
}

export type ITTSMessageEvent = {
	event: EventEnum.TTS_MESSAGE
	task_id: string
	message_id: string
	audio: string
	created_at: number
}

export type ITTSMessageEndEvent = {
	event: EventEnum.TTS_MESSAGE_END
	task_id: string
	message_id: string
	audio: ''
	created_at: number
}

export type IMessageReplaceEvent = {
	event: EventEnum.MESSAGE_REPLACE
	task_id: string
	message_id: string
	conversation_id: string
	answer: string
	created_at: number
}

export type IErrorEvent = {
	event: EventEnum.ERROR
	task_id: string
	message_id: string
	status: number
	code: string
	message: string
}

export type IPingEvent = {
	event: EventEnum.PING
}

export type IWorkflowStartedEvent = {
	event: EventEnum.WORKFLOW_STARTED
}

export type IWorkflowFinishedEvent = {
	event: EventEnum.WORKFLOW_FINISHED
}

export type IWorkflowNodeStarted = {
	event: EventEnum.WORKFLOW_NODE_STARTED
}

export type IWorkflowNodeFinished = {
	event: EventEnum.WORKFLOW_NODE_FINISHED
}

export type IChunkChatCompletionResponse =
	| IMessageEvent
	| IAgentMessageEvent
	| IAgentThoughtEvent
	| IMessageFileEvent
	| IMessageEndEvent
	| ITTSMessageEvent
	| ITTSMessageEndEvent
	| IMessageReplaceEvent
	| IErrorEvent
	| IPingEvent
	| IWorkflowStartedEvent
	| IWorkflowFinishedEvent
	| IWorkflowNodeStarted
	| IWorkflowNodeFinished

// ── 消息类型 (原 message.ts) ──
export interface IWorkflowNode {
	id: string
	title: string
	status: 'init' | 'running' | 'success' | 'error'
	type: 'question-classifier'
	inputs: string
	process_data: string
	outputs: unknown
	elapsed_time: number
	execution_metadata: {
		total_tokens: number
		total_price: number
		currency: string
	}
}

export interface IMessageFileItem {
	id: string
	filename: string
	type: string
	url: string
	mime_type: string
	size: number
	transfer_method: string
	belongs_to: string
	upload_file_id?: string
}

export interface IAgentMessage {
	workflows?: {
		status?: 'running' | 'finished'
		nodes?: IWorkflowNode[]
	}
	files?: IMessageFileItem[]
	content: string
	error?: string
	agentThoughts?: IAgentThought[]
	retrieverResources?: IRetrieverResource[]
}

export type IRating = 'like' | 'dislike' | null

export interface IMessageItem4Render extends IAgentMessage {
	id: string
	status: 'local' | 'loading' | 'success' | 'error'
	error?: string
	role: IMessageRole
	isHistory?: boolean
	feedback?: {
		rating: IRating
	}
	created_at: string
}

/**
 * HITL 流事件载荷
 * 由 human_input_required SSE 事件返回
 */
export interface IHumanInputRequiredEvent {
	event: EventEnum.HUMAN_INPUT_REQUIRED
	task_id: string
	message_id: string
	conversation_id: string
	form_token: string
	created_at: number
}

/**
 * GET /form/human_input/{form_token} 响应
 */
export interface IHumanInputFormData {
	form_content: string
	inputs: IHumanInputField[]
	resolved_default_values: Record<string, string>
	user_actions: IHumanInputAction[]
	expiration_time: number
}

export interface IHumanInputField {
	type: 'text_input' | 'select' | 'paragraph' | 'number'
	output_variable_name: string
	default: {
		type: string
		selector: string[]
		value: string
	}
}

export interface IHumanInputAction {
	id: string
	title: string
	button_style: 'primary' | 'default'
}

/**
 * POST /form/human_input/{form_token} 请求体
 */
export interface IHumanInputSubmitBody {
	inputs: Record<string, string>
	action: string
	user: string
}
