import { CaretRightOutlined } from '@ant-design/icons'
import { useAppContext, useConversationsContext } from '@dify-chat/core'
import { isTempId } from '@dify-chat/helpers'
import { Collapse, CollapseProps, theme } from 'antd'
import { CSSProperties, useEffect, useMemo, useState } from 'react'

import AppInputForm, { IAppInputFormProps } from './app-input-form'

/**
 * 应用输入参数管理容器
 */
export default function AppInputWrapper(props: IAppInputFormProps) {
	const { currentApp } = useAppContext()
	const { currentConversationId } = useConversationsContext()
	const { token } = theme.useToken()
	const [activeKey, setActiveKey] = useState<string[]>([])

	useEffect(() => {
		if (isTempId(currentConversationId)) {
			setActiveKey(['1'])
		} else {
			setActiveKey([])
		}
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
			key: '1',
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
		borderRadius: '8px',
		border: `1px solid #eff0f5`,
	}

	return (
		<Collapse
			className="mt-3 bg-primary"
			bordered={false}
			activeKey={activeKey}
			onChange={value => setActiveKey(value)}
			expandIconPosition="end"
			expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
			style={{ background: token.colorBgContainer, borderColor: token.colorPrimary }}
			items={getItems(panelStyle)}
		/>
	)
}
