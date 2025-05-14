import { GithubOutlined } from '@ant-design/icons'
import { Button } from 'antd'

import LogoImage from '@/assets/images/logo.png'

export const LogoIcon = () => {
	return (
		<img
			className="w-5 h-5 inline-block"
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
			className="px-0"
		>
			<GithubOutlined className="text-xl cursor-pointer text-theme-text" />
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
}

export const Logo = (props: ILogoProps) => {
	const { hideGithubIcon, hideText } = props

	return (
		<div className="flex h-16 items-center justify-start !py-0 box-border">
			<div className="h-full flex items-center flex-1 overflow-hidden">
				<img
					className="w-8 h-8 inline-block"
					src={LogoImage}
					draggable={false}
					alt="logo"
				/>
				{!hideText ? (
					<span className="inline-block my-0 ml-3 font-bold text-lg text-theme-text">Dify Chat</span>
				) : null}
			</div>
			{!hideGithubIcon && (
				<Button
					type="link"
					href="https://github.com/lexmin0412/dify-chat"
					target="_blank"
					className="px-0"
				>
					<GithubOutlined className="text-lg cursor-pointer text-theme-text" />
				</Button>
			)}
		</div>
	)
}
