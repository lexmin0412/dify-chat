import { HeaderLayout } from '@/components'
import { IDifyAppItem, useAppContext } from '@dify-chat/core'
import { Empty, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

interface ICommonLayoutProps {
	initLoading: boolean
	renderCenterTitle?: (appInfo?: IDifyAppItem['info']) => React.ReactNode
	children: React.ReactNode
	extComponents?: React.ReactNode
}

export default function CommonLayout(props: ICommonLayoutProps) {
	const { initLoading, renderCenterTitle, children, extComponents } = props
	const { appLoading, currentApp } = useAppContext()
	const { t } = useTranslation()

	return (
		<div className={`flex h-screen w-full flex-col overflow-hidden bg-theme-bg`}>
			{/* 头部 */}
			<HeaderLayout title={renderCenterTitle?.(currentApp?.config?.info)} />

			{/* Main */}
			<div className="flex flex-1 overflow-hidden rounded-t-3xl bg-theme-main-bg">
				{appLoading || initLoading ? (
					<div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center">
						<Spin spinning />
					</div>
				) : currentApp?.config ? (
					<>{children}</>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<Empty
							description={t('app.no_config_default_text')}
							className="text-base"
						/>
					</div>
				)}
			</div>
			{extComponents}
		</div>
	)
}
