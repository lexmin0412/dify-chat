import { useDifyChatStore } from '@/lib/core'
import { useThemeContext } from '@/lib/theme'
import { useMemo } from 'react'
import React from 'react'
import data from '@emoji-mart/data'
import { init } from 'emoji-mart'

init({ data })

import { completeFileUrl } from '@/components/chat/utils-index'
import { useMount } from 'ahooks'

/**
 * 应用图标
 */
export default function AppIcon(props: { size?: 'small' | 'default'; hasContainer?: boolean }) {
	const { size = 'default', hasContainer = false } = props

	const currentApp = useDifyChatStore(s => s.currentApp)
	const { isDark } = useThemeContext()

	// 初始化 emoji-mart
	useMount(() => {
		init({ data })
	})

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
		if (renderProps.type === 'image') {
			return (
				<img
					className="inline-block h-full w-full"
					src={renderProps.icon}
				/>
			)
		}
		const emoji = (data as Record<string, unknown>).emojis as
			| Record<string, { skins?: { native: string }[] }>
			| undefined
		const native = emoji?.[renderProps.icon]?.skins?.[0]?.native
		return native || renderProps.icon || '🤖'
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
