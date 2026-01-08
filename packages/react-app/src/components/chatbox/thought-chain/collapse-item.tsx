interface ICollapseItemProps {
	/**
	 * 需要展示的文本
	 */
	text: string
}

/**
 * 思维链的折叠项
 */
export default function CollapseItem(props: ICollapseItemProps) {
	const { text } = props
	return text ? <pre className="!m-0 !border-none !bg-theme-bg !p-0">{text}</pre> : '空'
}
