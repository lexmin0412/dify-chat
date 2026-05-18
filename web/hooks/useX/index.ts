// import { useXAgent, useXChat, XStream } from '@ant-design/x'
import { useXChat, XRequest } from '@ant-design/x-sdk'
import { IFile } from '@/lib/api'
import { Roles } from '@/lib/core'
import { isTempId } from '@/lib/helpers'
import { FormInstance } from 'antd'
import { useEffect, useRef, useState } from 'react'

import { RESPONSE_MODE } from '@/config'
import { IAgentMessage } from '@/lib/api'
import { DifyApi } from '@/lib/dify-client'

import { useAuth } from '../use-auth'
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
	} = options

	const { userId: user } = useAuth()
	const onConversationIdChangeRef = useRef(onConversationIdChange)
	onConversationIdChangeRef.current = onConversationIdChange

	const onTaskIdChangeRef = useRef(onTaskIdChange)
	onTaskIdChangeRef.current = onTaskIdChange

	const [provider] = useState(
		new CustomProvider({
			onTaskIdChange: (id: string) => {
				onTaskIdChangeRef.current(id)
			},
			onConversationIdChange: (id: string) => {
				onConversationIdChangeRef.current(id)
			},
			request: XRequest<CustomInput, CustomOutput>(
				// 这个参数没有意义，只是为了符合传参规范
				'dify-chat-messages',
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
		},
		requestFallback: {
			role: Roles.AI,
			content: 'Request failed, Please try again later.',
		},
	})

	const wasRequesting = useRef(false)

	useEffect(() => {
		if (wasRequesting.current && !isRequesting) {
			const lastMessage = messages[messages.length - 1] as unknown as IAgentMessage
			// @ts-expect-error FIXME: IAgentMessage 类型兼容
			if (lastMessage?.role === Roles.AI && lastMessage?.id) {
// @ts-expect-error FIXME: IAgentMessage 类型缺失 id				getNextSuggestions(String(lastMessage.id))
			}
		}
		wasRequesting.current = isRequesting
	}, [isRequesting, messages, getNextSuggestions])

	return {
		onRequest,
		messages,
		setMessages,
		abort,
		isRequesting,
	}
}
