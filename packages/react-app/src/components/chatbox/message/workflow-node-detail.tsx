import { copyToClipboard } from '@toolkit-fe/clipboard'
import { message } from 'antd'

import LucideIcon from '../../lucide-icon'

interface IWorkflowNodeDetailProps {
	/**
	 * 原始结构化内容
	 */
	originalContent: string
}

export default function WorkflowNodeDetail(props: IWorkflowNodeDetailProps) {
	const { originalContent } = props

	return (
		<div>
			{originalContent ? (
				<>
					<LucideIcon
						name="copy"
						size={16}
						className="cursor-pointer text-theme-text"
						onClick={async () => {
							await copyToClipboard(JSON.stringify(originalContent, null, 2))
							message.success('复制成功')
						}}
					/>
					<pre className="m-0 w-full overflow-auto">{JSON.stringify(originalContent, null, 2)}</pre>
				</>
			) : (
				<pre>空</pre>
			)}
		</div>
	)
}
