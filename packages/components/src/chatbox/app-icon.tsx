import { useAppContext } from '@dify-chat/core'
import { useThemeContext } from '@dify-chat/theme'
import { useMemo } from 'react'

/**
 * 应用图标
 */
export default function AppIcon(props: { size?: 'small' | 'default' }) {
	const { size = 'default' } = props

	const { currentApp } = useAppContext()
	const { isDark } = useThemeContext()

	const renderProps = useMemo(() => {
		return {
			background: currentApp?.site?.icon_background || '#ffead5',
			type: currentApp?.site?.icon_type || 'emoji',
			icon: currentApp?.site?.icon_url || currentApp?.site?.icon || '🤖',
		}
	}, [currentApp])

	const renderIcon = useMemo(() => {
		return renderProps.type === 'emoji' ? (
			renderProps.icon
		) : (
			<img
				className="w-full h-full inline-block"
				src={renderProps.icon}
			/>
		)
	}, [renderProps])

	return (
		<div
			className={`rounded-lg flex items-center justify-center ${size === 'small' ? 'w-9 h-9 text-xl' : 'w-11 h-11 text-2xl'} flex items-center overflow-hidden`}
			style={{
				background: isDark ? 'transparent' : renderProps.background,
			}}
		>
			{renderIcon}
		</div>
	)
}
