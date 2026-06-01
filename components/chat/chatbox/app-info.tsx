import { ICurrentApp, useDifyChatStore } from '@/lib/core'
import { Tag } from 'antd'
import { useMemo } from 'react'

import AppIcon from './app-icon'
import { useTranslation } from 'react-i18next'

/**
 * 应用信息
 */
export function AppInfo() {
	const currentApp = useDifyChatStore(s => s.currentApp)
	const { t } = useTranslation()

	const info4Render = useMemo(() => {
		if (!currentApp?.config && !currentApp?.site) {
			return {
				name: t('app.no_title_default'),
				description: '',
				tags: [],
			}
		}
		const { site, config } = currentApp as ICurrentApp
		return {
			name: site?.title || config?.info?.name,
			description: site?.description || config?.info?.description,
			tags: config?.info?.tags || [],
		}
	}, [currentApp?.config, currentApp?.site])

	return (
		<div className="text-theme-text pt-3">
			<div className="mt-3 flex items-center px-4">
				<AppIcon />
				<div className="box-border flex-1 overflow-hidden px-3">
					<div className="text-theme-text truncate text-sm">{info4Render.name}</div>
					{info4Render.description ? (
						<div
							className="text-desc truncate text-sm"
							title={info4Render.description}
						>
							{info4Render.description}
						</div>
					) : null}
				</div>
			</div>
			{info4Render.tags ? (
				<div className="mt-3 px-4">
					{info4Render.tags.map(tag => {
						return (
							<Tag
								key={tag}
								className="!mb-2"
							>
								{tag}
							</Tag>
						)
					})}
				</div>
			) : null}
		</div>
	)
}
