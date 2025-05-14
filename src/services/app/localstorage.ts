import { DifyAppStore, type IDifyAppItem } from '@dify-chat/core'

import { APP_LIST_KEY } from '@/constants'

/**
 * 应用列表 CRUD 的 localStorage 实现
 */
class DifyAppService extends DifyAppStore {
	public readonly = false as const

	async getApps(): Promise<IDifyAppItem[]> {
		const appJson = localStorage.getItem(APP_LIST_KEY)
		return appJson ? JSON.parse(appJson) : []
	}

	async getApp(id: string): Promise<IDifyAppItem | undefined> {
		const apps = await this.getApps()
		return apps.find(config => config.id === id)
	}

	async addApp(config: IDifyAppItem): Promise<void> {
		const apps = await this.getApps()
		apps.push(config)
		localStorage.setItem(APP_LIST_KEY, JSON.stringify(apps))
	}

	async updateApp(config: IDifyAppItem): Promise<void> {
		const apps = await this.getApps()
		const index = apps.findIndex(c => c.id === config.id)
		if (index !== -1) {
			apps[index] = config
			localStorage.setItem(APP_LIST_KEY, JSON.stringify(apps))
		}
	}

	async deleteApp(id: string): Promise<void> {
		const apps = await this.getApps()
		const newApps = apps.filter(config => config.id !== id)
		localStorage.setItem(APP_LIST_KEY, JSON.stringify(newApps))
	}
}

export default DifyAppService
