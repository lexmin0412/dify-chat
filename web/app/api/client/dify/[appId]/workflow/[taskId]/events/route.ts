import { NextRequest } from 'next/server'

import { getAppItem } from '@/repository/app'

export const dynamic = 'force-dynamic'

/**
 * 代理 Dify API 的工作流事件流请求（用于 HITL 后重连 SSE）
 *
 * Dify API: GET /workflows/{task_id}/events?user={userId}
 *
 * @param request NextRequest 对象
 * @param params 包含应用 ID 和任务 ID 的参数对象
 * @returns SSE 流式响应
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string; taskId: string }> },
) {
	try {
		const { appId, taskId } = await params
		const { searchParams } = new URL(request.url)
		const user = searchParams.get('user')

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return new Response(JSON.stringify({ error: 'App not found' }), { status: 404 })
		}

		// 转发请求到 Dify API
		const url = `${app.requestConfig.apiBase}/workflow/${taskId}/events${user ? `?user=${encodeURIComponent(user)}` : ''}`
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
		})

		// Dify API 返回错误时直接透传
		if (!response.ok) {
			const text = await response.text().catch(() => 'Unknown error')
			let errorData: Record<string, unknown>
			try {
				errorData = JSON.parse(text)
			} catch {
				errorData = { error: text.substring(0, 200) }
			}
			return new Response(JSON.stringify(errorData), { status: response.status })
		}

		// 透传 SSE 流式响应
		const stream = new ReadableStream({
			async start(controller) {
				const reader = response.body?.getReader()
				if (!reader) {
					controller.close()
					return
				}

				try {
					while (true) {
						const { done, value } = await reader.read()
						if (done) break
						controller.enqueue(value)
					}
				} finally {
					reader.releaseLock()
					controller.close()
				}
			},
		})

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		})
	} catch (error) {
		console.error('Error proxying workflow events request to Dify API:', error)
		return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 })
	}
}
