export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { getAppItem } from '@/repository/app'

/**
 * 代理 Dify API 的应用参数请求
 *
 * @param request NextRequest 对象
 * @param params 包含应用 ID 的参数对象
 * @returns 来自 Dify API 的应用参数
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
			return NextResponse.json({ error: 'App not found' }, { status: 404 })
		}

		// 转发请求到 Dify API
		const response = await fetch(`${app.requestConfig.apiBase}/parameters`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
		})

		// 返回响应
		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error(`Error fetching app parameters from Dify API:`, error)
		return NextResponse.json({ error: 'Failed to fetch app parameters' }, { status: 500 })
	}
}
