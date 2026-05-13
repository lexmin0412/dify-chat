export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'

import { handleApiError } from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 文件预览/下载代理
 * 对应 Dify API: GET /files/{file_id}/preview
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string; fileId: string }> },
) {
	try {
		const { appId, fileId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return new Response(JSON.stringify({ error: 'App not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// 解析查询参数
		const searchParams = request.nextUrl.searchParams
		const asAttachment = searchParams.get('as_attachment')
		const query = asAttachment === 'true' ? '?as_attachment=true' : ''

		const url = `${app.requestConfig.apiBase}/files/${fileId}/preview${query}`

		// 代理请求到 Dify API
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
		})

		// 透传响应（包括二进制和头部）
		const contentType = response.headers.get('Content-Type') || 'application/octet-stream'
		const contentDisposition = response.headers.get('Content-Disposition')
		const headers: Record<string, string> = {
			'Content-Type': contentType,
		}
		if (contentDisposition) {
			headers['Content-Disposition'] = contentDisposition
		}

		return new Response(response.body, {
			status: response.status,
			headers,
		})
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(
			error,
			`Error previewing file ${resolvedParams.fileId} for ${resolvedParams.appId}`,
		)
	}
}
