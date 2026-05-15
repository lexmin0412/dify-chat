/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoadingOutlined } from '@ant-design/icons'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { usePrevious } from 'ahooks'
import { Radio } from 'antd'
import mermaid from 'mermaid'
import React, { useEffect, useEffectEvent, useRef, useState } from 'react'

export function cleanUpSvgCode(svgCode: string): string {
	return svgCode.replaceAll('<br>', '<br/>')
}

let mermaidAPI: any
mermaidAPI = null

if (typeof window !== 'undefined') mermaidAPI = mermaid.mermaidAPI

const svgToBase64 = (svgGraph: string) => {
	const svgBytes = new TextEncoder().encode(svgGraph)
	const blob = new Blob([svgBytes], { type: 'image/svg+xml;charset=utf-8' })
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

const Flowchart = (
	flowChartProps: {
		PrimitiveCode: string
	} & {
		ref?: React.RefObject<HTMLDivElement | null>
	},
) => {
	const { ref, ...props } = flowChartProps
	const [svgCode, setSvgCode] = useState(null)
	const [look, setLook] = useState<'classic' | 'handDrawn'>('classic')

	const prevPrimitiveCode = usePrevious(props.PrimitiveCode)
	const [isLoading, setIsLoading] = useState(true)
	const timeRef = useRef<number>(0)
	const [errMsg, setErrMsg] = useState('')
	const renderFlowchart = useEffectEvent(async (PrimitiveCode: string) => {
		setSvgCode(null)
		setIsLoading(true)

		try {
			if (typeof window !== 'undefined' && mermaidAPI) {
				const svgGraph = await mermaidAPI.render('flowchart', PrimitiveCode)
				const base64Svg: any = await svgToBase64(cleanUpSvgCode(svgGraph.svg))
				setSvgCode(base64Svg)
				setIsLoading(false)
			}
		} catch (error) {
			if (prevPrimitiveCode === props.PrimitiveCode) {
				setIsLoading(false)
				setErrMsg((error as Error).message)
			}
		}
	})

	useEffect(() => {
		if (typeof window !== 'undefined') {
			mermaid.initialize({
				startOnLoad: true,
				theme: 'neutral',
				look,
				flowchart: {
					htmlLabels: true,
					useMaxWidth: true,
				},
			})

			renderFlowchart(props.PrimitiveCode)
		}
	}, [look])

	useEffect(() => {
		if (timeRef.current) window.clearTimeout(timeRef.current)

		timeRef.current = window.setTimeout(() => {
			renderFlowchart(props.PrimitiveCode)
		}, 300)

		return () => {
			clearTimeout(timeRef.current)
		}
	}, [props.PrimitiveCode])

	return (
		<div ref={ref}>
			<div className="msh-segmented msh-segmented-sm css-23bs09 css-var-r1">
				<div className="msh-segmented-group">
					<label className="msh-segmented-item m-2 flex w-[200px] items-center space-x-1">
						<Radio.Group
							value={look}
							buttonStyle="solid"
							optionType="button"
							onChange={e => {
								if (e.target.value === 'handDrawn') setLook('handDrawn')
								else setLook('classic')
							}}
						>
							<Radio value="classic">经典</Radio>
							<Radio value="handDrawn">手绘</Radio>
						</Radio.Group>
					</label>
				</div>
			</div>
			{svgCode && (
				<div className="mermaid object-fit: cover h-auto w-full cursor-pointer">
					{svgCode && (
						<img
							src={svgCode}
							alt="mermaid_chart"
						/>
					)}
				</div>
			)}
			{isLoading && (
				<div className="px-[26px] py-4">
					<LoadingOutlined />
				</div>
			)}
			{errMsg && (
				<div className="px-[26px] py-4">
					<ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
					&nbsp;
					{errMsg}
				</div>
			)}
		</div>
	)
}

Flowchart.displayName = 'Flowchart'

export default Flowchart
