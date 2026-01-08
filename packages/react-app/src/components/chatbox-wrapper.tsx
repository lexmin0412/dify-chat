import { IFile, IMessageFileItem, MessageFileBelongsToEnum } from '@dify-chat/api'
import { IMessageItem4Render } from '@dify-chat/api'
import { useAppContext } from '@dify-chat/core'
import { Roles, useConversationsContext } from '@dify-chat/core'
import { isTempId } from '@dify-chat/helpers'
import { Button, Empty, Form, Spin } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'

import { Chatbox } from '@/components'
import { useLatest } from '@/hooks/use-latest'
import { useX } from '@/hooks/useX'
import workflowDataStorage from '@/hooks/useX/workflow-data-storage'
import { useGlobalStore } from '@/store'

interface IChatboxWrapperProps {
	/**
	 * 对话列表 loading
	 */
	conversationListLoading?: boolean
	/**
	 * 内部处理对话列表变更的函数
	 */
	conversationItemsChangeCallback: (showLoading?: boolean) => void
	/**
	 * 添加对话
	 */
	onAddConversation: () => void
	/**
	 * 触发配置应用事件
	 */
	handleStartConfig?: () => void
}

/**
 * 聊天容器 进入此组件时, 应保证应用信息和对话列表已经加载完成
 */
