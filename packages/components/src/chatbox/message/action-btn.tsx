import { Button, Spin } from 'antd'
import classNames from 'classnames'
import React from 'react'

interface IActionButtonProps {
	/**
	 * 是否禁用
	 */
	disabled?: boolean
	/**
	 * 是否激活
	 */
	active?: boolean
	/**
	 * 是否加载中
	 */
	loading?: boolean
	/**
	 * 点击事件
	 */
	onClick?: () => void
	/**
	 * 图标
	 */
	icon: React.ReactElement
}

/**
 * 操作按钮
 */
export default function ActionButton(props: IActionButtonProps) {
	const { disabled, icon, loading = false, active = false, onClick } = props

	const Icon = React.cloneElement(icon, {
		className: classNames({
			'!text-primary': active,
			'text-theme-text': true,
		}),
	})

	return (
		<div className="relative flex items-center">
			<Button
				color="default"
				variant="text"
				size="small"
				icon={Icon}
				onClick={onClick}
				disabled={disabled}
			/>
			<Spin
				className="!absolute left-0 top-0 w-full h-full"
				spinning={loading}
			/>
		</div>
	)
}
