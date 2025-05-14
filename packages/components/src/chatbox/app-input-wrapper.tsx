import { CaretRightOutlined } from '@ant-design/icons'
import { useAppContext, useConversationsContext } from '@dify-chat/core'
import { isTempId } from '@dify-chat/helpers'
import { Collapse, CollapseProps, theme } from 'antd'
import { CSSProperties, useEffect, useMemo, useState } from 'react'

import AppInputForm, { IAppInputFormProps } from './app-input-form'

const COLLAPSE_KEY = 'conversation-input-params-setting'

/**
 * 应用输入参数管理容器
 */
export default function AppInputWrapper(props: IAppInputFormProps) {
	const { currentApp } = useAppContext()
	const { currentConversationId } = useConversationsContext()
	const { token } = theme.useToken()
	const [activeKey, setActiveKey] = useState<string[]>([])

	useEffect(() => {
		// 每当切换对话时，都默认打开 Collapse，目的是渲染一遍表单（Collpase 后续关掉了也不会清除 form），以便 entryForm 能获取到表单值
		setActiveKey([COLLAPSE_KEY])
	}, [currentConversationId])

	useEffect(() => {
		props.entryForm.resetFields()
	}, [currentConversationId])

	/**
	 * 是否禁用输入
	 */
	const disabled = useMemo(() => {
		// 如果是临时对话，则允许输入
		if (isTempId(currentConversationId)) {
			return false
		}
		// 否则取配置值
		return !currentApp?.config?.inputParams?.enableUpdateAfterCvstStarts
	}, [currentConversationId])

	if (!currentApp?.parameters.user_input_form?.length) {
		return null
	}

	const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = panelStyle => [
		{
			key: COLLAPSE_KEY,
			label: (
				<div className="flex items-center">
					<div className="font-semibold text-base">对话参数设置</div>
					{!currentApp.config?.inputParams?.enableUpdateAfterCvstStarts ? (
						<div className="text-desc">（注意：对话开始后，参数设置将无法修改）</div>
					) : null}
				</div>
			),
			children: (
				<AppInputForm
					formFilled={props.formFilled}
					onStartConversation={props.onStartConversation}
					entryForm={props.entryForm}
					uploadFileApi={props.uploadFileApi}
					disabled={disabled}
				/>
			),
			style: panelStyle,
		},
	]

	const panelStyle: React.CSSProperties = {
		color: token.colorText,
		border: `1px solid var(--theme-border-color)`,
		borderRadius: '8px',
	}

	return (
		<Collapse
			bordered={false}
			activeKey={activeKey}
			onChange={value => setActiveKey(value)}
			expandIconPosition="end"
			expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
			items={getItems(panelStyle)}
		/>
	)
}
