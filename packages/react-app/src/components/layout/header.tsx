import { LucideIcon } from '@/components'
import { useIsMobile } from '@dify-chat/helpers'
import { ThemeSelector, useThemeContext } from '@dify-chat/theme'
import { Space } from 'antd'
import classNames from 'classnames'
import React from 'react'

import CenterTitleWrapper from './center-title-wrapper'
import { GithubIcon, Logo } from './logo'
import { Account } from '@/components'

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
	 * 自定义右侧内容
	 */
	rightContent?: React.ReactNode
	/**
	 * 自定义左侧内容
	 */
	leftContent?: React.ReactNode
	/**
	 * Logo 文本
	 */
	logoText?: string
	/**
	 * 自定义 Logo 渲染
	 */
	renderLogo?: () => React.ReactNode
	/**
	 * 是否隐藏默认右侧内容（主题选择器和Github图标）
	 */
	hideDefaultRightContent?: boolean
	/**
	 * 额外的CSS类名
	 */
	className?: string
	/**
	 * 额外的样式
	 */
	style?: React.CSSProperties
}

/**
 * 头部布局组件
 */
export default function HeaderLayout(props: IHeaderLayoutProps) {
	const {
		isTitleWrapped,
		title,
		rightContent,
		leftContent,
		logoText,
		renderLogo,
		hideDefaultRightContent = false,
		className,
		style
	} = props
	const { themeMode } = useThemeContext()
	const isMobile = useIsMobile()

	// 默认右侧内容
	const defaultRightContent = (
		<Space
			className="flex items-center"
			size={16}
		>
			<ThemeSelector>
				<div className="flex items-center cursor-pointer">
					<LucideIcon
						name={
							themeMode === 'dark'
								? 'moon-star'
								: themeMode === 'light'
									? 'sun'
									: 'monitor'
						}
						size={20}
					/>
				</div>
			</ThemeSelector>
			<GithubIcon />
			<Account />
		</Space>
	)

	// 左侧内容
	const renderLeftContent = () => {
		if (leftContent) {
			return <div className="flex-1 h-full flex items-center justify-start">{leftContent}</div>
		}

		return (
			<div className="flex-1 h-full flex items-center justify-start">
				<Logo
					text={logoText}
					renderLogo={renderLogo}
					hideText={isMobile}
					hideGithubIcon
				/>
			</div>
		)
	}

	// 右侧内容
	const renderRightContent = () => {
		if (rightContent) {
			return <div className="flex-1 h-full flex items-center justify-end">{rightContent}</div>
		}

		if (!hideDefaultRightContent) {
			return <div className="flex-1 h-full flex items-center justify-end">{defaultRightContent}</div>
		}

		return null
	}

	return (
		<div 
			className={classNames('h-16 flex items-center justify-between px-4', className)}
			style={style}
		>
			{/* 左侧内容 */}
			{renderLeftContent()}

			{/* 中间标题 */}
			{title && (
				<div className="flex h-full items-center flex-[4] overflow-hidden justify-center">
					{isTitleWrapped ? title : <CenterTitleWrapper>{title}</CenterTitleWrapper>}
				</div>
			)}

			{/* 右侧内容 */}
			{renderRightContent()}
		</div>
	)
}
