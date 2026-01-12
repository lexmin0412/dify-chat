export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'

import {
	createDifyApiResponse,
	getUserIdFromRequest,
	handleApiError,
	proxyDifyRequest,
} from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 删除会话
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string; conversationId: string }> },
) {
	try {
		const { appId, conversationId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 获取用户ID
		const userId = getUserIdFromRequest(request)

		// 代理请求到 Dify API
		await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			`/conversations/${conversationId}`,
			{
				method: 'DELETE',
				body: JSON.stringify({
					user: userId,
				}),
			},
		)
		return createDifyApiResponse({}, 200)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(
			error,
			`Error deleting conversation ${resolvedParams.conversationId} for ${resolvedParams.appId}`,
		)
	}
}
