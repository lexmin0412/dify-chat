export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'

import { createDifyApiResponse, handleApiError, proxyDifyRequest } from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 获取消息建议
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string; messageId: string }> },
) {
	try {
		const { appId, messageId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 获取用户ID
		const user = request.nextUrl.searchParams.get('user')

		// 代理请求到 Dify API
		const response = await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			`/messages/${messageId}/suggested?user=${user}`,
		)

		const result = await response.json()
		return createDifyApiResponse(result.data || [], response.status)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(
			error,
			`Error fetching message suggestions for ${resolvedParams.messageId} in ${resolvedParams.appId}`,
		)
	}
}
