import React, { useCallback, useEffect, useState } from 'react';
import { ThemeEnum, ThemeModeEnum } from '../constants';

/**
 * 主题模式，用于用户手动切换， light-固定浅色 dark-固定深色，system-跟随系统
 */
export type IThemeMode = 'light' | 'dark' | 'system';

/**
 * 实际应用的主题
 */
export type ICurrentTheme = 'light' | 'dark';

/**
 * 主题上下文类型定义
 */
export interface IThemeContext {
	/**
	 * 当前主题
	 */
	theme: ThemeEnum;
	/**
	 * 当前主题模式
	 */
	themeMode: ThemeModeEnum;
	/**
	 * 手动设置主题模式
	 */
	setThemeMode: (theme: ThemeModeEnum) => void;
}

/**
 * 主题上下文
 */
export const ThemeContext = React.createContext<IThemeContext>({
	theme: ThemeEnum.LIGHT,
	setThemeMode: () => {},
	themeMode: ThemeModeEnum.SYSTEM,
});

/**
 * 暗黑模式的 body 类名
 */
export const DARK_CLASS_NAME = 'dark';

/**
 * 主题上下文提供者
 */
export const ThemeContextProvider = (props: { children: React.ReactNode }) => {
	const { children } = props;
	const [themeMode, setThemeMode] = useState<ThemeModeEnum>(
		ThemeModeEnum.SYSTEM,
	);
	const [themeState, setThemeState] = React.useState<ThemeEnum>(
		ThemeEnum.LIGHT,
	);

	/**
	 * 监听主题变化
	 */
	const handleColorSchemeChange = useCallback(
		(event: MediaQueryList) => {
			if (event.matches) {
				setThemeState(ThemeEnum.DARK);
				document.body.classList.add(DARK_CLASS_NAME);
			} else {
				setThemeState(ThemeEnum.LIGHT);
				document.body.classList.remove(DARK_CLASS_NAME);
			}
		},
		[setThemeState],
	);

	/**
	 * 初始化主题监听
	 */
	const initThemeListener = () => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		handleColorSchemeChange(mediaQuery);
		// 只有跟随系统时才监听媒体查询
		if (themeMode === ThemeModeEnum.SYSTEM) {
			// @ts-expect-error 监听媒体查询的变化, FIXME: 类型错误, 待优化
			mediaQuery.addEventListener('change', handleColorSchemeChange);
		}
	};

	useEffect(() => {
		initThemeListener();
	}, []);

	const handleUserSelect = (themeMode: ThemeModeEnum) => {
		setThemeMode(themeMode);
		if (themeMode === ThemeModeEnum.SYSTEM) {
			initThemeListener();
		} else {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			// @ts-expect-error 移除监听媒体查询的变化, FIXME: 类型错误, 待优化
			mediaQuery.removeEventListener('change', handleColorSchemeChange);
			if (themeMode === ThemeModeEnum.DARK) {
				setThemeState(ThemeEnum.DARK);
				document.body.classList.add(DARK_CLASS_NAME);
			} else if (themeMode === ThemeModeEnum.LIGHT) {
				setThemeState(ThemeEnum.LIGHT);
				document.body.classList.remove(DARK_CLASS_NAME);
			}
		}
	};

	return (
		<ThemeContext.Provider
			value={{ theme: themeState, themeMode, setThemeMode: handleUserSelect }}
		>
			{children}
		</ThemeContext.Provider>
	);
};

/**
 * 获取主题上下文 hook
 */
export const useThemeContext = () => {
	const context = React.useContext(ThemeContext);
	return {
		...context,
		isDark: context.theme === ThemeEnum.DARK,
		isLight: context.theme === ThemeEnum.LIGHT,
		isSystemMode: context.themeMode === ThemeModeEnum.SYSTEM,
	};
};
