import React, { useEffect, useRef, useState } from 'react'

const hasEndThink = (children: any): boolean => {
	if (typeof children === 'string') return children.includes('[ENDTHINKFLAG]')

	if (Array.isArray(children)) return children.some(child => hasEndThink(child))

	if (children?.props?.children) return hasEndThink(children.props.children)

	return false
}

const removeEndThink = (children: any): any => {
	if (typeof children === 'string') return children.replace('[ENDTHINKFLAG]', '')

	if (Array.isArray(children)) return children.map(child => removeEndThink(child))

	if (children?.props?.children) {
		return React.cloneElement(children, {
			...children.props,
			children: removeEndThink(children.props.children),
		})
	}

	return children
}

const useThinkTimer = (children: React.JSX.Element) => {
	const [startTime] = useState(Date.now())
	const [elapsedTime, setElapsedTime] = useState(0)
	const [isComplete, setIsComplete] = useState(false)
	const timerRef = useRef<NodeJS.Timeout>(null)

	useEffect(() => {
		timerRef.current = setInterval(() => {
			if (!isComplete) setElapsedTime(Math.floor((Date.now() - startTime) / 100) / 10)
		}, 100)

		return () => {
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [startTime, isComplete])

	useEffect(() => {
		if (hasEndThink(children)) {
			setIsComplete(true)
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [children])

	return { elapsedTime, isComplete }
}

export const ThinkBlock = ({ children, ...props }: any) => {
	const { elapsedTime, isComplete } = useThinkTimer(children)
	const displayContent = removeEndThink(children)

	if (!(props['data-think'] ?? false)) return <details {...props}>{children}</details>

	return (
		<details
			{...(!isComplete && { open: true })}
			className="group"
		>
			<summary className="flex cursor-pointer select-none list-none items-center whitespace-nowrap font-bold text-theme-desc">
				<div className="flex shrink-0 items-center">
					<svg
						className="mr-2 h-3 w-3 transition-transform duration-500 group-open:rotate-90"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
					{isComplete ? `已完成深度思考` : `深度思考中...(${elapsedTime.toFixed(1)}s)`}
				</div>
			</summary>
			<div className={`ml-5 mt-1 rounded-lg border-l border-gray-300 text-theme-desc`}>
				{displayContent}
			</div>
		</details>
	)
}

export default ThinkBlock
