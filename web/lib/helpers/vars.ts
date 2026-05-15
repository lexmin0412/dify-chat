const DIFY_VERSION_KEY = 'DIFY_CHAT__DIFY_VERSION'

/**
 * 获取 Dify 版本
 */
export const DIFY_INFO = {
	get version() {
		return localStorage.getItem(DIFY_VERSION_KEY) || ''
	},

	set version(version: string) {
		localStorage.setItem(DIFY_VERSION_KEY, version)
	},
}
