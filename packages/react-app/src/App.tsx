import { initResponsiveConfig } from '@dify-chat/helpers'
import { useThemeContext } from '@dify-chat/theme'
import { theme as antdTheme, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { BrowserRouter, type IRoute } from 'pure-react-router'

import './App.css'
import LayoutIndex from './layout'
import AppListPage from './pages/apps'
import AuthPage from './pages/auth'
import ChatPage from './pages/chat'
import '@/libs/i18n'

// 初始化响应式配置
initResponsiveConfig()

const routes: IRoute[] = [
	{ path: '/auth', component: () => <AuthPage /> },
	{ path: '/chat', component: () => <ChatPage /> },
	{ path: '/app/:appId', component: () => <ChatPage /> },
	{ path: '/apps', component: () => <AppListPage /> },
]

/**
 * Dify Chat 的最小应用实例
 */
export default function App() {
	const { isDark } = useThemeContext()

	return (
		<ConfigProvider
			locale={zhCN}
			theme={{
				algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
			}}
		>
			<BrowserRouter
				basename="/dify-chat"
				routes={routes}
			>
				<LayoutIndex />
			</BrowserRouter>
		</ConfigProvider>
	)
}
