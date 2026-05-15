import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	InfoOutlined,
	LoadingOutlined,
} from '@ant-design/icons'
import { IAgentMessage, IWorkflowNode } from '@/lib/api'
import { useAppContext } from '@/lib/core'
import { Collapse, CollapseProps, GetProp } from 'antd'
import { useMemo } from 'react'

import LucideIcon from '../../lucide-icon'
import WorkflowNodeDetail from './workflow-node-detail'
import WorkflowNodeIcon from './workflow-node-icon'

interface IWorkflowLogsProps {
	className?: string
	status: NonNullable<IAgentMessage['workflows']>['status']
	items: IWorkflowNode[]
}

export default function WorkflowLogs(props: IWorkflowLogsProps) {
	const { items, status, className } = props
	const { currentApp } = useAppContext()

	// Collapse 组件的通用 props
	const collapseCommonProps: Pick<CollapseProps, 'expandIconPlacement' | 'classNames'> = {
		expandIconPlacement: 'end',
		classNames: {
			root: 'border-none',
			body: 'border border-solid border-[#eff0f5] border-t-0 rounded-b-lg',
		},
	}

	// Collapse 组件的 item 通用 props
	const collapseItemVisibleProps: Pick<
		GetProp<CollapseProps, 'items'>[0],
		'showArrow' | 'collapsible'
	> = useMemo(() => {
		if (currentApp?.site?.show_workflow_steps) {
			return {
				showArrow: true,
			}
		}
		return {
			showArrow: false,
			collapsible: 'icon',
		}
	}, [currentApp?.site?.show_workflow_steps])

	if (!items?.length) {
		return null
	}

	const collapseItems: CollapseProps['items'] = [
		{
			key: 'workflow',
			label: (
				<div className="flex items-center">
					{status === 'running' ? (
						<LoadingOutlined />
					) : status === 'finished' ? (
						<div className="text-theme-success flex items-center">
							<LucideIcon name="circle-check" />
						</div>
					) : null}
					<div className="text-theme-text ml-2">工作流</div>
				</div>
			),
			...collapseItemVisibleProps,
			children: (
				<Collapse
					size="small"
					{...collapseCommonProps}
					items={items.map(item => {
						const totalTokens = item.execution_metadata?.total_tokens
						return {
							key: item.id,
							...collapseItemVisibleProps,
							label: (
								<div className="flex w-full items-center justify-between">
									<div className="flex items-center">
										{item.status === 'success' ? (
											<CheckCircleOutlined className="text-theme-success" />
										) : item.status === 'error' ? (
											<CloseCircleOutlined className="text-theme-danger" />
										) : item.status === 'running' ? (
											<LoadingOutlined />
										) : (
											<InfoOutlined />
										)}
										<div className="mx-2 flex items-center">
											<WorkflowNodeIcon type={item.type} />
										</div>
										<div className="text-theme-text">{item.title}</div>
									</div>
									<div className="text-theme-text flex items-center">
										{item.status === 'success' ? (
											<>
												<div className="mr-3">{item.elapsed_time?.toFixed(3)} 秒</div>
												<div className="mr-3">{totalTokens ? `${totalTokens} tokens` : ''}</div>
											</>
										) : null}
									</div>
								</div>
							),
							...collapseItemVisibleProps,
							children: (
								<Collapse
									{...collapseCommonProps}
									size="small"
									items={[
										{
											key: `${item.id}-input`,
											label: '输入',
											children: <WorkflowNodeDetail originalContent={item.inputs} />,
										},
										{
											key: `${item.id}-process`,
											label: '处理过程',
											children: <WorkflowNodeDetail originalContent={item.process_data} />,
										},
										{
											key: `${item.id}-output`,
											label: '输出',
											children: <WorkflowNodeDetail originalContent={item.outputs as string} />,
										},
									]}
								></Collapse>
							),
						}
					})}
				>
					{}
				</Collapse>
			),
		},
	]

	return (
		<div className={`md:min-w-chat-card mb-3 ${className || ''}`}>
			<Collapse
				{...collapseCommonProps}
				items={collapseItems}
				size="small"
				className="!bg-theme-bg"
			/>
		</div>
	)
}
