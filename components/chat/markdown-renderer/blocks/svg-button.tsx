import { PicCenterOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React from 'react'

import { cn } from './../utils'

type ISVGBtnProps = {
	isSVG: boolean
	setIsSVG: React.Dispatch<React.SetStateAction<boolean>>
}

const SVGBtn = ({ setIsSVG }: ISVGBtnProps) => {
	return (
		<Button
			onClick={() => {
				setIsSVG(prevIsSVG => !prevIsSVG)
			}}
		>
			<div className={cn('h-4 w-4')}>
				<PicCenterOutlined />
			</div>
		</Button>
	)
}

export default SVGBtn
