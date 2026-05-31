import { describe, expect, it } from 'vitest'
import { createDifyApiResponse } from '@/lib/api-utils'

describe('createDifyApiResponse', () => {
	it('wraps data with code and status 200 by default', () => {
		const response = createDifyApiResponse({ text: 'hello' })
		expect(response.status).toBe(200)
	})

	it('returns error status when specified', () => {
		const response = createDifyApiResponse({ error: 'Not found' }, 404)
		expect(response.status).toBe(404)
	})
})

describe('createFormDataProxy — MIME normalization', () => {
	it('strips codec params from file MIME type (audio/webm;codecs=opus → audio/webm)', async () => {
		const { createFormDataProxy } = await import('@/lib/api-utils')
		const file = new File(['test'], 'audio.webm', { type: 'audio/webm;codecs=opus' })

		const formData = new FormData()
		formData.append('file', file, 'audio.webm')

		// Mock NextRequest
		const request = {
			formData: async () => formData,
		} as unknown as Request

		const result = await createFormDataProxy(request as any)
		const resultFile = result.get('file') as File
		expect(resultFile.type).toBe('audio/webm')
		expect(resultFile.size).toBe(4)
		expect(resultFile.name).toBe('audio.webm')
	})

	it('preserves MIME type that has no codec params', async () => {
		const { createFormDataProxy } = await import('@/lib/api-utils')
		const file = new File(['test'], 'audio.wav', { type: 'audio/wav' })

		const formData = new FormData()
		formData.append('file', file, 'audio.wav')

		const request = {
			formData: async () => formData,
		} as unknown as Request

		const result = await createFormDataProxy(request as any)
		const resultFile = result.get('file') as File
		expect(resultFile.type).toBe('audio/wav')
	})

	it('passes through non-file fields unchanged', async () => {
		const { createFormDataProxy } = await import('@/lib/api-utils')
		const formData = new FormData()
		formData.append('user', 'test-user-123')

		const request = {
			formData: async () => formData,
		} as unknown as Request

		const result = await createFormDataProxy(request as any)
		expect(result.get('user')).toBe('test-user-123')
	})

	it('normalizes video/webm;codecs=vp9 video MIME type', async () => {
		const { createFormDataProxy } = await import('@/lib/api-utils')
		const file = new File(['video'], 'video.webm', { type: 'video/webm;codecs=vp9' })

		const formData = new FormData()
		formData.append('file', file, 'video.webm')

		const request = {
			formData: async () => formData,
		} as unknown as Request

		const result = await createFormDataProxy(request as any)
		const resultFile = result.get('file') as File
		expect(resultFile.type).toBe('video/webm')
	})
})
