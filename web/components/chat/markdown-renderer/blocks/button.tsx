import { Button } from 'antd'
import { ReactNode } from 'react'

/**
 * 图片渲染组件
 */
interface IButtonProps {
	className?: string
	children?: ReactNode
	/**
	 * 外部传入的发送消息事件
	 */
	onSend?: (text: string) => void
	/**
	 * 按钮点击时发送的消息内容
	 */
	'data-message'?: string
}

/**
 * 按钮组件，支持点击发送消息
 */
export default function ButtonBlock(props: IButtonProps) {
	const { className, children, 'data-message': message, onSend } = props
	return (
		<Button
			size="small"
			className={className}
			onClick={() => {
				if (message) {
					onSend?.(message)
				}
			}}
		>
			{children}
		</Button>
	)
}
