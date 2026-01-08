import { useAppContext } from '@dify-chat/core'
import { FormInstance, message, Space } from 'antd'
import classNames from 'classnames'

import { validateAndGenErrMsgs } from '@/utils'

import LucideIcon from '../lucide-icon'
import AppInputWrapper from './app-input-wrapper'

interface IWelcomePlaceholderProps {
	/**
	 * 是否展示提示项
	 */
	showPrompts: boolean
	/**
	 * 点击提示项时触发的回调函数
	 */
	onPromptItemClick: (content: string) => void
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
}

/**
 * 对话内容区的欢迎占位符
 */
export const WelcomePlaceholder = (props: IWelcomePlaceholderProps) => {
	const { onPromptItemClick, showPrompts } = props
	const { currentApp } = useAppContext()

	return (
		<div className="flex justify-center w-full box-border mx-auto my-3">
			<Space
				size={12}
				direction="vertical"
				className={classNames({
					'w-full md:w-[720px] px-3 md:px-6 box-border': true,
					'pb-6': !showPrompts && currentApp?.parameters.user_input_form?.length,
					'pt-3': showPrompts,
				})}
			>
				{showPrompts && currentApp?.parameters?.opening_statement ? (
					<div className="flex items-center">
						{/* 左侧展示图标 */}
						<div className="flex items-center justify-center rounded-[50%] w-14 h-14 border-theme-border border-solid border-[1px] bg-theme-bg">
							<LucideIcon
								name="bot"
								size={30}
								className="text-3xl text-primary dark:text-theme-text"
							/>
						</div>
						<div className="ml-4 flex-1 overflow-hidden">
							{/* 右侧标题 */}
							{(() => {
								const openingStatement = currentApp?.parameters?.opening_statement
								// 检查是否包含 HTML 标签
								const hasHtmlTags = openingStatement && /<[^>]*>/g.test(openingStatement)
								return hasHtmlTags ? (
									<div
										dangerouslySetInnerHTML={{
											__html: openingStatement,
										}}
									/>
								) : (
									<div className="font-semibold text-lg truncate">{openingStatement}</div>
								)
							})()}
							{/* 右侧建议选项 */}
							{currentApp.parameters.suggested_questions?.length ? (
								<div className="flex items-center flex-wrap w-full">
									{currentApp.parameters.suggested_questions?.map(item => {
										return (
											<div
												className="cursor-pointer text-theme-text mt-2 hover:text-primary mr-2 text-sm border border-desc hover:border-primary border-solid py-0.5 px-2 rounded-lg"
												color="blue"
												key={item}
												onClick={() => {
													validateAndGenErrMsgs(props.entryForm).then(res => {
														if (res.isSuccess) {
															onPromptItemClick(item)
														} else {
															message.error(res.errMsgs)
														}
													})
												}}
											>
												{item}
											</div>
										)
									})}
								</div>
							) : null}
						</div>
					</div>
				) : null}

				{/* 应用输入参数 */}
				<AppInputWrapper
					formFilled={props.formFilled}
					onStartConversation={props.onStartConversation}
					entryForm={props.entryForm}
				/>
			</Space>
		</div>
	)
}
