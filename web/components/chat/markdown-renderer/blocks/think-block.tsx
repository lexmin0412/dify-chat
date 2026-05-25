import React, { useEffect, useRef, useState } from 'react'

import { getThinkTime, setThinkTime } from '@/hooks/useX/think-time-storage'

import { useThinkBlockContext } from './think-block-context'

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

const useThinkTimer = (children: React.JSX.Element, storageKey: string, preComplete: boolean) => {
	const [startTime] = useState(preComplete ? 0 : Date.now())
	const [elapsedTime, setElapsedTime] = useState(0)
	const [isComplete, setIsComplete] = useState(preComplete)
	const timerRef = useRef<NodeJS.Timeout>(null)
	const completedRef = useRef(preComplete)

	useEffect(() => {
		if (preComplete) return
		const complete = hasEndThink(children)
		if (complete && !completedRef.current) {
			completedRef.current = true
			setIsComplete(true)
			if (timerRef.current) clearInterval(timerRef.current)

			const time = Math.floor((Date.now() - startTime) / 100) / 10
			setElapsedTime(time)
			setThinkTime(storageKey, time)
		}
	}, [children, startTime, storageKey, preComplete])

	useEffect(() => {
		if (preComplete) return
		timerRef.current = setInterval(() => {
			if (!isComplete) setElapsedTime(Math.floor((Date.now() - startTime) / 100) / 10)
		}, 100)

		return () => {
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [startTime, isComplete, preComplete])

	return { elapsedTime, isComplete }
}

const detectThinkBlock = (props: any): boolean => {
	if (props['data-think']) return true
	const children = props.node?.children || props.children
	if (!Array.isArray(children)) return false
	const summary = children.find((c: any) => c?.tagName === 'summary')
	if (summary) {
		const text = typeof summary.children?.[0]?.value === 'string' ? summary.children[0].value : ''
		return text.includes('Thinking') || text.includes('思考')
	}
	return false
}

export const ThinkBlock = ({ children, ...props }: any) => {
	const ctx = useThinkBlockContext()
	const isThink = detectThinkBlock(props)
	const isPreDone = isThink && !props['data-think']
	const storageKey = ctx && isThink ? `${ctx.messageId}_${ctx.nextIndex()}` : ''
	const { elapsedTime, isComplete } = useThinkTimer(children, storageKey, isPreDone)

	const restoredTime = getThinkTime(storageKey)
	const displayContent = isThink ? removeEndThink(children) : children

	if (!isThink) return <details {...props}>{children}</details>

	return (
		<details
			{...(!isComplete && { open: true })}
			className="group"
		>
			<summary className="text-theme-desc flex cursor-pointer list-none items-center font-bold whitespace-nowrap select-none">
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
					{isComplete
						? `已完成深度思考${restoredTime != null ? ` (${restoredTime.toFixed(1)}s)` : ''}`
						: `深度思考中...(${elapsedTime.toFixed(1)}s)`}
				</div>
			</summary>
			<div className="text-theme-desc mt-1 ml-5 rounded-lg border-l border-gray-300">
				{displayContent}
			</div>
		</details>
	)
}

export default ThinkBlock
