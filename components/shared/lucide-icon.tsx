import { Icon, IconNode } from 'lucide-react'
import { DynamicIcon, dynamicIconImports } from 'lucide-react/dynamic'

export interface ILucideIconProps {
	/**
	 * 图标名称（注意只支持 Lucide 主包自带图标）
	 */
	name: keyof typeof dynamicIconImports
	/**
	 * 图标颜色 - 默认是 currentColor
	 */
	color?: string
	/**
	 * 自定义图标
	 * 支持 Lucide lab
	 * 支持用户自定义图标？？？自定义的图标传入方式限制？
	 */
	iconNode?: IconNode
	/**
	 * 图标大小 - 默认是 14px
	 */
	size?: number
	/**
	 * 图标描边宽度 - 默认是 2px
	 */
	strokeWidth?: number
	/**
	 * 自定义类名
	 */
	className?: string
	/**
	 * 点击事件
	 */
	onClick?: React.MouseEventHandler<SVGElement>
}

/**
 * Lucide 图标组件
 */
export default function LucideIcon(props: ILucideIconProps) {
	const { className, name, color, size, iconNode, strokeWidth, onClick } = props

	const commonProps = {
		color,
		strokeWidth: strokeWidth || 2,
		size: size || 14,
		className,
		onClick,
	}

	if (iconNode) {
		return (
			<Icon
				iconNode={iconNode}
				{...commonProps}
			/>
		)
	}
	return (
		<DynamicIcon
			name={name}
			{...commonProps}
		/>
	)
}
