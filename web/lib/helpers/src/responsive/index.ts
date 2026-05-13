import { configResponsive, useResponsive } from 'ahooks'

/**
 * 与 tailwind 保持一致的的响应式配置
 */
export type ITailwindCompatibleResponsiveConfig = Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', number>

/**
 * 默认的响应式配置
 */
export const DEFAULT_RESPONSIVE_CONFIG: ITailwindCompatibleResponsiveConfig = {
	sm: 0,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
}

/**
 * 初始化响应式配置
 */
export const initResponsiveConfig = (
	config: ITailwindCompatibleResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG,
) => {
	return configResponsive(config)
}

/**
 * 是否是移动端
 */
export const useIsMobile = () => {
	const responsive = useResponsive() as unknown as ITailwindCompatibleResponsiveConfig
	const { sm, md } = responsive || {}
	return !!sm && !md
}
