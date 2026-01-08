import { Spin, Tooltip } from 'antd'
import classNames from 'classnames'
import React from 'react'

interface IActionButtonProps {
	/**
	 * 标题
	 */
	title?: string
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
	const { title, disabled, icon, loading = false, active = false, onClick } = props

	const Icon = React.cloneElement(icon, {
		// @ts-expect-error FIXME: React19 类型错误，待解决
		className: classNames({
			'!text-primary': active,
			'text-theme-text': true,
		}),
	})

	return (
		<div className="relative flex items-center">
			<Tooltip title={title}>
				<div
					className={classNames({
						'text-desc': disabled,
						'cursor-pointer hover:bg-gray-100 w-5 h-5 flex items-center justify-center rounded': true,
					})}
					onClick={() => {
						if (!disabled) {
							onClick?.()
						}
					}}
				>
					{Icon}
				</div>
			</Tooltip>
			<Spin
				className="!absolute left-0 top-0 h-full w-full"
				spinning={loading}
			/>
		</div>
	)
}
