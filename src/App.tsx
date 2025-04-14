import { DifyChatProvider } from '@dify-chat/core'
import { initResponsiveConfig } from '@dify-chat/helpers'
import FingerPrintJS from '@fingerprintjs/fingerprintjs'
import { useMount } from 'ahooks'
import { BrowserRouter, type IRoute, Route } from 'pure-react-router'
import { useState } from 'react'

import AppListPage from './pages/app-list'
import ChatPage from './pages/chat'
import IndexPage from './pages/index'
import DifyAppService from './services/app/localstorage'

// 初始化响应式配置
initResponsiveConfig()

const routes: IRoute[] = [
	{ path: '/chat', component: () => <ChatPage /> },
	{ path: '/chat/:appId', component: () => <ChatPage /> },
	{ path: '/apps', component: () => <AppListPage /> },
	{ path: '/', component: () => <IndexPage /> },
]

/**
 * Dify Chat 的最小应用实例
 */
export default function App() {
	const [userId, setUserId] = useState<string>('')

	useMount(() => {
		// 模拟登录过程获取用户唯一标识
		const loadFP = async () => {
			const fp = await FingerPrintJS.load()
			const result = await fp.get()
			setUserId(result.visitorId)
		}
		loadFP()
	})

	return (
		<BrowserRouter
			basename="/dify-chat"
			routes={routes}
		>
			<DifyChatProvider
				value={{
					mode: 'multiApp',
					user: userId,
					// 默认使用 localstorage, 如果需要使用其他存储方式，可以实现 DifyAppStore 接口后传入，异步接口实现参考 src/services/app/restful.ts
					appService: new DifyAppService(),
				}}
			>
				<Route />
			</DifyChatProvider>
		</BrowserRouter>
	)
}
