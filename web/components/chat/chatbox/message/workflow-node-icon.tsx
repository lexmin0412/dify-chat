import LucideIcon from '../../lucide-icon'

type IIconType = 'start' | 'question-classifier' | 'llm'

interface IWorkflowNodeIconProps {
	type: IIconType
}

const iconMap: Record<IIconType, React.ReactNode> = {
	start: (
		<LucideIcon
			name="play"
			className="!text-theme-text"
		/>
	),
	'question-classifier': (
		<LucideIcon
			name="network"
			className="!text-theme-text"
		/>
	),
	llm: (
		<LucideIcon
			name="bot"
			className="!text-theme-text"
		/>
	),
}

/**
 * 工作流节点图标
 */
export default function WorkflowNodeIcon(props: IWorkflowNodeIconProps) {
	return (
		iconMap[props.type] || (
			<LucideIcon
				name="bot"
				className="!text-theme-text"
			/>
		)
	)
}
