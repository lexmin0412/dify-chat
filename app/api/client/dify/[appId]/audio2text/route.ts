import { NextRequest } from 'next/server'

import {
	createDifyApiResponse,
	createFormDataProxy,
	getUserIdFromRequest,
	handleApiError,
} from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

export const dynamic = 'force-dynamic'

/**
 * 音频转文字
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
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 获取用户ID
		const userId = getUserIdFromRequest(request)

		// 构建代理 FormData
		const proxyFormData = await createFormDataProxy(request)
		proxyFormData.append('user', userId)

		// Dify's AUDIO_EXTENSIONS only allows: mp3, m4a, wav, amr, mpga
		// Chrome records as audio/webm which is NOT in Dify's allowlist.
		// Remap to audio/wav — the STT model (Whisper) auto-detects actual format.
		const DIFY_AUDIO_TYPES = ['audio/mp3', 'audio/m4a', 'audio/wav', 'audio/amr', 'audio/mpga']
		const audioFile = proxyFormData.get('file') as File | null
		if (audioFile && !DIFY_AUDIO_TYPES.includes(audioFile.type)) {
			const remapped = new File([audioFile], audioFile.name || 'audio.wav', { type: 'audio/wav' })
			proxyFormData.set('file', remapped, audioFile.name || 'audio.wav')
		}

		// 代理请求到 Dify API
		const response = await fetch(`${app.requestConfig.apiBase}/audio-to-text`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
			body: proxyFormData,
		})

		const data = await response.json()
		return createDifyApiResponse(data, response.status)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(error, `Error converting audio to text for ${resolvedParams.appId}`)
	}
}
