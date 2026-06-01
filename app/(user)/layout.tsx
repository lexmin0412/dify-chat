'use client'

import { ThemeContextProvider, useThemeContext } from '@/lib/theme'
import { App, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/use-auth'
import { initResponsiveConfig } from '@/lib/helpers'

import '@/libs/i18n'

initResponsiveConfig()

function UserLayoutInner({ children }: { children: React.ReactNode }) {
	const { isAuthorized } = useAuth()
	const pathname = usePathname()
	const router = useRouter()
	const { i18n } = useTranslation()
	const { isDark } = useThemeContext()

	useEffect(() => {
		if (!isAuthorized && pathname !== '/auth') {
			router.replace('/auth')
		}
	}, [isAuthorized, pathname, router])

	return (
		<ConfigProvider
			locale={i18n.language === 'en' ? enUS : zhCN}
			theme={{
				algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
			}}
		>
			<App>{children}</App>
		</ConfigProvider>
	)
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
	return (
		<ThemeContextProvider>
			<UserLayoutInner>{children}</UserLayoutInner>
		</ThemeContextProvider>
	)
}
