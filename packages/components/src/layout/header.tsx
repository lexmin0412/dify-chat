import { LucideIcon } from '@dify-chat/components'
import { useIsMobile } from '@dify-chat/helpers'
import { ThemeSelector, useThemeContext } from '@dify-chat/theme'
import { Space } from 'antd'
import classNames from 'classnames'
import React from 'react'

import CenterTitleWrapper from './center-title-wrapper'
import { GithubIcon, Logo } from './logo'

export interface IHeaderLayoutProps {
	/**
	 * 自定义标题
	 */
	title?: React.ReactNode
	/**
	 * 传进来的标题是否已经包含容器
	 */
	isTitleWrapped?: boolean
	/**
	 * 自定义右侧图标
	 */
	rightIcon?: React.ReactNode
	/**
	 * Logo 文本
	 */
	logoText?: string
	/**
	 * 自定义 Logo 渲染
	 */
	renderLogo?: () => React.ReactNode
}

const HeaderSiderIcon = (props: { align: 'left' | 'right'; children: React.ReactNode }) => {
	return (
		<div
			className={classNames({
				'flex-1 h-full flex items-center': true,
				'justify-start': props.align === 'left',
				'justify-end': props.align === 'right',
			})}
		>
			{props.children}
		</div>
	)
}

/**
 * 头部布局组件
 */
export default function HeaderLayout(props: IHeaderLayoutProps) {
	const { isTitleWrapped, title, rightIcon, logoText, renderLogo } = props
	const { themeMode } = useThemeContext()
	const isMobile = useIsMobile()
	return (
		<div className="flex h-16 items-center justify-between px-4">
			{/* 🌟 Logo */}
			<HeaderSiderIcon align="left">
				<Logo
					text={logoText}
					renderLogo={renderLogo}
					hideText={isMobile}
					hideGithubIcon
				/>
			</HeaderSiderIcon>

			{/* 中间标题 */}
			{isTitleWrapped ? title : <CenterTitleWrapper>{title}</CenterTitleWrapper>}

			{/* 右侧图标 */}
			<HeaderSiderIcon align="right">
				{rightIcon || (
					<Space
						className="flex items-center"
						size={16}
					>
						<ThemeSelector>
							<div className="flex cursor-pointer items-center">
								<LucideIcon
									name={
										themeMode === 'dark'
											? 'moon-star'
											: themeMode === 'light'
												? 'sun'
												: 'screen-share'
									}
									size={20}
								/>
							</div>
						</ThemeSelector>
						<GithubIcon />
					</Space>
				)}
			</HeaderSiderIcon>
		</div>
	)
}
