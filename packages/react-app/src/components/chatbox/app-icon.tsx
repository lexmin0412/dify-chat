import { useAppContext } from '@dify-chat/core'
import { useThemeContext } from '@dify-chat/theme'
// @ts-expect-error no declaration file
import emoji from 'emoji-dictionary'
import { useMemo } from 'react'

import { completeFileUrl } from '@/utils'

/**
 * 应用图标
 */
export default function AppIcon(props: { size?: 'small' | 'default'; hasContainer?: boolean }) {
	const { size = 'default', hasContainer = false } = props

	const { currentApp } = useAppContext()
	const { isDark } = useThemeContext()

	const renderProps = useMemo(() => {
		return {
			background: currentApp?.site?.icon_background || '#ffead5',
			type: currentApp?.site?.icon_type || 'emoji',
			icon: currentApp?.site?.icon_url
				? completeFileUrl(currentApp?.site?.icon_url, currentApp?.config.requestConfig.apiBase)
				: currentApp?.site?.icon || '🤖',
		}
	}, [currentApp])

	const renderIcon = useMemo(() => {
		return renderProps.type === 'emoji' ? (
			renderProps.icon === '🤖' ? (
				'🤖'
			) : (
				emoji.getUnicode(renderProps.icon)
			)
		) : (
			<img
				className="inline-block h-full w-full"
				src={renderProps.icon}
			/>
		)
	}, [renderProps])

	if (hasContainer) {
		return renderIcon
	}

	return (
		<div
			className={`flex items-center justify-center rounded-lg ${size === 'small' ? "h-9 w-9 text-xl" : "h-11 w-11 text-2xl"} flex items-center overflow-hidden`}
			style={{
				background: isDark ? 'transparent' : renderProps.background,
			}}
		>
			{renderIcon}
		</div>
	)
}
