import { IDifyAppItem } from '@/lib/core'
import { BaseRequest } from '@/lib/helpers'

interface IAppStorageAdapter {
	getApps(): Promise<IDifyAppItem[]>
	getAppByID(id: string): Promise<IDifyAppItem>
}

const baseRequest = new BaseRequest({
	baseURL: '/api/client',
})

class AppService implements IAppStorageAdapter {
	async getApps(): Promise<IDifyAppItem[]> {
		const result = await baseRequest.get('/apps')
		return Promise.resolve(result)
	}

	async getAppByID(id: string): Promise<IDifyAppItem> {
		const appList = await this.getApps()
		return Promise.resolve(appList?.find(item => item.id === id) as IDifyAppItem)
	}
}

export default new AppService()
