import { describe, expect, it } from 'vitest'

/**
 * Dify 的 AUDIO_EXTENSIONS 白名单（来自 Dify 源码 api/constants/__init__.py）
 * 当前仅允许: mp3, m4a, wav, amr, mpga
 * webm、mp4、mpeg 不在列表中，proxy 层需要重映射为 audio/wav
 */
const DIFY_AUDIO_TYPES = ['audio/mp3', 'audio/m4a', 'audio/wav', 'audio/amr', 'audio/mpga']

function normalizeAudioType(file: File): File {
	if (DIFY_AUDIO_TYPES.includes(file.type)) {
		return file
	}
	return new File([file], file.name || 'audio.wav', { type: 'audio/wav' })
}

describe('audio2text MIME remapping', () => {
	it('keeps supported audio/wav', () => {
		const file = new File(['test'], 'test.wav', { type: 'audio/wav' })
		const result = normalizeAudioType(file)
		expect(result.type).toBe('audio/wav')
	})

	it('keeps supported audio/mp3', () => {
		const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' })
		const result = normalizeAudioType(file)
		expect(result.type).toBe('audio/mp3')
	})

	it('remaps unsupported audio/webm → audio/wav', () => {
		const file = new File(['test'], 'blob', { type: 'audio/webm' })
		const result = normalizeAudioType(file)
		expect(result.type).toBe('audio/wav')
	})

	it('remaps unsupported audio/webm;codecs=opus → audio/wav', () => {
		const file = new File(['test'], 'blob', { type: 'audio/webm;codecs=opus' })
		const result = normalizeAudioType(file)
		expect(result.type).toBe('audio/wav')
	})

	it('preserves file content when remapping', () => {
		const content = new Uint8Array([0x01, 0x02, 0x03])
		const file = new File([content], 'blob', { type: 'audio/webm' })
		const result = normalizeAudioType(file)
		expect(result.size).toBe(3)
	})

	it('remaps audio/mp4 (unsupported) → audio/wav', () => {
		const file = new File(['test'], 'test.mp4', { type: 'audio/mp4' })
		const result = normalizeAudioType(file)
		expect(result.type).toBe('audio/wav')
	})
})
