import {
	DifyApi,
	ICreateAnnotationRequest,
	IGetAppParametersResponse,
	IRating,
} from '@dify-chat/api'
import { copyToClipboard } from '@toolkit-fe/clipboard'
import { useRequest, useSetState } from 'ahooks'
import { message as antdMessage, Button, Drawer, Form, Input, Space } from 'antd'
import { useMemo, useState } from 'react'

import LucideIcon from '../../lucide-icon'
import ActionButton from './action-btn'
import DislikeConfirm from './dislike-confirm'

interface IMessageFooterProps {
	/**
	 * 是否正在对话中
	 */
	isRequesting?: boolean
	/**
	 * 反馈 API
	 */
	feedbackApi: (params: {
		/**
		 * 反馈的消息 ID
		 */
		messageId: string
		/**
		 * 反馈操作类型
		 */
		rating: IRating
		/**
		 * 反馈文本内容
		 */
		content: string
	}) => Promise<unknown>
	/**
	 * 创建标注 API
	 */
	createAnnotationApi: (params: ICreateAnnotationRequest) => Promise<unknown>
	/**
	 * 文本转语音 API
	 */
	ttsApi: DifyApi['text2Audio']
	/**
	 * 消息 ID
	 */
	messageId: string
	/**
	 * 消息中的文字内容部分
	 */
	messageContent: string
	/**
	 * 用户对消息的反馈
	 */
	feedback: {
		/**
		 * 用户对消息的点赞/点踩/撤销操作
		 */
		rating?: IRating
		/**
		 * 操作回调
		 */
		callback: () => void
	}
	/**
	 * TTS 配置
	 */
	ttsConfig?: IGetAppParametersResponse['text_to_speech']
	/**
	 * 触发重新生成消息
	 */
	onRegenerateMessage?: () => void
	/**
	 * 对应的问题内容
	 */
	question?: string
}

/**
 * 消息底部操作区
 */
