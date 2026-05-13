import { NextRequest, NextResponse } from 'next/server'

import { getAppItem } from '@/repository/app'

export const dynamic = 'force-dynamic'

/**
 * 代理 Dify API 的聊天消息请求
 *
 * @param request NextRequest 对象
 * @param params 包含应用 ID 的参数对象
 * @returns 来自 Dify API 的响应
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
			return NextResponse.json({ error: 'App not found' }, { status: 404 })
		}

		// 从请求中获取数据
		const data = await request.json()

		// 转发请求到 Dify API
		const response = await fetch(`${app.requestConfig.apiBase}/chat-messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
			body: JSON.stringify(data),
		})

		// 如果是流式响应，需要特殊处理
		if (data.response_mode === 'streaming') {
			// 创建一个新的 ReadableStream
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

			// 返回流式响应
			return new Response(stream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
				},
			})
		}

		// 非流式响应直接返回
		const responseData = await response.json()
		return NextResponse.json(responseData, { status: response.status })
	} catch (error) {
		console.error(`Error proxying request to Dify API:`, error)
		return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
	}
}
