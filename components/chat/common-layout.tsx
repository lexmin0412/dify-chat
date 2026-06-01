import { HeaderLayout } from '@/components/shared'
import { IDifyAppItem, useDifyChatStore } from '@/lib/core'
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
	const appLoading = useDifyChatStore(s => s.appLoading)
	const currentApp = useDifyChatStore(s => s.currentApp)
	const { t } = useTranslation()

	return (
		<div className={`bg-theme-bg flex h-screen w-full flex-col overflow-hidden`}>
			{/* 头部 */}
			<HeaderLayout title={renderCenterTitle?.(currentApp?.config?.info)} />

			{/* Main */}
			<div className="bg-theme-main-bg flex flex-1 overflow-hidden rounded-t-3xl">
				{appLoading || initLoading ? (
					<div className="absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center">
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
