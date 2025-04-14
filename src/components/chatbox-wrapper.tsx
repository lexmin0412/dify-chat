import { UnorderedListOutlined } from '@ant-design/icons'
import { Prompts } from '@ant-design/x'
import {
	DifyApi,
	IFile,
	IGetAppInfoResponse,
	IGetAppParametersResponse,
	IMessageFileItem,
} from '@dify-chat/api'
import { IMessageItem4Render } from '@dify-chat/api'
import { Chatbox, ConversationList, IConversationItem } from '@dify-chat/components'
import { IDifyAppItem } from '@dify-chat/core'
import { isTempId, useIsMobile } from '@dify-chat/helpers'
import { Button, Empty, GetProp, message, Popover, Spin } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

import { DEFAULT_CONVERSATION_NAME } from '@/constants'
import { useLatest } from '@/hooks/use-latest'
import { useX } from '@/hooks/useX'

import { ChatPlaceholder } from './chat-placeholder'
import { MobileHeader } from './mobile/header'

interface IChatboxWrapperProps {
	/**
	 * 应用信息
	 */
	appInfo?: IGetAppInfoResponse
	/**
	 * 应用参数
	 */
	appParameters?: IGetAppParametersResponse
	/**
	 * Dify 应用配置
	 */
	appConfig?: IDifyAppItem
	/**
	 * Dify API 实例
	 */
	difyApi: DifyApi
	/**
	 * 当前对话 ID
	 */
	conversationId?: string
	/**
	 * 对话列表 loading
	 */
	conversationListLoading?: boolean
	/**
	 * 当前对话名称
	 */
	conversationName: string
	/**
	 * 对话列表
	 */
	conversationItems: IConversationItem[]
	/**
	 * 对话 ID 变更时触发的回调函数
	 * @param id 即将变更的对话 ID
	 */
	onConversationIdChange: (id: string) => void
	/**
	 * 对话列表变更时触发的回调函数
	 */
	onItemsChange: (items: IConversationItem[]) => void
	/**
	 * 内部处理对话列表变更的函数
	 */
	conversationItemsChangeCallback: () => void
	/**
	 * 添加对话
	 */
	onAddConversation: () => void
	/**
	 * 应用配置加载中
	 */
	appConfigLoading?: boolean
	/**
	 * 触发配置应用事件
	 */
	handleStartConfig?: () => void
}

/**
 * 聊天容器 进入此组件时, 应保证应用信息和对话列表已经加载完成
 */
