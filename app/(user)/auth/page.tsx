'use client'

import { LocalStorageKeys, LocalStorageStore } from '@/lib/helpers'
import FingerPrintJS from '@fingerprintjs/fingerprintjs'
import { useMount } from 'ahooks'
import { Spin } from 'antd'
import { useRouter } from 'next/navigation'

import { Logo } from '@/components/shared'
import { useAuth } from '@/hooks/use-auth'

export default function AuthPage() {
	const { userId } = useAuth()
	const router = useRouter()

	const mockLogin = async () => {
		const fp = await FingerPrintJS.load()
		const result = await fp.get()
		return await new Promise<{ userId: string }>(resolve => {
			setTimeout(() => {
				resolve({ userId: result.visitorId })
			}, 2000)
		})
	}

	const handleLogin = async () => {
		const userInfo = await mockLogin()
		LocalStorageStore.set(LocalStorageKeys.USER_ID, userInfo.userId)
		router.replace('/apps')
	}

	useMount(() => {
		if (!userId) {
			handleLogin()
		} else {
			router.replace('/apps')
		}
	})

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center">
			<div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center">
				<Logo hideGithubIcon />
				<div>授权登录中...</div>
				<div className="mt-6">
					<Spin spinning />
				</div>
			</div>
		</div>
	)
}
