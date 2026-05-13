'use client'

import { Spin } from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		// 如果用户已登录，重定向到应用管理页面
		if (status === 'authenticated' && session) {
			router.replace('/app-management')
		}
	}, [session, status, router])

	// 如果正在加载认证状态，显示加载中
	if (status === 'loading') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-lg">加载中...</div>
			</div>
		)
	}

	// 如果未登录，显示欢迎页面
	if (status === 'unauthenticated') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold">欢迎使用 Dify Chat Platform</h1>
					<p className="mb-6 text-gray-600">请先登录以访问应用管理功能</p>
					<button
						onClick={() => router.push('/login')}
						className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
					>
						前往登录
					</button>
				</div>
			</div>
		)
	}

	// 已登录的情况下，显示重定向中的提示（实际上会很快跳转）
	return (
		<div className="flex min-h-full w-full items-center justify-center">
			<Spin spinning />
		</div>
	)
}
