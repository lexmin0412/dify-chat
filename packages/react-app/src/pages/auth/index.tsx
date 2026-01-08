import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'
import FingerPrintJS from '@fingerprintjs/fingerprintjs'
import { useMount } from 'ahooks'
import { Spin } from 'antd'

import { Logo } from '@/components'
import { useAuth } from '@/hooks/use-auth'
import { useRedirect2Index } from '@/hooks/use-jump'

export default function AuthPage() {
	const { userId } = useAuth()
	const redirect2Index = useRedirect2Index()

	/**
	 * 模拟登录接口
	 */
	const mockLogin = async () => {
		const fp = await FingerPrintJS.load()
		const result = await fp.get()
		return await new Promise<{ userId: string }>(resolve => {
			setTimeout(() => {
				resolve({
					userId: result.visitorId,
				})
			}, 2000)
		})
	}

	/**
	 * 登录函数
	 */
	const handleLogin = async () => {
		const userInfo = await mockLogin()
		LocalStorageStore.set(LocalStorageKeys.USER_ID, userInfo.userId)
		redirect2Index()
	}

	useMount(() => {
		if (!userId) {
			// 模拟自动登录
			handleLogin()
		} else {
			redirect2Index()
		}
	})

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center bg-theme-bg">
			<div className="absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center">
				<Logo hideGithubIcon />
				<div className="text-theme-text">授权登录中...</div>
				<div className="mt-6">
					<Spin spinning />
				</div>
			</div>
		</div>
	)
}
