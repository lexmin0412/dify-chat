import pako from 'pako'

/**
 * 解压缩 gzip 字符串
 * @param encodedStr gzip 压缩后的字符串
 */
export const unParseGzipString = (encodedStr: string) => {
	try {
		// Base64 解码
		const binaryString = atob(encodedStr)
		const bytes = new Uint8Array(binaryString.length)
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i)
		}
		// gzip 解压缩
		const decompressedData = pako.inflate(bytes, { to: 'string' })
		return {
			error: false,
			data: decompressedData,
		}
	} catch (error) {
		console.error('解压缩过程中出现错误:', error)
		return {
			error: error,
			data: '',
		}
	}
}
