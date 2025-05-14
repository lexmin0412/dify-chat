import { AppModeEnums, IDifyAppItem } from '@dify-chat/core'

/**
 * 静态的应用列表，用于演示
 * 注意：**尽量不要在公开的生产环境中使用静态数据**，推荐使用后端服务
 */
export const staticAppList: IDifyAppItem[] = [
	{
		id: '0.270357011315995',
		info: {
			name: 'My Chatflow APP',
			description: '我的 Chatflow 应用',
			tags: [],
			mode: AppModeEnums.CHATFLOW,
		},
		requestConfig: {
			apiBase: 'https://api.dify.ai/v1',
			apiKey: 'app-xxxxxxx',
		},
	},
	{
		id: '0.28936574761079314',
		info: {
			name: 'My Workflow APP',
			description: '我的 Workflow 应用',
			tags: [],
			mode: AppModeEnums.WORKFLOW,
		},
		requestConfig: {
			apiBase: 'http://127.0.0.1:5001/v1',
			apiKey: 'app-xxxxxxx',
		},
	},
]