export default function ChatboxWrapper(props: IChatboxWrapperProps) {
	const {
		appConfig,
		appInfo,
		appParameters,
		difyApi,
		conversationId,
		conversationItems,
		conversationName,
		onConversationIdChange,
		conversationListLoading,
		onAddConversation,
		onItemsChange,
		conversationItemsChangeCallback,
		appConfigLoading,
		handleStartConfig,
	} = props

	const isMobile = useIsMobile()
	const abortRef = useRef(() => {})
	useEffect(() => {
		return () => {
			abortRef.current()
		}
	}, [])
	const [initLoading, setInitLoading] = useState<boolean>(false)
	const [historyMessages, setHistoryMessages] = useState<IMessageItem4Render[]>([])
	const [inputParams, setInputParams] = useState<{ [key: string]: unknown }>({})

	const [nextSuggestions, setNextSuggestions] = useState<string[]>([])
	// 定义 ref, 用于获取最新的 conversationId
	const latestProps = useLatest({
		conversationId,
	})
	const latestState = useLatest({
		inputParams,
	})

	const filesRef = useRef<IFile[]>([])

	/**
	 * 获取下一轮问题建议
	 */
	const getNextSuggestions = async (message_id: string) => {
		const result = await difyApi.getNextSuggestions({ message_id })
		setNextSuggestions(result.data)
	}

	/**
	 * 获取对话的历史消息
	 */
	const getConversationMessages = async (conversationId: string) => {
		// 如果是临时 ID，则不获取历史消息
		if (isTempId(conversationId)) {
			return
		}
		const result = await difyApi.getConversationHistory(conversationId)

		if (!result?.data?.length) {
			return
		}

		const newMessages: IMessageItem4Render[] = []

		// 只有当历史消息中的参数不为空时才更新
		if (result?.data?.length && Object.values(result.data?.[0]?.inputs)?.length) {
			setInputParams(result.data[0]?.inputs || {})
		}

		result.data.forEach(item => {
			const createdAt = dayjs(item.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')
			newMessages.push(
				{
					id: item.id,
					content: item.query,
					status: 'success',
					isHistory: true,
					files: item.message_files,
					role: 'user',
					created_at: createdAt,
				},
				{
					id: item.id,
					content: item.answer,
					status: item.status === 'error' ? item.status : 'success',
					error: item.error || '',
					isHistory: true,
					feedback: item.feedback,
					agentThoughts: item.agent_thoughts || [],
					retrieverResources: item.retriever_resources || [],
					role: 'ai',
					created_at: createdAt,
				},
			)
		})

		setMessages([])
		setHistoryMessages(newMessages)
		if (newMessages?.length) {
			// 如果下一步问题建议已开启，则请求接口获取
			if (appParameters?.suggested_questions_after_answer.enabled) {
				getNextSuggestions(newMessages[newMessages.length - 1].id)
			}
		}
	}

	const { agent, onRequest, messages, setMessages, currentTaskId } = useX({
		latestProps,
		latestState,
		filesRef,
		getNextSuggestions,
		appParameters,
		abortRef,
		getConversationMessages,
		onConversationIdChange,
		difyApi,
	})

	const initConversationInfo = async () => {
		// 有对话 ID 且非临时 ID 时，获取历史消息
		if (conversationId && !isTempId(conversationId)) {
			await getConversationMessages(conversationId)
			setInitLoading(false)
		} else {
			// 不管有没有参数，都结束 loading，开始展示内容
			setInitLoading(false)
		}
	}

	const resetFormValues = () => {
		// 遍历 inputParams 置为 undefined
		if (appParameters?.user_input_form?.length) {
			const newInputParams = { ...inputParams }
			appParameters?.user_input_form.forEach(item => {
				const field = item['text-input']
				newInputParams[field.variable] = undefined
			})
			setInputParams(newInputParams)
		}
	}

	useEffect(() => {
		setInitLoading(true)
		setMessages([])
		setHistoryMessages([])
		initConversationInfo()
		// 当 ID 为临时ID 时，清除初始参数
		if (isTempId(conversationId)) {
			resetFormValues()
		}
	}, [conversationId])

	const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = info => {
		onRequest({
			content: info.data.description as string,
		})
	}

	const isFormFilled = useMemo(() => {
		if (!appParameters?.user_input_form?.length) {
			return true
		}
		if (conversationId && !isTempId(conversationId)) {
			return true
		}
		return (
			appParameters?.user_input_form?.every(item => {
				const field = item['text-input']
				return !!inputParams[field.variable]
			}) || false
		)
	}, [appParameters, inputParams])

	const onSubmit = (
		nextContent: string,
		options?: { files?: IFile[]; inputs?: Record<string, unknown> },
	) => {
		// 先校验表单是否填写完毕
		if (!isFormFilled) {
			// 过滤出没有填写的字段
			const unFilledFields =
				appParameters?.user_input_form
					.filter(item => {
						const field = item['text-input']
						return !inputParams[field.variable] && field.required
					})
					.map(item => item['text-input'].label) || []
			message.error(`${unFilledFields.join('、')}不能为空`)
			return
		}

		filesRef.current = options?.files || []
		onRequest({
			content: nextContent,
			files: options?.files as IMessageFileItem[],
		})
	}

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
				role: item.status === 'local' ? 'user' : 'ai',
			} as IMessageItem4Render
		})
	}, [messages])

	const conversationTitle = (
		<Popover
			trigger={['click']}
			content={
				<div className="w-60">
					<div className="text-base font-semibold">对话列表</div>
					<Spin spinning={conversationListLoading}>
						{conversationItems?.length ? (
							<ConversationList
								renameConversationPromise={(conversationId: string, name: string) =>
									difyApi?.renameConversation({
										conversation_id: conversationId,
										name,
									})
								}
								deleteConversationPromise={difyApi?.deleteConversation}
								items={conversationItems}
								activeKey={conversationId}
								onActiveChange={onConversationIdChange}
								onItemsChange={onItemsChange}
								refreshItems={conversationItemsChangeCallback}
							/>
						) : (
							<Empty description="暂无会话" />
						)}
					</Spin>
					<Button
						className="mt-3"
						onClick={onAddConversation}
						block
						type="primary"
					>
						新增对话
					</Button>
				</div>
			}
			placement={isMobile ? 'bottom' : 'bottomLeft'}
		>
			<div className="inline-flex items-center">
				<UnorderedListOutlined className="mr-3 cursor-pointer" />
				<span>{conversationName || DEFAULT_CONVERSATION_NAME}</span>
			</div>
		</Popover>
	)

	// 如果应用配置 / 对话列表加载中，则展示 loading
	if (conversationListLoading || appConfigLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<Spin spinning />
			</div>
		)
	}

	if (!appConfig) {
		return (
			<div className="w-full h-full flex items-center justify-center">
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

	console.log('appInfoappInfo', appInfo)

	return (
		<div className="flex h-screen flex-col overflow-hidden flex-1">
			{isMobile ? <MobileHeader centerChildren={conversationTitle} /> : null}

			<div className="flex-1 overflow-hidden relative">
				{initLoading ? (
					<div className="absolute w-full h-full left-0 top-0 z-50 flex items-center justify-center">
						<Spin spinning />
					</div>
				) : null}

				{
					// 没有对话时, 展示开始对话入口
					!conversationItems.length ? (
						<ChatPlaceholder
							conversationId={conversationId}
							formFilled={isFormFilled}
							onStartConversation={formValues => {
								setInputParams(formValues)
								if (!conversationId) {
									onAddConversation()
								}
							}}
							appInfo={appInfo}
							user_input_form={appParameters?.user_input_form}
						/>
					) : conversationId && isFormFilled ? (
						<Chatbox
							appConfig={appConfig!}
							conversationId={conversationId}
							appParameters={appParameters}
							nextSuggestions={nextSuggestions}
							messageItems={[...historyMessages, ...unStoredMessages4Render]}
							isRequesting={agent.isRequesting()}
							onPromptsItemClick={onPromptsItemClick}
							onSubmit={onSubmit}
							onCancel={async () => {
								abortRef.current()
								if (currentTaskId) {
									await difyApi.stopTask(currentTaskId)
									getConversationMessages(conversationId)
								}
							}}
							feedbackApi={difyApi.feedbackMessage}
							feedbackCallback={(conversationId: string) => {
								// 反馈成功后，重新获取历史消息
								getConversationMessages(conversationId)
							}}
							uploadFileApi={difyApi.uploadFile}
							difyApi={difyApi}
						/>
					) : appParameters?.user_input_form?.length ? (
						<ChatPlaceholder
							conversationId={conversationId}
							formFilled={isFormFilled}
							onStartConversation={formValues => {
								setInputParams(formValues)
								if (!conversationId) {
									onAddConversation()
								}
							}}
							appInfo={appInfo}
							user_input_form={appParameters?.user_input_form}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Spin spinning />
						</div>
					)
				}
			</div>
		</div>
	)
}
