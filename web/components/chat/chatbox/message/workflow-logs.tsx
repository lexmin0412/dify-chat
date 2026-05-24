import { IAgentMessage, IWorkflowNode } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'

import LucideIcon from '@/components/shared/lucide-icon'
import { TreeView, TreeItem, TreeItemTrigger, TreeItemContent } from '@/components/ui/tree-view'
import WorkflowNodeDetail from './workflow-node-detail'
import WorkflowNodeIcon from './workflow-node-icon'

interface IWorkflowLogsProps {
	className?: string
	status: NonNullable<IAgentMessage['workflows']>['status']
	items: IWorkflowNode[]
}

export default function WorkflowLogs(props: IWorkflowLogsProps) {
	const { items, status, className } = props

	const statusIcon = useMemo(() => {
		if (status === 'running')
			return (
				<Loader2
					className="animate-spin"
					size={14}
				/>
			)
		if (status === 'finished')
			return (
				<LucideIcon
					name="circle-check"
					className="text-[var(--theme-success-color)]"
				/>
			)
		return null
	}, [status])

	const getNodeStatusIcon = (nodeStatus: IWorkflowNode['status']) => {
		switch (nodeStatus) {
			case 'success':
				return (
					<LucideIcon
						name="circle-check"
						className="text-[var(--theme-success-color)]"
					/>
				)
			case 'error':
				return (
					<LucideIcon
						name="circle-x"
						className="text-[var(--theme-danger-color)]"
					/>
				)
			case 'running':
				return (
					<Loader2
						className="animate-spin"
						size={14}
					/>
				)
			default:
				return <LucideIcon name="info" />
		}
	}

	if (!items?.length) return null

	return (
		<div className={`${className || ''}`}>
			<TreeView>
				<TreeItem defaultOpen={status === 'running'}>
					<TreeItemTrigger>
						<span className="flex items-center gap-2">
							{statusIcon}
							工作流
						</span>
					</TreeItemTrigger>
					<TreeItemContent>
						<ul className="relative ml-2 border-l-2 pl-4 pt-1 space-y-0.5">
							{items.map(item => {
								const totalTokens = item.execution_metadata?.total_tokens

								return (
									<li key={item.id}>
										<TreeItem>
											<TreeItemTrigger className="py-1 text-sm">
												<span className="flex w-full items-center justify-between gap-2 pr-2">
													<span className="flex items-center gap-2 min-w-0">
														{getNodeStatusIcon(item.status)}
														<WorkflowNodeIcon type={item.type} />
														<span className="truncate">{item.title}</span>
													</span>
													{item.status === 'success' && (
														<span className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
															<span>{item.elapsed_time?.toFixed(3)} 秒</span>
															{totalTokens ? <span>{totalTokens} tokens</span> : null}
														</span>
													)}
												</span>
											</TreeItemTrigger>
											<TreeItemContent>
												<ul className="ml-4 pl-3 border-l-2 pt-0.5 space-y-0.5">
													{[
														{ key: 'input', label: '输入', data: item.inputs },
														{ key: 'process', label: '处理过程', data: item.process_data },
														{ key: 'output', label: '输出', data: item.outputs as string },
													].map(leaf => (
														<li key={leaf.key}>
															<TreeItem>
																<TreeItemTrigger className="py-0.5 text-xs text-muted-foreground hover:text-foreground">
																	{leaf.label}
																</TreeItemTrigger>
																<TreeItemContent>
																	<div className="pl-4 pb-1">
																		<WorkflowNodeDetail originalContent={leaf.data} />
																	</div>
																</TreeItemContent>
															</TreeItem>
														</li>
													))}
												</ul>
											</TreeItemContent>
										</TreeItem>
									</li>
								)
							})}
						</ul>
					</TreeItemContent>
				</TreeItem>
			</TreeView>
		</div>
	)
}
