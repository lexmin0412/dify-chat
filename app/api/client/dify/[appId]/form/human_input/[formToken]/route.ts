export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'

import { createDifyApiResponse, handleApiError, proxyDifyRequest } from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'
import { getUserIdFromRequest } from '@/lib/api-utils'

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string; formToken: string }> },
) {
	try {
		const { appId, formToken } = await params

		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		const body = await request.json()
		const userId = getUserIdFromRequest(request)

		const response = await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			`/form/human_input/${formToken}`,
			{
				method: 'POST',
				body: JSON.stringify({
					...body,
					user: body.user || userId,
				}),
			},
		)

		if (!response.ok) {
			const text = await response.text().catch(() => '')
			return createDifyApiResponse({ error: text || 'Dify API error' }, response.status)
		}

		const data = await response.json()
		return createDifyApiResponse(data, response.status)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(
			error,
			`Error submitting human input form ${resolvedParams.formToken} for ${resolvedParams.appId}`,
		)
	}
}
