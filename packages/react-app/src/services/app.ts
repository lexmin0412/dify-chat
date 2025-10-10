import { IDifyAppItem } from '@dify-chat/core'
import { BaseRequest } from '@dify-chat/helpers'

import { getDebugApps, isDebugMode } from '@/components/debug-mode'
import { getApiBase } from '@/utils/runtime-config'

// import { uniqueId } from 'lodash-es'

// 支持多种存储方式
interface IAppStorageAdapter {
	/**
	 * 获取应用列表
	 * 如果是单应用模式，将会直接取第一个
	 */
	getApps(): Promise<IDifyAppItem[]>
	/**
	 * 通过 ID 获取应用，多应用模式下使用
	 */
	getAppByID(id: string): Promise<IDifyAppItem>
}

// 固定的应用列表
// const appList = [
// 	{
// 		id: uniqueId(),
// 		info: {
// 			name: 'Chatflow Test App',
// 			description: 'Chatflow 功能测试应用',
// 			tags: ['测试', 'Chatflow'],
// 		},
// 		requestConfig: {
// 			apiBase: 'https://api.dify.ai/v1',
// 			apiKey: 'app-xxx',
// 		},
// 	} as IDifyAppItem,
// ]

const baseRequest = new BaseRequest({
	baseURL: getApiBase(),
})

class AppService implements IAppStorageAdapter {
	async getApps(): Promise<IDifyAppItem[]> {
		// 检查是否开启调试模式
		if (isDebugMode()) {
			const debugApps = getDebugApps()
			return debugApps
		}

		const result = await baseRequest.get('/apps')
		return Promise.resolve(result)
	}

	async getAppByID(id: string): Promise<IDifyAppItem> {
		// 检查是否开启调试模式
		if (isDebugMode()) {
			const debugApps = getDebugApps()
			const debugApp = debugApps.find(app => app.id === id)
			if (debugApp) {
				return debugApp
			}
		}

		const appList = await this.getApps()
		return Promise.resolve(appList.find(item => item.id === id) as IDifyAppItem)
	}
}

export default new AppService()