export default function ChatboxWrapper(props: IChatboxWrapperProps) {
	const { difyApi } = useGlobalStore()
	const {
		conversationListLoading,
		onAddConversation,
		conversationItemsChangeCallback,
		handleStartConfig,
	} = props
	const {
		currentConversationId,
		setCurrentConversationId,
		setConversations,
		currentConversationInfo,
	} = useConversationsContext()
	const { currentAppId, currentApp, appLoading } = useAppContext()

	const [entryForm] = Form.useForm()
	const abortRef = useRef(() => {})
	useEffect(() => {
		return () => {
			abortRef.current()
		}
	}, [])
	// 是否允许消息列表请求时展示 loading
	const [messagesloadingEnabled, setMessagesloadingEnabled] = useState(true)
	const [initLoading, setInitLoading] = useState<boolean>(false)
	const [historyMessages, setHistoryMessages] = useState<IMessageItem4Render[]>([])
	const [hasMore, setHasMore] = useState<boolean>(false)

	// 添加一个状态来标记是否正在切换会话
	const [isSwitchingConversation, setIsSwitchingConversation] = useState(false)

	const [nextSuggestions, setNextSuggestions] = useState<string[]>([])
	// 定义 ref, 用于获取最新的 conversationId
	const latestProps = useLatest({
		conversationId: currentConversationId,
		appId: currentAppId,
		difyApi,
	})

	const defaultRequestLimit = 10

	const filesRef = useRef<IFile[]>([])

	/**
	 * 获取下一轮问题建议
	 */
	const getNextSuggestions = useEffectEvent(async (message_id: string) => {
		const result = await difyApi!.getNextSuggestions({ message_id })
		setNextSuggestions(result.data)
	})

	const updateConversationInputs = useCallback(
		(formValues: Record<string, unknown>) => {
			setConversations(prev => {
				return prev.map(item => {
					if (item.id === currentConversationId) {
						return {
							...item,
							inputs: formValues,
						}
					}
					return item
				})
			})
		},
		[currentConversationId, setConversations],
	)

	/**
	 * 初始化对话历史消息（从头开始加载，清空现有历史）
	 * @param conversationId 对话ID
	 * @param preserveLoadedCount 是否保持已加载的消息数量（用于反馈后刷新）
	 */
	const initConversationMessages = useEffectEvent(
		async (
			conversationId: string = currentConversationId,
			preserveLoadedCount: boolean = false,
		) => {
			// 如果是临时 ID，则不获取历史消息
			if (isTempId(conversationId)) {
				return
			}

			// 计算要请求的消息数量
			let requestLimit = defaultRequestLimit // 默认限制
			if (preserveLoadedCount && historyMessages.length > 0) {
				// 保持已加载的消息数量，每2条消息代表一轮对话（用户问题+AI回答）
				requestLimit = Math.max(defaultRequestLimit, Math.ceil(historyMessages.length / 2))
			}

			const result = await difyApi!.listMessages(conversationId, {
				first_id: '', // 从头开始加载
				limit: requestLimit,
			})

			if (!result?.data?.length) {
				return
			}

			setHasMore(result.has_more || false)

			const newMessages: IMessageItem4Render[] = []

			// 只有当历史消息中的参数不为空时才更新
			if (result?.data?.length && Object.values(result.data?.[0]?.inputs)?.length) {
				updateConversationInputs(result.data[0]?.inputs || {})
			}

			result.data.forEach(item => {
				const createdAt = dayjs(item.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')
				newMessages.push(
					{
						id: item.id,
						content: item.query,
						status: 'success',
						isHistory: true,
						files: item.message_files?.filter(item => {
							return item.belongs_to === MessageFileBelongsToEnum.user
						}),
						role: Roles.USER,
						created_at: createdAt,
					},
					{
						id: item.id,
						content: item.answer,
						status: item.status === 'error' ? item.status : 'success',
						error: item.error || '',
						isHistory: true,
						files: item.message_files?.filter(item => {
							return item.belongs_to === MessageFileBelongsToEnum.assistant
						}),
						feedback: item.feedback,
						workflows:
							workflowDataStorage.get({
								appId: currentAppId || '',
								conversationId,
								messageId: item.id,
								key: 'workflows',
							}) || [],
						agentThoughts: item.agent_thoughts || [],
						retrieverResources: item.retriever_resources || [],
						role: Roles.AI,
						created_at: createdAt,
					},
				)
			})

			// 替换历史消息
			setHistoryMessages(newMessages)
			// 清空临时消息
			setMessages([])

			if (newMessages?.length) {
				// 如果下一步问题建议已开启，则请求接口获取
				if (currentApp?.parameters?.suggested_questions_after_answer?.enabled) {
					getNextSuggestions(newMessages[newMessages.length - 1].id)
				}
			}
		},
	)

	/**
	 * 加载更多历史消息（分页加载）
	 */
	const loadMoreMessages = useCallback(
		async (conversationId: string = currentConversationId) => {
			// 如果是临时 ID，则不获取历史消息
			if (isTempId(conversationId)) {
				return
			}

			let firstId = ''
			if (historyMessages[0]?.id) {
				firstId = historyMessages[0]?.id.replace('question-', '')
			}

			const result = await difyApi!.listMessages(conversationId, {
				first_id: firstId,
				limit: defaultRequestLimit,
			})

			if (!result?.data?.length) {
				return
			}

			setHasMore(result.has_more || false)

			const newMessages: IMessageItem4Render[] = []

			result.data.forEach(item => {
				const createdAt = dayjs(item.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')
				newMessages.push(
					{
						id: item.id,
						content: item.query,
						status: 'success',
						isHistory: true,
						files: item.message_files?.filter(item => {
							return item.belongs_to === MessageFileBelongsToEnum.user
						}),
						role: Roles.USER,
						created_at: createdAt,
					},
					{
						id: item.id,
						content: item.answer,
						status: item.status === 'error' ? item.status : 'success',
						error: item.error || '',
						isHistory: true,
						files: item.message_files?.filter(item => {
							return item.belongs_to === MessageFileBelongsToEnum.assistant
						}),
						feedback: item.feedback,
						workflows:
							workflowDataStorage.get({
								appId: currentAppId || '',
								conversationId,
								messageId: item.id,
								key: 'workflows',
							}) || [],
						agentThoughts: item.agent_thoughts || [],
						retrieverResources: item.retriever_resources || [],
						role: Roles.AI,
						created_at: createdAt,
					},
				)
			})

			// 追加到历史消息前面
			setHistoryMessages(prev => [...newMessages, ...prev])
		},
		[difyApi, historyMessages, currentConversationId],
	)

	const { agent, onRequest, messages, setMessages, currentTaskId } = useX({
		latestProps,
		filesRef,
		getNextSuggestions,
		abortRef,
		getConversationMessages: (conversationId: string) =>
			initConversationMessages(conversationId, false),
		onConversationIdChange: id => {
			setMessagesloadingEnabled(false)
			setCurrentConversationId(id)
			conversationItemsChangeCallback()
		},
		entryForm,
	})

	const initConversationInfo = async () => {
		// 有对话 ID 且非临时 ID 时，获取历史消息
		if (currentConversationId && !isTempId(currentConversationId)) {
			await initConversationMessages(currentConversationId, false)
			setInitLoading(false)
		} else {
			// 不管有没有参数，都结束 loading，开始展示内容
			setInitLoading(false)
		}
	}

	useEffect(() => {
		if (!messagesloadingEnabled) {
			setMessagesloadingEnabled(true)
		} else {
			// 只有允许 loading 时，才清空对话列表数据
			setInitLoading(true)
			setHasMore(false)
			setMessages([])
			setNextSuggestions([])
			setHistoryMessages([])
			setIsSwitchingConversation(true)
		}
	}, [currentConversationId])

	// 监听清空完成状态
	useEffect(() => {
		// 当所有状态都清空且正在切换会话时，获取新会话数据
		if (isSwitchingConversation) {
			initConversationInfo()
			setIsSwitchingConversation(false) // 重置切换状态
		}
	}, [isSwitchingConversation, currentConversationId])

	const onPromptsItemClick = (content: string) => {
		onRequest({
			content,
		})
	}

	const isFormFilled = useMemo(() => {
		if (!currentApp?.parameters?.user_input_form?.length) {
			return true
		}
		return currentApp?.parameters.user_input_form.every(item => {
			const fieldInfo = Object.values(item)[0]
			return !!currentConversationInfo?.inputs?.[fieldInfo.variable]
		})
	}, [currentApp?.parameters, currentConversationInfo])

	const onSubmit = useCallback(
		(nextContent: string, options?: { files?: IFile[]; inputs?: Record<string, unknown> }) => {
			filesRef.current = options?.files || []
			onRequest({
				content: nextContent,
				files: options?.files as IMessageFileItem[],
			})
		},
		[onRequest],
	)

	const unStoredMessages4Render = useMemo(() => {
		return messages.map(item => {
			return {
				id: item.id,
				status: item.status,
				// @ts-expect-error TODO: 类型待优化
				error: item.message.error || '',
				workflows: item.message.workflows,
				agentThoughts: item.message.agentThoughts,
				retrieverResources: item.message.retrieverResources,
				files: item.message.files,
				content: item.message.content,
				role: item.status === Roles.LOCAL ? Roles.USER : Roles.AI,
			} as IMessageItem4Render
		})
	}, [messages])

	const messageItems = useMemo(() => {
		return [...historyMessages, ...unStoredMessages4Render]
	}, [historyMessages, unStoredMessages4Render])

	const fallbackCallback = useCallback(
		(conversationId: string) => {
			// 反馈成功后，重新获取历史消息，保持已加载的数据量
			initConversationMessages(conversationId, true)
		},
		[initConversationMessages],
	)

	// 如果应用配置 / 对话列表加载中，则展示 loading
	if (conversationListLoading || appLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spin spinning />
			</div>
		)
	}

	if (!currentApp) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Empty description="请先配置 Dify 应用">
					<Button
						type="primary"
						onClick={handleStartConfig}
					>
						开始配置
					</Button>
				</Empty>
			</div>
		)
	}

	return (
		<div className="flex h-screen flex-1 flex-col overflow-hidden">
			<div className="relative flex-1 overflow-hidden">
				{initLoading ? (
					<div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center">
						<Spin spinning />
					</div>
				) : null}

				{currentConversationId ? (
					<Chatbox
						conversationId={currentConversationId!}
						nextSuggestions={nextSuggestions}
						messageItems={messageItems}
						isRequesting={agent.isRequesting()}
						onPromptsItemClick={(...params) => {
							setNextSuggestions([])
							return onPromptsItemClick(...params)
						}}
						onSubmit={onSubmit}
						onCancel={async () => {
							abortRef.current()
							if (currentTaskId) {
								await difyApi!.stopTask(currentTaskId)
								initConversationMessages(currentConversationId!, false)
							}
						}}
						hasMore={hasMore}
						onLoadMore={loadMoreMessages}
						isFormFilled={isFormFilled}
						onStartConversation={formValues => {
							updateConversationInputs(formValues)

							if (!currentConversationId) {
								onAddConversation()
							}
						}}
						feedbackCallback={fallbackCallback}
						entryForm={entryForm}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<Spin spinning />
					</div>
				)}
			</div>
		</div>
	)
}
