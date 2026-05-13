'use server'

import { IDifyAppItem } from '@/types'

/**
 * 在服务端将 app 的 requestConfig 中的 apiKey 替换为 "app-***" 以避免 API 密钥泄露
 */
export const maskApiKey4AppConfig = async (app: IDifyAppItem) => {
	const { requestConfig, ...rest } = app
	const {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		apiKey,
		...restRequestConfig
	} = requestConfig || {}
	return {
		...rest,
		requestConfig: {
			...restRequestConfig,
			apiKey: 'app-***',
		},
	}
}
