const DIFY_VERSION_KEY = 'DIFY_CHAT__DIFY_VERSION'

let memoryVersion = ''

const safeGet = (): string => {
	try {
		return localStorage.getItem(DIFY_VERSION_KEY) || ''
	} catch {
		return memoryVersion
	}
}

const safeSet = (version: string): void => {
	try {
		localStorage.setItem(DIFY_VERSION_KEY, version)
	} catch {
		memoryVersion = version
	}
}

/**
 * 获取 Dify 版本
 */
export const DIFY_INFO = {
	get version() {
		return safeGet()
	},

	set version(version: string) {
		safeSet(version)
	},
}
