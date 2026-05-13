import { NextRequest, NextResponse } from 'next/server'

import { createSafeApp, handleApiError } from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

export const dynamic = 'force-dynamic'

/**
 * 获取单个应用详情 (供客户端使用)
 *
 * @param request NextRequest 对象
 * @param params 包含应用 ID 的参数对象
 * @returns 应用详情，但不包含敏感的 API Key
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const app = await getAppItem(id)

		if (!app) {
			return NextResponse.json({ error: 'App not found' }, { status: 404 })
		}

		// 过滤敏感信息，不返回 API Key 到客户端
		const safeApp = createSafeApp(app)

		return NextResponse.json(safeApp)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(error, `Error fetching app ${resolvedParams.id} for client`)
	}
}
