import { BaseRequest } from '@dify-chat/helpers'

import { IDifyAppRequestConfig } from '../repository'

/**
 * 根据请求配置生成 Dify 请求函数
 */
export const genDifyRequestByRequestConfig = async (requestConfig: IDifyAppRequestConfig) => {
	if (!requestConfig.apiKey) {
		throw new Error('apiKey is required')
	}
	const { apiBase, apiKey } = requestConfig
	const request = new BaseRequest({
		baseURL: apiBase,
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	})
	return request
}
