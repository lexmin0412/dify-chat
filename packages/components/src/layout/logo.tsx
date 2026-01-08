import { GithubOutlined } from '@ant-design/icons'
import { Button } from 'antd'

import LogoImage from '../assets/images/logo.png'

export const LogoIcon = () => {
	return (
		<img
			className="inline-block h-5 w-5"
			src={LogoImage}
			draggable={false}
			alt="logo"
		/>
	)
}

export const GithubIcon = () => {
	return (
		<Button
			type="link"
			href="https://github.com/lexmin0412/dify-chat"
			target="_blank"
			className="!px-0"
		>
			<GithubOutlined className="cursor-pointer text-xl text-theme-text" />
		</Button>
	)
}

interface ILogoProps {
	/**
	 * 是否隐藏 Github 图标
	 */
	hideGithubIcon?: boolean
	/**
	 * 是否隐藏文本
	 */
	hideText?: boolean
	/**
	 * 文本
	 */
	text?: string
	/**
	 * 自定义 Logo 渲染
	 */
	renderLogo?: () => React.ReactNode
}

export const Logo = (props: ILogoProps) => {
	const { hideGithubIcon, hideText, text, renderLogo } = props

	return (
		<div className="box-border flex h-16 items-center justify-start !py-0">
			<div className="flex h-full flex-1 items-center overflow-hidden">
				{renderLogo ? (
					renderLogo()
				) : (
					<img
						className="inline-block h-8 w-8"
						src={LogoImage}
						draggable={false}
						alt="logo"
					/>
				)}
				{!hideText ? (
					<span className="my-0 ml-3 inline-block text-lg font-bold text-theme-text">
						{text || 'Dify Chat'}
					</span>
				) : null}
			</div>
			{!hideGithubIcon && (
				<Button
					type="link"
					href="https://github.com/lexmin0412/dify-chat"
					target="_blank"
					className="px-0"
				>
					<GithubOutlined className="cursor-pointer text-lg text-theme-text" />
				</Button>
			)}
		</div>
	)
}
