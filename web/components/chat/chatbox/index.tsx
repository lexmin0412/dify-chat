import { RedoOutlined } from '@ant-design/icons'
import { ArrowRightOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { IFile, IMessageItem4Render } from '@/lib/api'
import { OpeningStatementDisplayMode, Roles, useDifyChatStore } from '@/lib/core'
import { isTempId, useIsMobile } from '@/lib/helpers'
import { FormInstance, GetProp, message, Spin } from 'antd'
import { useDeferredValue, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { validateAndGenErrMsgs } from '@/components/chat/utils-index'

import { MessageSender } from '../message-sender'
import MessageContent from './message/content'
import MessageFooter from './message/footer'
import { WelcomePlaceholder } from './welcome-placeholder'
import { useTranslation } from 'react-i18next'

export interface ChatboxProps {
	/**
	 * 消息列表
	 */
	messageItems: IMessageItem4Render[]
	/**
	 * 是否正在请求
	 */
	isRequesting: boolean

	/**
	 * 是否有更多历史消息
	 */
	hasMore: boolean

	/**
	 * 加载更多历史消息
	 */
	onLoadMore: () => void

	/**
	 * 下一步问题建议
	 */
	nextSuggestions: string[]
	/**
	 * 推荐 Item 点击事件
	 */
	onPromptsItemClick: (content: string) => void
	/**
	 * 内容提交事件
	 * @param value 问题-文本
	 * @param files 问题-文件
	 */
	onSubmit: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
	/**
	 * 取消读取流
	 */
	onCancel: () => void
	/**
	 * 对话 ID
	 */
	conversationId: string
	/**
	 * 反馈执行成功后的回调
	 */
	feedbackCallback?: (conversationId: string) => void
	/**
	 * 表单是否填写
	 */
	isFormFilled: boolean
	/**
	 * 表单填写状态改变回调
	 */
	onStartConversation: (formValues: Record<string, unknown>) => void
	/**
	 * 应用入参表单实例
	 */
	entryForm: FormInstance<Record<string, unknown>>
}

/**
 * 对话内容区
 */
export const Chatbox = (props: ChatboxProps) => {
	const {
		messageItems,
		isRequesting,
		nextSuggestions,
		onPromptsItemClick,
		onSubmit,
		onCancel,
		conversationId,
		feedbackCallback,
		isFormFilled,
		onStartConversation,
		entryForm,
		hasMore,
		onLoadMore,
	} = props
	const { difyApi } = useDifyChatStore()
	const isMobile = useIsMobile()
	const currentApp = useDifyChatStore(s => s.currentApp)
	const { t } = useTranslation()

	// 控制回答过程中是否需要自动滚动到最底部
	const [shouldAutoScroll2Bottom, setShouldAutoScroll2Bottom] = useState(false)

	useEffect(() => {
		if (isRequesting) {
			setShouldAutoScroll2Bottom(true)
		} else {
			setShouldAutoScroll2Bottom(false)
		}
	}, [isRequesting])

	// 如果用户自行滚动，则将自动滚动开关关闭
	const handleUserScroll = () => {
		if (isRequesting) {
			setShouldAutoScroll2Bottom(false)
		}
	}

	const roles: GetProp<typeof Bubble.List, 'role'> = {
		ai: {
			placement: 'start',
		},
		user: {
			placement: 'end',
			style: isMobile
				? undefined
				: {
						// 减去一个头像的宽度
						maxWidth: '80%',
						marginLeft: '20%',
					},
		},
	}

	const items: GetProp<typeof Bubble.List, 'items'> = useMemo(() => {
		return messageItems?.map((messageItem, index) => {
			return {
				key: `${messageItem.id}-${messageItem.role}`,
				// 不要开启 loading 和 typing, 否则流式会无效
				// loading: status === 'loading',
				content: messageItem.content,
				contentRender: () => {
					return (
						<MessageContent
							onSubmit={onSubmit}
							messageItem={messageItem}
						/>
					)
				},
				// 用户发送消息时，status 为 local，需要展示为用户头像
				role: messageItem.role === Roles.LOCAL ? Roles.USER : messageItem.role,
				footer: messageItem.role === Roles.AI && (
					<div className="flex items-center">
						<MessageFooter
							ttsConfig={currentApp?.parameters?.text_to_speech}
							question={messageItems?.[index - 1]?.content}
							messageId={messageItem.id}
							messageContent={messageItem.content}
							feedback={{
								rating: messageItem.feedback?.rating,
								callback: () => {
									feedbackCallback?.(conversationId!)
								},
							}}
							isRequesting={isRequesting}
							onRegenerateMessage={() => {
								// 直接通过遍历找到当前消息的用户子消息，取其内容发送消息
								const currentItem = messageItems.find(item => item.id === messageItem.id)
								if (!currentItem) {
									console.error('消息不存在:', messageItem.id)
									message.error('消息不存在')
									return
								}
								const messageParams: {
									inputs: Record<string, unknown>
									files?: IFile[]
								} = {
									inputs: entryForm.getFieldsValue(),
								}
								if (currentItem.files && currentItem.files.length > 0) {
									messageParams.files = currentItem.files.map(file => ({
										type: file.type,
										transfer_method: file.transfer_method,
										url: file.url,
										upload_file_id: file.upload_file_id || '',
									})) as IFile[]
								}
								onSubmit(currentItem.content, messageParams)
							}}
						/>
						{messageItem.created_at && (
							<div className="text-desc ml-3 text-sm">
								{t('message.response_time')}：{messageItem.created_at}
							</div>
						)}
					</div>
				),
			}
		}) satisfies GetProp<typeof Bubble.List, 'items'>
	}, [
		messageItems,
		conversationId,
		difyApi,
		feedbackCallback,
		currentApp?.parameters,
		onSubmit,
		isRequesting,
		entryForm,
	])

	// 监听 items 更新，滚动到最底部
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	/**
	 * 监听 items 更新，滚动到最底部
	 */
	const scroll2BottomWhenMessagesChange = useEffectEvent(() => {
		// 如果非请求中，不滚动（防止影响下拉刷新功能）
		if (!isRequesting || !shouldAutoScroll2Bottom) {
			return
		}
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				behavior: 'smooth',
				top: scrollContainerRef.current.scrollHeight,
			})
		}
	})

	// 延迟更新，优化性能
	const deferredItems = useDeferredValue(items)
	useEffect(() => {
		scroll2BottomWhenMessagesChange()
	}, [deferredItems])

	// 获取应用的对话开场白展示模式
	const openingStatementMode =
		currentApp?.config?.extConfig?.conversation?.openingStatement?.displayMode

	// 是否展示开场白
	const promptsVisible = useMemo(() => {
		if (openingStatementMode === OpeningStatementDisplayMode.Always) {
			return true
		}
		return !items?.length && isTempId(conversationId)
	}, [openingStatementMode, items, conversationId])

	return (
		<div className="relative mx-auto my-0 box-border flex h-full w-full flex-col gap-4 overflow-hidden">
			<div className="h-full w-full overflow-hidden pt-1 pb-24">
				<div
					id="scrollableDiv"
					ref={scrollContainerRef}
					style={{
						height: '100%',
						overflow: 'auto',
						display: 'flex',
						flexDirection: 'column-reverse',
					}}
					onWheel={handleUserScroll}
					onTouchMove={handleUserScroll}
					onMouseDown={handleUserScroll}
				>
					<InfiniteScroll
						scrollableTarget="scrollableDiv"
						hasMore={hasMore}
						next={onLoadMore}
						dataLength={messageItems.length}
						loader={
							<div style={{ textAlign: 'center' }}>
								<Spin
									indicator={<RedoOutlined spin />}
									size="small"
								/>
							</div>
						}
						inverse
						style={{
							display: 'flex',
							flexDirection: 'column-reverse',
							// 减去除消息列表外其他纵向元素的高度
							minHeight: 'calc(100vh - 10.25rem)',
						}}
					>
						<div className="mx-auto box-border w-full flex-1 px-3 pb-6 md:max-w-[720px] md:px-6">
							{/* 🌟 消息列表 */}
							<Bubble.List
								items={items}
								role={roles}
							/>

							{/* 下一步问题建议 当存在消息列表，且非正在对话时才展示 */}
							{nextSuggestions?.length && items.length && !isRequesting ? (
								<div className="mt-3 py-3">
									<div className="text-desc">🤔 你可能还想问:</div>
									<div>
										{nextSuggestions?.map(item => {
											return (
												<div
													key={item}
													className="mt-3 flex items-center"
												>
													<div
														className="border-theme-border text-theme-desc flex max-w-full shrink-0 cursor-pointer items-center rounded-lg border border-solid p-2 text-sm"
														onClick={() => {
															onPromptsItemClick(item)
														}}
													>
														<span className="truncate">{item}</span>
														<ArrowRightOutlined className="ml-1" />
													</div>
												</div>
											)
										})}
									</div>
								</div>
							) : null}
						</div>
						{/* 🌟 欢迎占位 + 对话参数 */}
						<WelcomePlaceholder
							showPrompts={promptsVisible}
							onPromptItemClick={onPromptsItemClick}
							formFilled={isFormFilled}
							onStartConversation={onStartConversation}
							conversationId={conversationId}
							entryForm={entryForm}
						/>
					</InfiniteScroll>
				</div>
				<div
					className="bg-theme-main-bg absolute bottom-0 left-1/2 box-border w-full px-3 md:max-w-[720px] md:px-6"
					style={{
						transform: 'translateX(-50%)',
					}}
				>
					{/* 🌟 输入框 */}
					<MessageSender
						onSubmit={async (...params) => {
							return validateAndGenErrMsgs(entryForm).then(res => {
								if (res.isSuccess) {
									return onSubmit(...params)
								} else {
									message.error(res.errMsgs)
									return Promise.reject(`表单校验失败: ${res.errMsgs}`)
								}
							})
						}}
						isRequesting={isRequesting}
						className="!text-theme-text w-full"
						onCancel={onCancel}
					/>
					<div className="text-theme-desc h-8 truncate text-center text-sm leading-8">
						{currentApp?.site?.custom_disclaimer || t('system.default_disclaimer_content')}
					</div>
				</div>
			</div>
		</div>
	)
}
