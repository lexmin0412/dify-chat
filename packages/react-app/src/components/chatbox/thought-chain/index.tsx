import { CheckCircleFilled } from '@ant-design/icons'
import { IAgentThought } from '@dify-chat/api'
import { copyToClipboard } from '@toolkit-fe/clipboard'
import { Collapse, message } from 'antd'
import { omit } from 'lodash-es'

import LucideIcon from '../../lucide-icon'
import { MarkdownRenderer } from '../../markdown-renderer'
import CollapseItem from './collapse-item'
import { useTranslation } from 'react-i18next'

interface IThoughtChainProps {
	/**
	 * 类名
	 */
	className?: string
	/**
	 * 思维链的唯一 Key
	 */
	uniqueKey: string
	/**
	 * 原始思维链数据
	 */
	items?: IAgentThought[]
}

/**
 * 思维链组件（处理 Dify 原始思维链数据到 Ant Design X 思维链数据的转换）
 */
export default function ThoughtChain(props: IThoughtChainProps) {
	const { uniqueKey, items, className } = props
	const { t } = useTranslation()

	if (!items?.length) {
		return null
	}

	const thoughtChainItems = items.map(item => {
		const collapseItems = [
			{
				key: `${uniqueKey}-tool_input`,
				label: '请求',
				children: <CollapseItem text={item.tool_input} />,
				visible: !!item.tool_input,
			},
			{
				key: `${uniqueKey}-observation`,
				label: '响应',
				children: <CollapseItem text={item.observation} />,
				visible: !!item.observation,
			},
		]
			.filter(item => {
				return item.visible
			})
			.map(item => {
				return omit(item, ['visible'])
			})

		return {
			title: (
				<div className="text-base">
					<LucideIcon name="hammer" />
					{item.tool
						? `${t('message.tool.title_prefix')} ${item.tool}`
						: t('message.tool.title_default')}
				</div>
			),
			status: 'success',
			icon: <CheckCircleFilled />,
			description: collapseItems?.length ? (
				<>
					<Collapse
						className="!mt-3 min-w-chat-card"
						size="small"
						items={collapseItems}
					/>
					{item.thought ? <pre className="border-none">{item.thought}</pre> : null}
				</>
			) : null,
		}
	})

	if (!thoughtChainItems?.length) {
		return null
	}

	return (
		<div className={`${className} w-full overflow-hidden`}>
			{items.map((item, index) => {
				if (item.tool) {
					return (
						<Collapse
							expandIconPosition="end"
							size="small"
							className={`w-full overflow-auto ${index === 0 ? '!mt-3' : 'mt-0'} ${index === 0 && items.length === 1 ? '!mb-3' : 'mb-0'}`}
							key={item.id}
							items={[
								{
									key: item.tool,
									label: (
										<div className="flex items-center">
											<LucideIcon name="hammer" />
											<span className="mx-1">已使用</span> <span>{item.tool}</span>
										</div>
									),
									children: (
										<div className="bg-transparent">
											<div className="">
												<div className="flex items-center">
													<span className="mr-2">请求</span>
													<LucideIcon
														name="copy"
														className="cursor-pointer"
														onClick={async () => {
															await copyToClipboard(item.tool_input)
															message.success('复制成功')
														}}
													/>
												</div>
												<pre className="mt-1 box-border w-full overflow-hidden text-wrap break-all p-1">
													{item.tool_input}
												</pre>
											</div>
											<div className="mt-2">
												<div className="flex items-center">
													<span className="mr-2">响应</span>
													<LucideIcon
														name="copy"
														className="cursor-pointer"
														onClick={async () => {
															await copyToClipboard(item.observation)
															message.success('复制成功')
														}}
													/>
												</div>
												<pre className="mt-1 box-border w-full overflow-hidden text-wrap break-all p-1">
													{item.observation}
												</pre>
											</div>
										</div>
									),
								},
							]}
						/>
					)
				}
				return (
					<MarkdownRenderer
						key={item.id}
						markdownText={item.thought}
					/>
				)
			})}
		</div>
	)
}
