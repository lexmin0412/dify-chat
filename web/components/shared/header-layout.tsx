import { LucideIcon } from '@/components/shared'
import { useIsMobile } from '@/lib/helpers'
import { ThemeSelector, useThemeContext } from '@/lib/theme'
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
	 * 自定义右侧图标（完全替换默认图标）
	 */
	rightIcon?: React.ReactNode
	/**
	 * 自定义右侧图标布局（按槽位重组，比 rightIcon 更灵活）
	 *
	 * @param slots.theme 主题切换按钮
	 * @param slots.github GitHub 链接图标
	 */
	renderRightIcons?: (slots: { theme: React.ReactNode; github: React.ReactNode }) => React.ReactNode
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
	const { isTitleWrapped, title, rightIcon, renderRightIcons, logoText, renderLogo } = props
	const { themeMode } = useThemeContext()
	const isMobile = useIsMobile()

	const themeSlot = (
		<ThemeSelector>
			<div className="flex cursor-pointer items-center">
				<LucideIcon
					name={themeMode === 'dark' ? 'moon-star' : themeMode === 'light' ? 'sun' : 'screen-share'}
					size={20}
				/>
			</div>
		</ThemeSelector>
	)

	const githubSlot = <GithubIcon />

	const defaultRightIcons = (
		<Space
			className="flex items-center"
			size={16}
		>
			{themeSlot}
			{githubSlot}
		</Space>
	)

	const finalRightIcons = renderRightIcons
		? renderRightIcons({ theme: themeSlot, github: githubSlot })
		: rightIcon || defaultRightIcons
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
			<HeaderSiderIcon align="right">{finalRightIcons}</HeaderSiderIcon>
		</div>
	)
}
