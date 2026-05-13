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
		const rawValue = localStorage.getItem(storageKey)
		let value
		try {
			// 尝试解析获取到的值，如果是数组或对象 JSON 字符串则解析为对应的对象
			value = JSON.parse(rawValue as string)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_error) {
			// 解析失败，说明不是数组或对象，直接使用原始值
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
		// 如果是对象或数组，尝试转换为 JSON 字符串
		if (typeof value === 'object' && value !== null) {
			value = JSON.stringify(value)
		}
		const storageKey = genLocalStorageKey(key)
		localStorage.setItem(storageKey, value)
	}
}

/**
 * LocalStorage 操作实例
 */
export const LocalStorageStore = new LocalStorageStoreBuilder()
