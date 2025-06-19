/**
 * 主题枚举
 */
export enum ThemeEnum {
	LIGHT = 'light',
	DARK = 'dark',
}

/**
 * 主题模式枚举
 */
export enum ThemeModeEnum {
	SYSTEM = 'system',
	LIGHT = 'light',
	DARK = 'dark',
}

/**
 * 主题模式文本枚举
 */
export enum ThemeModeLabelEnum {
	SYSTEM = '跟隨系統',
	LIGHT = '淺色',
	DARK = '深色',
}

/**
 * 主题模式常量对应的选项
 */
export const ThemeModeOptions = [
	{
		label: ThemeModeLabelEnum.SYSTEM,
		value: ThemeModeEnum.SYSTEM,
	},
	{
		label: ThemeModeLabelEnum.LIGHT,
		value: ThemeModeEnum.LIGHT,
	},
	{
		label: ThemeModeLabelEnum.DARK,
		value: ThemeModeEnum.DARK,
	},
];
