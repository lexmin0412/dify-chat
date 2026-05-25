import { copyToClipboard } from '@toolkit-fe/clipboard'
import { message } from 'antd'

import LucideIcon from '@/components/shared/lucide-icon'

interface IWorkflowNodeDetailProps {
	originalContent: string
}

export default function WorkflowNodeDetail(props: IWorkflowNodeDetailProps) {
	const { originalContent } = props

	return (
		<div>
			{originalContent ? (
				<div className="relative rounded-md bg-muted/50">
					<button
						className="absolute bottom-2 right-2 flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						onClick={async () => {
							await copyToClipboard(JSON.stringify(originalContent, null, 2))
							message.success('复制成功')
						}}
					>
						<LucideIcon
							name="copy"
							size={12}
						/>
						复制
					</button>
					<pre className="m-0 w-full overflow-auto p-3 pb-7 text-xs">
						{JSON.stringify(originalContent, null, 2)}
					</pre>
				</div>
			) : (
				<pre className="m-0 text-xs text-muted-foreground">空</pre>
			)}
		</div>
	)
}
