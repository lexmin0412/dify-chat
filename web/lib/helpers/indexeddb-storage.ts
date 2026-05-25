import { get, set, del } from 'idb-keyval'

const memoryFallback = new Map<string, string>()

export const indexedDBStorage = {
	getItem: async (name: string) => {
		try {
			const value = await get(name)
			return value ?? null
		} catch {
			return memoryFallback.get(name) ?? null
		}
	},
	setItem: async (name: string, value: string) => {
		try {
			await set(name, value)
		} catch {
			memoryFallback.set(name, value)
		}
	},
	removeItem: async (name: string) => {
		try {
			await del(name)
		} catch {
			memoryFallback.delete(name)
		}
	},
}
