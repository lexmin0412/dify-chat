/**
 * 全局 LocalStorage Key 前缀
 */
const KEY_PREFIX = '__DC__'

const LocalStorageKeyList = [
	'USER_ID',
	'ENABLE_SETTING',
	'THEME',
	'THEME_MODE',
	'RUNNING_MODE',
	'ENABLE_SETTING',
] as const

export const LocalStorageKeys = LocalStorageKeyList.reduce(
	(acc, key) => {
		// @ts-expect-error 已知错误，待解决
		acc[key] = key
		return acc
	},
	{} as { [key in (typeof LocalStorageKeyList)[number]]: key },
)

type ILocalStorageKey = (typeof LocalStorageKeyList)[number]

/**
 * 生成 localStorage key
 */
export const genLocalStorageKey = (key: ILocalStorageKey) => {
	return `${KEY_PREFIX}${key}`
}

/**
 * 内存 fallback：当 localStorage 不可用时（隐私模式、iframe 沙箱、配额耗尽等），
 * 使用 Map 存储数据，保证应用不崩溃。注意：页面刷新后数据会丢失。
 */
const memoryFallback = new Map<string, string>()

/**
 * 尝试访问 localStorage，失败时静默降级到内存存储
 */
const safeGetItem = (key: string): string | null => {
	try {
		return localStorage.getItem(key)
	} catch {
		return memoryFallback.get(key) ?? null
	}
}

const safeSetItem = (key: string, value: string): void => {
	try {
		localStorage.setItem(key, value)
	} catch {
		memoryFallback.set(key, value)
	}
}

/**
 * LocalStorage 操作封装
 */
class LocalStorageStoreBuilder {
	validateKey = (key: string) => {
		if (!key) {
			throw new Error('key is required')
		}
		if (!LocalStorageKeyList.some(item => item === key)) {
			throw new Error(`key is not valid, must be one of: ${LocalStorageKeyList.join(',')}`)
		}
		return true
	}

	/**
	 * 获取 localStorage 值
	 */
	get = (key: ILocalStorageKey) => {
		this.validateKey(key)
		const storageKey = genLocalStorageKey(key)
		const rawValue = safeGetItem(storageKey)
		let value
		try {
			value = JSON.parse(rawValue as string)
		} catch {
			value = rawValue
		}
		return value
	}

	/**
	 * 设置 localStorage 值
	 * @param key 必须是 LocalStorageKeys 中的 key
	 * @param value 必须是 string 类型
	 */
	set = (key: ILocalStorageKey, value: string) => {
		this.validateKey(key)
		if (typeof value === 'object' && value !== null) {
			value = JSON.stringify(value)
		}
		const storageKey = genLocalStorageKey(key)
		safeSetItem(storageKey, value)
	}
}

/**
 * LocalStorage 操作实例
 */
export const LocalStorageStore = new LocalStorageStoreBuilder()
