import { useXAgent, useXChat, XStream } from '@ant-design/x'
import {
	EventEnum,
	IAgentThought,
	IChunkChatCompletionResponse,
	IErrorEvent,
	IFile,
} from '@dify-chat/api'
import { IWorkflowNode } from '@dify-chat/api'
import { useAppContext } from '@dify-chat/core'
import { isTempId } from '@dify-chat/helpers'
import { message as antdMessage, FormInstance } from 'antd'
import { useState } from 'react'

import { RESPONSE_MODE } from '@/config'
import { IAgentMessage, IMessageFileItem } from '@/types'
import { DifyApi } from '@/utils/dify-api'

import { useAuth } from '../use-auth'
import workflowDataStorage from './workflow-data-storage'

export const useX = (options: {
	latestProps: React.MutableRefObject<{
		conversationId: string | undefined
		appId?: string
		difyApi?: DifyApi
	}>
	entryForm: FormInstance<Record<string, unknown>>
	getNextSuggestions: (messageId: string) => void
	filesRef: React.MutableRefObject<IFile[]>
	abortRef: React.MutableRefObject<() => void>
	getConversationMessages: (conversationId: string) => void
	onConversationIdChange: (id: string) => void
}) => {
	const {
		latestProps,
		getNextSuggestions,
		filesRef,
		abortRef,
		getConversationMessages,
		onConversationIdChange,
		entryForm,
	} = options
	const { currentApp } = useAppContext()
	const { userId: user } = useAuth()
	const [currentTaskId, setCurrentTaskId] = useState('')

	const [agent] = useXAgent<IAgentMessage>({
		request: async ({ message }, { onSuccess, onUpdate, onError }) => {
			const inputs = message?.inputs || entryForm.getFieldsValue() || {}
			// 发送消息
			const response = await latestProps.current.difyApi!.sendMessage({
				inputs,
				conversation_id: !isTempId(latestProps.current.conversationId)
					? latestProps.current.conversationId
					: undefined,
				files: filesRef.current || [],
				user,
				response_mode: RESPONSE_MODE,
				query: message?.content as string,
			})

			let result = ''
			const files: IMessageFileItem[] = []
			const workflows: IAgentMessage['workflows'] = {}
			const agentThoughts: IAgentThought[] = []

			// 异常 => 结束
			if (response.status !== 200) {
				const errText = response.statusText || '请求对话接口失败'
				antdMessage.error(errText)
				// 打断输出
				abortRef.current = () => {
					// onError 是为了结束 agent 的 isRequesting 以更新 Sender 的发送按钮状态
					onError({
						name: response.status.toString(),
						message: errText,
					})
				}
				abortRef.current()
				return
			}

			const readableStream = XStream({
				readableStream: response.body as NonNullable<ReadableStream>,
			})

			const reader = readableStream.getReader()
			abortRef.current = () => {
				reader?.cancel()
				onSuccess({
					content: result,
					files,
					workflows,
					agentThoughts,
				})
			}

			// 记录对话和消息 ID
			let conversationId = latestProps.current.conversationId || ''
			let messageId = ''
			while (reader) {
				const { value: chunk, done } = await reader.read()
				if (done) {
					// 如果有工作流数据，则缓存
					if (workflows.nodes?.length) {
						workflowDataStorage.set({
							appId: latestProps.current.appId || '',
							conversationId,
							messageId,
							key: 'workflows',
							value: workflows,
						})
					}
					onSuccess({
						content: result,
						files,
						workflows,
						agentThoughts,
					})
					getConversationMessages(conversationId)
					onConversationIdChange(conversationId)
					break
				}
				if (!chunk) continue
				if (chunk.data) {
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
							inputs: string
							outputs: string
							process_data: string
							elapsed_time: number
							execution_metadata: IWorkflowNode['execution_metadata']
						}
					}
					try {
						parsedData = JSON.parse(chunk.data)
					} catch (error) {
						console.error('解析 JSON 失败', error)
					}

					// 用于回调的 ID 更新 start
					if (parsedData.conversation_id && parsedData.conversation_id !== conversationId) {
						conversationId = parsedData.conversation_id
					}
					if (parsedData.message_id && parsedData.message_id !== messageId) {
						messageId = parsedData.message_id
					}
					// 用于回调的 ID 更新 end

					if (parsedData.task_id && parsedData.task_id !== currentTaskId) {
						setCurrentTaskId(parsedData.task_id)
					}

					if (parsedData.event === EventEnum.MESSAGE_END) {
						// 如果开启了建议问题，获取下一轮问题建议
						if (currentApp?.parameters?.suggested_questions_after_answer?.enabled) {
							getNextSuggestions(parsedData.message_id)
						}
					}
					const innerData = parsedData.data
					if (parsedData.event === EventEnum.WORKFLOW_STARTED) {
						workflows.status = 'running'
						workflows.nodes = []
						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
					} else if (parsedData.event === EventEnum.WORKFLOW_FINISHED) {
						console.log('工作流结束', parsedData)
						workflows.status = 'finished'
						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
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
						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
					} else if (parsedData.event === EventEnum.WORKFLOW_NODE_FINISHED) {
						workflows.nodes = workflows.nodes?.map(item => {
							if (item.id === innerData.id) {
								return {
									...item,
									status: 'success',
									inputs: innerData.inputs,
									outputs: innerData.outputs,
									process_data: innerData.process_data,
									elapsed_time: innerData.elapsed_time,
									execution_metadata: innerData.execution_metadata,
								}
							}
							return item
						})
						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
					}
					if (parsedData.event === EventEnum.MESSAGE_FILE) {
						result += `<img src=""${parsedData.url} />`
						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
					}
					if (parsedData.event === EventEnum.MESSAGE) {
						const text = parsedData.answer
						result += text
						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
					}
					if (parsedData.event === EventEnum.ERROR) {
						onError({
							name: `${(parsedData as unknown as IErrorEvent).status}: ${(parsedData as unknown as IErrorEvent).code}`,
							message: (parsedData as unknown as IErrorEvent).message,
						})
						getConversationMessages(parsedData.conversation_id)
					}
					if (parsedData.event === EventEnum.AGENT_MESSAGE) {
						const lastAgentThought = agentThoughts[agentThoughts.length - 1]

						if (lastAgentThought) {
							// 将agent_message以流式形式输出到最后一条agent_thought里
							const text = parsedData.answer
							lastAgentThought.thought += text
						} else {
							continue
						}

						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
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

						onUpdate({
							content: result,
							files,
							workflows,
							agentThoughts,
						})
					}
				} else {
					console.log('没有数据', chunk)
					continue
				}
			}
		},
	})

	const { onRequest, messages, setMessages } = useXChat({
		agent,
		requestPlaceholder: () => {
			return {
				content: '正在回复，请耐心等待...',
				role: 'assistant',
			}
		},
	})

	return { agent, onRequest, messages, setMessages, currentTaskId }
}
