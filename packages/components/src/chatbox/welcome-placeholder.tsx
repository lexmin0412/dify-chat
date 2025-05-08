import {
	AndroidFilled,
	CommentOutlined,
	EllipsisOutlined,
	FireOutlined,
	HeartOutlined,
	ReadOutlined,
	ShareAltOutlined,
	SmileOutlined,
} from '@ant-design/icons'
import { Prompts, Welcome } from '@ant-design/x'
import { DifyApi } from '@dify-chat/api'
import { useAppContext } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { Button, FormInstance, GetProp, message, Space } from 'antd'
import classNames from 'classnames'
import { useMemo } from 'react'

import { validateAndGenErrMsgs } from '../utils'
import AppInputWrapper from './app-input-wrapper'

const renderTitle = (icon: React.ReactElement, title: string) => (
	<Space align="start">
		{icon}
		<span>{title}</span>
	</Space>
)

interface IWelcomePlaceholderProps {
	/**
	 * 是否展示提示项
	 */
	showPrompts: boolean
	/**
	 * 点击提示项时触发的回调函数
	 */
	onPromptItemClick: GetProp<typeof Prompts, 'onItemClick'>
	/**
	 * 表单是否填写
	 */
	formFilled: boolean
	/**
	 * 表单填写状态改变回调
	 */
	onStartConversation: (formValues: Record<string, unknown>) => void
	/**
	 * 当前对话 ID
	 */
	conversationId?: string
	/**
	 * 应用入参的表单实例
	 */
	entryForm: FormInstance<Record<string, unknown>>
	/**
	 * 上传文件 API
	 */
	uploadFileApi: DifyApi['uploadFile']
}

/**
 * 对话内容区的欢迎占位符
 */
export const WelcomePlaceholder = (props: IWelcomePlaceholderProps) => {
	const { onPromptItemClick, showPrompts, uploadFileApi } = props
	const isMobile = useIsMobile()
	const { currentApp } = useAppContext()

	const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = useMemo(() => {
		const DefaultPlaceholderPromptsItems = [
			{
				key: '1',
				label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
				description: 'What are you interested in?',
				children: [
					{
						key: '1-1',
						description: `What's new in X?`,
					},
					{
						key: '1-2',
						description: `What's AGI?`,
					},
					{
						key: '1-3',
						description: `Where is the doc?`,
					},
				],
			},
			{
				key: '2',
				label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Design Guide'),
				description: 'How to design a good product?',
				children: [
					{
						key: '2-1',
						icon: <HeartOutlined />,
						description: `Know the well`,
					},
					{
						key: '2-2',
						icon: <SmileOutlined />,
						description: `Set the AI role`,
					},
					{
						key: '2-3',
						icon: <CommentOutlined />,
						description: `Express the feeling`,
					},
				],
			},
		]
		if (currentApp?.parameters?.suggested_questions?.length) {
			return [
				{
					key: 'suggested_question',
					label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
					description: 'What are you interested in?',
					children: currentApp.parameters.suggested_questions.map((item, index) => {
						return {
							key: `suggested_question-${index}`,
							description: item,
						}
					}),
				},
			]
		}
		if (isMobile) {
			return DefaultPlaceholderPromptsItems.slice(0, 1)
		}
		return DefaultPlaceholderPromptsItems
	}, [isMobile])

	return (
		<div className="flex justify-center w-full px-3 box-border mx-auto">
			<Space
				direction="vertical"
				className={classNames({
					'w-full md:!w-3/4': true,
					'pb-6': !showPrompts && currentApp?.parameters.user_input_form?.length,
					'pt-3': showPrompts,
				})}
			>
				{showPrompts ? (
					<Welcome
						variant="borderless"
						icon={
							<div className="flex items-center justify-center rounded-[50%] w-16 h-16 border-gray-100 border-solid border-[1px] bg-light-gray">
								<AndroidFilled className="text-3xl text-primary" />
							</div>
						}
						title={currentApp?.parameters?.opening_statement || "Hello, I'm Dify Chat"}
						description="Base on Dify API, Dify Chat is a web app that can interact with AI."
						extra={
							<Space>
								<Button icon={<ShareAltOutlined />} />
								<Button icon={<EllipsisOutlined />} />
							</Space>
						}
					/>
				) : null}

				{/* 应用输入参数 */}
				<AppInputWrapper
					formFilled={props.formFilled}
					onStartConversation={props.onStartConversation}
					entryForm={props.entryForm}
					uploadFileApi={uploadFileApi!}
				/>

				{showPrompts ? (
					<Prompts
						className="mt-4"
						title="问一问："
						vertical={isMobile}
						items={placeholderPromptsItems}
						styles={{
							list: {
								width: '100%',
							},
							item: isMobile
								? {
										width: '100%',
									}
								: {
										flex: 1,
									},
						}}
						onItemClick={async (...params) => {
							validateAndGenErrMsgs(props.entryForm).then(res => {
								if (res.isSuccess) {
									onPromptItemClick(...params)
								} else {
									message.error(res.errMsgs)
								}
							})
						}}
					/>
				) : null}
			</Space>
		</div>
	)
}
