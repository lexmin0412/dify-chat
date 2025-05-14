import { EllipsisOutlined, FireOutlined, ShareAltOutlined } from '@ant-design/icons'
import { Prompts, Welcome } from '@ant-design/x'
import { DifyApi } from '@dify-chat/api'
import { useAppContext } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { Button, FormInstance, GetProp, message, Space } from 'antd'
import classNames from 'classnames'
import { useMemo } from 'react'

import LucideIcon from '../lucide-icon'
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
		if (currentApp?.parameters?.suggested_questions?.length) {
			// 开场白标题
			const suggestedTitle = currentApp?.parameters?.opening_statement || 'Hot Topics'
			return [
				{
					key: 'suggested_question',
					label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, suggestedTitle),
					description: '',
					children: currentApp.parameters.suggested_questions.map((item, index) => {
						return {
							key: `suggested_question-${index}`,
							description: item,
						}
					}),
				},
			]
		}
		return []
	}, [currentApp?.parameters?.suggested_questions, currentApp?.parameters?.opening_statement])

	return (
		<div className="flex justify-center w-full px-3 box-border mx-auto mb-3">
			<Space
				size={12}
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
							<div className="flex items-center justify-center rounded-[50%] w-14 h-14 border-theme-border border-solid border-[1px] bg-theme-bg">
								<LucideIcon
									name="bot"
									size={30}
									className="text-3xl text-primary dark:text-theme-text"
								/>
							</div>
						}
						title={"Hello, I'm Dify Chat"}
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

				{showPrompts && placeholderPromptsItems.length ? (
					<Prompts
						// className="mt-3"
						// title="问一问："
						vertical={isMobile}
						items={placeholderPromptsItems}
						styles={{
							list: {
								width: '100%',
							},
							item: isMobile
								? {
										width: '100%',
										color: 'var(--theme-text-color)',
									}
								: {
										flex: 1,
										color: 'var(--theme-text-color)',
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
