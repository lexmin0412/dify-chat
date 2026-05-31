// import { useXAgent, useXChat, XStream } from '@ant-design/x'
import { useXChat, XRequest } from '@ant-design/x-sdk'
import { IFile, IHumanInputRequiredEvent } from '@/lib/api'
import { Roles } from '@/lib/core'
import { isTempId } from '@/lib/helpers'
import { FormInstance } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'

import { RESPONSE_MODE } from '@/config'
import { IAgentMessage } from '@/lib/api'
import { DifyApi } from '@/lib/dify-client'

import { useAuth } from '../use-auth'
import { useDifyChatStore } from '@/lib/core/store'
import { CustomInput, CustomOutput, CustomProvider } from './x-provider'

interface IUseXOptions {
	latestProps: React.MutableRefObject<{
		conversationId: string | undefined
		appId?: string
		difyApi?: DifyApi
	}>
	entryForm: FormInstance<Record<string, unknown>>
	filesRef: React.MutableRefObject<IFile[]>
	onConversationIdChange: (id: string) => void
	onTaskIdChange: (id: string) => void
	onHumanInputRequired?: (data: IHumanInputRequiredEvent) => void
	abortRef?: React.MutableRefObject<() => void>
	getNextSuggestions: (messageId: string) => void
}

export const useX = (options: IUseXOptions) => {
	const {
		latestProps,
		filesRef,
		onTaskIdChange,
		entryForm,
		getNextSuggestions,
		onConversationIdChange,
		onHumanInputRequired,
	} = options

	const { userId: user } = useAuth()
	const onConversationIdChangeRef = useRef(onConversationIdChange)
	onConversationIdChangeRef.current = onConversationIdChange

	const onTaskIdChangeRef = useRef(onTaskIdChange)
	onTaskIdChangeRef.current = onTaskIdChange

	const onHumanInputRequiredRef = useRef(onHumanInputRequired)
	onHumanInputRequiredRef.current = onHumanInputRequired

	const [provider] = useState(
		new CustomProvider({
			onTaskIdChange: (id: string) => {
				onTaskIdChangeRef.current(id)
			},
			onConversationIdChange: (id: string) => {
				onConversationIdChangeRef.current(id)
			},
			onHumanInputRequired: data => {
				onHumanInputRequiredRef.current?.(data)
			},
			request: XRequest<CustomInput, CustomOutput>(
				// 这个参数没有意义，只是为了符合传参规范
				'dify-app-hub-messages',
				{
					manual: true,
					fetch: async (_, options) => {
						const body = options?.body ? JSON.parse(options.body as string) : {}

						// 实时获取 inputs 和 files，确保获取到的是最新值
						const currentInputs = entryForm.getFieldsValue() || {}
						const currentFiles = filesRef.current || []

						// 覆盖 body 中的 inputs 和 files
						body.inputs = currentInputs
						body.files = currentFiles
						const { conversationId } = latestProps.current
						if (!body.conversation_id && conversationId && !isTempId(conversationId)) {
							body.conversation_id = conversationId
						}
						if (!latestProps.current.difyApi) {
							throw new Error('Dify API not initialized')
						}
						return latestProps.current.difyApi.sendMessage(body)
					},
					params: {
						// 这里传入空对象是为了满足类型要求，实际请求时会在 fetch 中获取最新值
						inputs: {},
						files: filesRef.current || [],
						user,
						response_mode: RESPONSE_MODE,
						query: '',
					},
					callbacks: {
						onSuccess: messages => {
							console.log('onSuccess', messages)
							// setMessages(messages)
						},
						onError: error => {
							console.error('onError', error)
						},
						onUpdate: msg => {
							console.log('onUpdate', msg)
						},
					},
				},
			),
		}),
	)

	const { abort, onRequest, messages, setMessages, isRequesting } = useXChat({
		provider,
		requestPlaceholder: {
			role: Roles.AI,
			content: '正在回复，请耐心等待...',
		} as any,
		requestFallback: {
			role: Roles.AI,
			content: '请求失败，请稍后重试',
		} as any,
	})

	const messagesRef = useRef(messages)
	messagesRef.current = messages

	const originWorkflowsRef = useRef<IAgentMessage['workflows']>(null)

	const wasRequesting = useRef(false)

	useEffect(() => {
		if (wasRequesting.current && !isRequesting) {
			const lastMessage = messages[messages.length - 1] as unknown as IAgentMessage
			// @ts-expect-error FIXME: IAgentMessage 类型兼容
			if (lastMessage?.role === Roles.AI && lastMessage?.id) {
			}
		}
		wasRequesting.current = isRequesting
	}, [isRequesting, messages, getNextSuggestions])

	// 实时追踪最新消息中的 workflows 数据，供 reconnectWorkflow 使用
	useEffect(() => {
		const lastAi = messages.findLast(m => (m.message as any)?.role === Roles.AI)
		if (lastAi) {
			originWorkflowsRef.current = (lastAi.message as unknown as IAgentMessage)?.workflows || null
		}
	}, [messages])

	/**
	 * 在 HITL 表单提交后重新连接到 Dify 工作流 SSE 事件流，
	 * 获取从暂停点之后剩余的 workflow 事件。
	 */
	const reconnectWorkflow = useCallback(
		async (taskId: string, msgId: string): Promise<string> => {
			const appId = latestProps.current.appId
			const currentUser = user
			if (!appId || !currentUser || !taskId || !msgId) return ''
			const response = await fetch(
				`/api/client/dify/${appId}/workflow/${taskId}/events?user=${currentUser}`,
			)
			if (!response.ok) {
				console.error('[reconnectWorkflow] failed to connect', response.status)
				return ''
			}

			const reader = response.body?.getReader()
			if (!reader) {
				console.log('[reconnectWorkflow] no reader')
				return ''
			}

			const decoder = new TextDecoder()
			let buffer = ''
			let accumulatedContent = ''

			// 找到当前消息用于更新工作流状态
			let originMessage = (messagesRef.current.findLast(m => (m.message as any)?.role === Roles.AI)
				?.message ?? null) as IAgentMessage | null
			if (originMessage) {
				originMessage = {
					...originMessage,
					content: '',
					workflows: originMessage.workflows || originWorkflowsRef.current || undefined,
				}
			}

			const updateContent = (text: string) => {
				accumulatedContent += text
				const store = useDifyChatStore.getState()
				const map = { ...store.hitl.continuationMap }
				map[msgId] = accumulatedContent
				store.setHITLState({ continuationMap: map, activeContinuationId: msgId })
			}

			const isWorkflowEvent = (event: string) =>
				event === 'workflow_started' ||
				event === 'workflow_finished' ||
				event === 'node_started' ||
				event === 'node_finished'

			try {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					buffer += decoder.decode(value, { stream: true })
					const lines = buffer.split('\n')
					buffer = lines.pop() || ''

					for (const line of lines) {
						if (!line.startsWith('data: ')) continue
						const dataStr = line.slice(6)
						if (dataStr === '[DONE]') continue

						try {
							const parsedData = JSON.parse(dataStr)
							if (parsedData.event === 'message') {
								updateContent(parsedData.answer || '')
							}
							if (isWorkflowEvent(parsedData.event)) {
								const chunk: CustomOutput = { data: JSON.stringify(parsedData) }
								const result = provider.transformMessage({
									originMessage: originMessage as unknown as IAgentMessage,
									chunk,
									chunks: [chunk],
									status: 'updating',
									responseHeaders: new Headers(),
								})
								if (result && (result as unknown as { type: string }).type !== 'event') {
									originMessage = result as unknown as IAgentMessage
									setMessages(prev => {
										const lastAiIdx = [...prev].reverse().findIndex(m => m.status !== 'local')
										if (lastAiIdx === -1) return prev
										const idx = prev.length - 1 - lastAiIdx
										const prevMessage = prev[idx].message as unknown as IAgentMessage
										const resultMessage = result as unknown as IAgentMessage
										const mergedMessage = {
											...resultMessage,
											workflows: resultMessage.workflows?.nodes?.length
												? resultMessage.workflows
												: prevMessage?.workflows,
										}
										const updated = [...prev]
										updated[idx] = {
											...updated[idx],
											message: mergedMessage as unknown as IAgentMessage,
											status:
												parsedData.event === 'workflow_finished' ? 'success' : updated[idx].status,
										}
										return updated
									})
								}
							}
						} catch (e) {
							console.error('Failed to parse workflow event SSE data:', e)
						}
					}
				}
				return accumulatedContent
			} catch (e) {
				console.error('Error reading workflow events stream:', e)
				return accumulatedContent
			} finally {
				reader.releaseLock()
			}
		},
		[latestProps, user],
	)

	return {
		onRequest,
		messages,
		setMessages,
		abort,
		isRequesting,
		reconnectWorkflow,
	}
}
