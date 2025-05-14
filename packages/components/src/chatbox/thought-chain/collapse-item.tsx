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
	return text ? <pre className="!m-0 !p-0 !bg-theme-bg !border-none">{text}</pre> : '空'
}
