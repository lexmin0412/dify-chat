export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'

import { createDifyResponseProxy, getUserIdFromRequest } from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 文字转音频
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string }> },
) {
	try {
		const { appId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return new Response(JSON.stringify({ error: 'App not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// 获取请求体
		const body = await request.json()
		const { message_id, text } = body

		// 获取用户ID
		const userId = getUserIdFromRequest(request)

		// 代理请求到 Dify API
		const response = await fetch(`${app.requestConfig.apiBase}/text-to-audio`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
			body: JSON.stringify({
				message_id,
				text,
				user: userId,
			}),
		})

		// 返回原始响应（可能是音频流）
		return createDifyResponseProxy(response)
	} catch (error) {
		const resolvedParams = await params
		console.error(`Error converting text to audio for ${resolvedParams.appId}:`, error)
		return new Response(JSON.stringify({ error: 'Failed to convert text to audio' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}
}
