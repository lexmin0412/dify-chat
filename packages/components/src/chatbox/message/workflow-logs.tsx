import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	InfoOutlined,
	LoadingOutlined,
} from '@ant-design/icons'
import { IAgentMessage, IWorkflowNode } from '@dify-chat/api'
import { Collapse } from 'antd'

import WorkflowNodeDetail from './workflow-node-detail'
import WorkflowNodeIcon from './workflow-node-icon'

interface IWorkflowLogsProps {
	className?: string
	status: NonNullable<IAgentMessage['workflows']>['status']
	items: IWorkflowNode[]
}

export default function WorkflowLogs(props: IWorkflowLogsProps) {
	const { items, status, className } = props

	if (!items?.length) {
		return null
	}

	const collapseItems = [
		{
			key: 'workflow',
			label: (
				<div className="flex items-center justify-between">
					<div className="text-theme-text">工作流</div>
					{status === 'running' ? (
						<LoadingOutlined />
					) : status === 'finished' ? (
						<div className="text-theme-success flex items-center">
							<span className="mr-2">成功</span>
							<CheckCircleOutlined className="text-theme-success" />
						</div>
					) : null}
				</div>
			),
			children: (
				<Collapse
					size="small"
					items={items.map(item => {
						const totalTokens = item.execution_metadata?.total_tokens
						return {
							key: item.id,
							label: (
								<div className="flex items-center justify-between w-full">
									<div className="flex items-center">
										<div className="mr-2 flex items-center">
											<WorkflowNodeIcon type={item.type} />
										</div>
										<div className="text-theme-text">{item.title}</div>
									</div>
									<div className="flex items-center  text-theme-text">
										{item.status === 'success' ? (
											<>
												<div className="mr-3">{item.elapsed_time?.toFixed(3)} 秒</div>
												<div className="mr-3">{totalTokens ? `${totalTokens} tokens` : ''}</div>
											</>
										) : null}
										{item.status === 'success' ? (
											<CheckCircleOutlined className="text-theme-success" />
										) : item.status === 'error' ? (
											<CloseCircleOutlined className="text-theme-danger" />
										) : item.status === 'running' ? (
											<LoadingOutlined />
										) : (
											<InfoOutlined />
										)}
									</div>
								</div>
							),
							children: (
								<Collapse
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
											children: <WorkflowNodeDetail originalContent={item.outputs} />,
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
		<div className={`md:min-w-chat-card mt-3 ${className || ''}`}>
			<Collapse
				items={collapseItems}
				size="small"
				className="!bg-theme-bg"
			/>
		</div>
	)
}
