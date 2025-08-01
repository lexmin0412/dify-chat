'use server'

import { NextRequest } from 'next/server'

import {
	createDifyApiResponse,
	getUserIdFromRequest,
	handleApiError,
	proxyDifyRequest,
} from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 停止聊天消息生成
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { appId: string; taskId: string } },
) {
	try {
		const { appId, taskId } = params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 获取用户ID
		const userId = getUserIdFromRequest(request)

		// 代理请求到 Dify API
		const response = await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			`/chat-messages/${taskId}/stop`,
			{
				method: 'POST',
				body: JSON.stringify({
					user: userId,
				}),
			},
		)

		const data = await response.json()
		return createDifyApiResponse(data, response.status)
	} catch (error) {
		return handleApiError(error, `Error stopping chat message ${params.taskId} for ${params.appId}`)
	}
}