export default function MessageFooter(props: IMessageFooterProps) {
	const {
		isRequesting,
		messageId,
		messageContent,
		feedback: { rating, callback },
		feedbackApi,
		createAnnotationApi,
		ttsApi,
		ttsConfig,
		onRegenerateMessage,
		question,
	} = props

	const isLiked = rating === 'like'
	const isDisLiked = rating === 'dislike'
	const [loading, setLoading] = useSetState({
		like: false,
		dislike: false,
	})
	const [ttsPlaying, setTTSPlaying] = useState(false)
	const [cachedAudioUrl, setCachedAudioUrl] = useState<string>('')
	const [annotationDrawerVisible, setAnnotationDrawerVisible] = useState(false)
	const [annotationForm] = Form.useForm()

	/**
	 * 创建标注
	 */
	const { runAsync: runCreateAnnotation, loading: annotationLoading } = useRequest(
		async () => {
			const values = await annotationForm.validateFields()
			return createAnnotationApi(values)
		},
		{
			manual: true,
			onSuccess() {
				antdMessage.success('标注成功')
				setAnnotationDrawerVisible(false)
				annotationForm.resetFields()
			},
		},
	)

	/**
	 * 用户对消息的反馈
	 */
	const { runAsync: runFeedback } = useRequest(
		(rating: IRating, content?: string) => {
			return feedbackApi({
				messageId: (messageId as string).replace('-answer', ''),
				rating: rating,
				content: content || '',
			})
		},
		{
			manual: true,
			onSuccess() {
				antdMessage.success('操作成功')
				callback?.()
			},
			onFinally() {
				setLoading({
					like: false,
					dislike: false,
				})
			},
		},
	)

	/**
	 * 播放音频
	 * @param audioUrl 音频 URL
	 */
	const playAudio = async (audioUrl: string) => {
		const audio = new Audio()
		audio.src = audioUrl
		audio.play()
		setTTSPlaying(true)
		audio.addEventListener('ended', () => {
			// 播放完成后释放 URL 对象
			// URL.revokeObjectURL(audioUrl);
			setTTSPlaying(false)
		})
	}

	/**
	 * 文本转语音
	 */
	const { runAsync: runTTS, loading: ttsLoading } = useRequest(
		(text: string) => {
			return ttsApi({
				text,
			})
				.then(response => response.blob())
				.then(blob => {
					const audioUrl = URL.createObjectURL(blob)
					setCachedAudioUrl(audioUrl)
					playAudio(audioUrl)
				})
		},
		{
			manual: true,
		},
	)

	/**
	 * 操作按钮列表
	 */
	const actionButtons = useMemo(() => {
		return [
			// 重新生成回复
			{
				icon: <LucideIcon name="refresh-ccw" />,
				title: '重新生成回复',
				hidden: false,
				onClick: () => {
					onRegenerateMessage?.()
				},
			},
			// 复制内容
			{
				icon: <LucideIcon name="copy" />,
				onClick: async () => {
					await copyToClipboard(messageContent)
					antdMessage.success('复制成功')
				},
				title: '复制内容',
				active: false,
				loading: false,
				hidden: false,
			},
			// 标注
			{
				icon: <LucideIcon name="edit-3" />,
				title: '标注',
				onClick: () => {
					setAnnotationDrawerVisible(true)
					annotationForm.setFieldsValue({
						answer: messageContent,
						question: question,
					})
				},
				active: false,
				loading: false,
				hidden: false,
			},
			// 点赞
			{
				icon: <LucideIcon name="thumbs-up" />,
				onClick: () => {
					setLoading({
						like: true,
					})
					runFeedback(isLiked ? null : 'like')
				},
				title: '点赞',
				active: isLiked,
				loading: loading.like,
				hidden: false,
			},
			// 点踩
			{
				icon: (
					<DislikeConfirm
						isDisLiked={isDisLiked}
						runFeedback={runFeedback}
					/>
				),
				title: '点踩',
				// 如果已经点过踩了，则取消
				onClick: () => {
					if (isDisLiked) {
						setLoading({
							dislike: true,
						})
						runFeedback(null)
					}
				},
				active: isDisLiked,
				loading: loading.dislike,
				hidden: false,
			},
			// 文本转语音
			{
				icon: (
					<LucideIcon
						color={
							isRequesting
								? undefined
								: ttsPlaying
									? 'var(--theme-primary-color)'
									: 'var(--theme-text-color)'
						}
						name={ttsPlaying ? 'volume-2' : 'volume-1'}
						size={18}
						strokeWidth={1.75}
					/>
				),
				title: '文本转语音',
				onClick: () => {
					if (ttsPlaying) return
					if (cachedAudioUrl) {
						playAudio(cachedAudioUrl)
					} else {
						runTTS(messageContent)
					}
				},
				active: ttsPlaying,
				loading: ttsLoading,
				hidden: !ttsConfig?.enabled,
			},
		]
	}, [
		onRegenerateMessage,
		isRequesting,
		ttsPlaying,
		ttsLoading,
		cachedAudioUrl,
		isDisLiked,
		isLiked,
		loading,
		runFeedback,
		messageContent,
		runTTS,
		setLoading,
		ttsConfig?.enabled,
		annotationForm,
		question,
	])

	return (
		<>
			<Space>
				{actionButtons.map(
					(buttonProps, index) =>
						!buttonProps.hidden && (
							<ActionButton
								key={index}
								icon={buttonProps.icon}
								onClick={buttonProps.onClick}
								active={buttonProps.active}
								loading={buttonProps.loading}
								disabled={isRequesting}
								title={buttonProps.title}
							/>
						),
				)}
			</Space>
			<Drawer
				title="创建标注"
				size={500}
				open={annotationDrawerVisible}
				onClose={() => setAnnotationDrawerVisible(false)}
				extra={
					<Space>
						<Button onClick={() => setAnnotationDrawerVisible(false)}>取消</Button>
						<Button
							type="primary"
							loading={annotationLoading}
							onClick={runCreateAnnotation}
						>
							确认
						</Button>
					</Space>
				}
			>
				<Form
					form={annotationForm}
					layout="vertical"
				>
					<Form.Item
						name="question"
						label="Question"
						rules={[{ required: true, message: '请输入问题' }]}
					>
						<Input.TextArea
							rows={4}
							placeholder="请输入问题"
						/>
					</Form.Item>
					<Form.Item
						name="answer"
						label="Answer"
						rules={[{ required: true, message: '请输入答案' }]}
					>
						<Input.TextArea
							rows={10}
							placeholder="请输入答案"
						/>
					</Form.Item>
				</Form>
			</Drawer>
		</>
	)
}
