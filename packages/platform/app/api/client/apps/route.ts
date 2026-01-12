import { NextResponse } from 'next/server'

import { createSafeApp, handleApiError } from '@/lib/api-utils'
import { getAppList } from '@/repository/app'

export const dynamic = 'force-dynamic'

/**
 * 获取应用列表 (供客户端使用)
 *
 * @returns 应用列表，但不包含敏感的 API Key
 */
export async function GET() {
	try {
		const apps = await getAppList()

		// 过滤敏感信息，不返回 API Key 到客户端
		const safeApps = apps.map(createSafeApp)

		return NextResponse.json(safeApps)
	} catch (error) {
		return handleApiError(error, 'Error fetching apps for client')
	}
}
