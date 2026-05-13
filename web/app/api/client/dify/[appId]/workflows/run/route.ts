export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'

import {
	createDifyApiResponse,
	createDifyResponseProxy,
	getUserIdFromRequest,
	handleApiError,
	proxyDifyRequest,
} from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 获取工作流运行结果
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string }> },
) {
	try {
		const { appId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 获取查询参数中的运行ID
		const runId = request.nextUrl.searchParams.get('id')
		if (!runId) {
			return createDifyApiResponse({ error: 'Missing run ID' }, 400)
		}

		// 代理请求到 Dify API
		const response = await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			`/workflows/run/${runId}`,
		)

		const data = await response.json()
		return createDifyApiResponse(data, response.status)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(error, `Error fetching workflow run result for ${resolvedParams.appId}`)
	}
}

/**
 * 运行工作流
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
		const { inputs } = await request.json()

		// 获取用户ID
		const userId = getUserIdFromRequest(request)

		// 代理请求到 Dify API
		const response = await fetch(`${app.requestConfig.apiBase}/workflows/run`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
			body: JSON.stringify({
				response_mode: 'streaming',
				user: userId,
				inputs,
			}),
		})

		// 返回流式响应
		return createDifyResponseProxy(response)
	} catch (error) {
		const resolvedParams = await params
		console.error(`Error running workflow for ${resolvedParams.appId}:`, error)
		return new Response(JSON.stringify({ error: 'Failed to run workflow' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}
}
