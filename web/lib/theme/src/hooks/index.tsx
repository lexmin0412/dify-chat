import React, { useCallback, useEffect, useState } from 'react'
import { ThemeEnum, ThemeModeEnum } from '../constants'
import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'

/**
 * 主题模式，用于用户手动切换， light-固定浅色 dark-固定深色，system-跟随系统
 */
export type IThemeMode = 'light' | 'dark' | 'system'

/**
 * 实际应用的主题
 */
export type ICurrentTheme = 'light' | 'dark'

/**
 * 主题上下文类型定义
 */
export interface IThemeContext {
	/**
	 * 当前主题
	 */
	theme: ThemeEnum
	/**
	 * 当前主题模式
	 */
	themeMode: ThemeModeEnum
	/**
	 * 手动设置主题模式
	 */
	setThemeMode: (theme: ThemeModeEnum) => void
}

/**
 * 主题上下文
 */
export const ThemeContext = React.createContext<IThemeContext>({
	theme: ThemeEnum.LIGHT,
	setThemeMode: () => {},
	themeMode: ThemeModeEnum.SYSTEM,
})

/**
 * 暗黑模式的 body 类名
 */
export const DARK_CLASS_NAME = 'dark'

/**
 * 主题上下文提供者
 */
export const ThemeContextProvider = (props: { children: React.ReactNode }) => {
	const { children } = props
	const [themeMode, setThemeMode] = useState<ThemeModeEnum>(() => {
		if (typeof window === 'undefined') {
			return ThemeModeEnum.SYSTEM
		}
		return LocalStorageStore.get(LocalStorageKeys.THEME_MODE) || ThemeModeEnum.SYSTEM
	})
	const [themeState, setThemeState] = React.useState<ThemeEnum>(() => {
		if (typeof window === 'undefined') {
			return ThemeEnum.LIGHT
		}
		return (LocalStorageStore.get(LocalStorageKeys.THEME) as ThemeEnum) || ThemeEnum.LIGHT
	})

	useEffect(() => {
		LocalStorageStore.set(LocalStorageKeys.THEME, themeState)
	}, [themeState])

	/**
	 * 监听主题变化，更新状态并给 body 添加类名
	 */
	const handleColorSchemeChange = useCallback(
		(event: MediaQueryList) => {
			if (event.matches) {
				setThemeState(ThemeEnum.DARK)
				document.body.classList.add(DARK_CLASS_NAME)
			} else {
				setThemeState(ThemeEnum.LIGHT)
				document.body.classList.remove(DARK_CLASS_NAME)
			}
		},
		[setThemeState, themeMode],
	)

	useEffect(() => {
		LocalStorageStore.set(LocalStorageKeys.THEME_MODE, themeMode)
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		if (themeMode === ThemeModeEnum.SYSTEM) {
			// 从其他模式切换到系统主题时，先调用一次
			handleColorSchemeChange(mediaQuery)
			if (mediaQuery.addEventListener) {
				// @ts-expect-error 监听媒体查询的变化, FIXME: 类型错误, 待优化
				mediaQuery.addEventListener('change', handleColorSchemeChange)
			} else if (mediaQuery.addListener) {
				// @ts-expect-error 旧版本浏览器兼容
				mediaQuery.addListener(handleColorSchemeChange)
			}
		} else {
			if (mediaQuery.removeEventListener) {
				// @ts-expect-error 移除监听媒体查询的变化, FIXME: 类型错误, 待优化
				mediaQuery.removeEventListener('change', handleColorSchemeChange)
			} else if (mediaQuery.removeListener) {
				// @ts-expect-error 旧版本浏览器兼容
				mediaQuery.removeListener(handleColorSchemeChange)
			}
			if (themeMode === ThemeModeEnum.DARK) {
				setThemeState(ThemeEnum.DARK)
				document.body.classList.add(DARK_CLASS_NAME)
			} else if (themeMode === ThemeModeEnum.LIGHT) {
				setThemeState(ThemeEnum.LIGHT)
				document.body.classList.remove(DARK_CLASS_NAME)
			}
		}
	}, [themeMode])

	return (
		<ThemeContext.Provider value={{ theme: themeState, themeMode, setThemeMode }}>
			{children}
		</ThemeContext.Provider>
	)
}

/**
 * 获取主题上下文 hook
 */
export const useThemeContext = () => {
	const context = React.useContext(ThemeContext)
	return {
		...context,
		isDark: context.theme === ThemeEnum.DARK,
		isLight: context.theme === ThemeEnum.LIGHT,
		isSystemMode: context.themeMode === ThemeModeEnum.SYSTEM,
	}
}
