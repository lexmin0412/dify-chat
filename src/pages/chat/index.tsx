import { useDifyChat } from '@dify-chat/core'
import { Spin } from 'antd'

import { Logo } from '@/components/logo'
import MultiAppLayout from '@/layout/multi-app-layout'
import SingleAppLayout from '@/layout/single-app-layout'

export default function ChatPage() {
	const { user, mode } = useDifyChat()

	// 必须先有用户, 再开始渲染布局，因为所有界面上展示的数据都需要调用 Dify API, 而所有的 Dify API 都需要用户标识
	if (!user) {
		return (
			<div className="w-screen h-screen flex flex-col items-center justify-center bg-theme-bg">
				<div className="absolute flex-col w-full h-full left-0 top-0 z-50 flex items-center justify-center">
					<Logo hideGithubIcon />
					<div className='text-theme-text'>授权登录中...</div>
					<div className="mt-6">
						<Spin spinning />
					</div>
				</div>
			</div>
		)
	}

	if (mode === 'singleApp') {
		return <SingleAppLayout />
	}

	return <MultiAppLayout />
}
