/**
 * 是否为临时 ID
 */
export const isTempId = (id: string | undefined) => {
	if (!id) {
		return false
	}
	return id.startsWith('temp')
}

/**
 * 生成符合 RFC 4122 标准的 UUID v4
 * 支持浏览器和 Node.js 环境，不依赖第三方库
 */
export const generateUuidV4 = (): string => {
	// 检查是否支持 crypto.getRandomValues (浏览器) 或 crypto.randomBytes (Node.js)
	let randomBytes: (size: number) => Uint8Array

	if (typeof crypto !== 'undefined') {
		if (crypto.getRandomValues) {
			// 浏览器环境
			randomBytes = (size: number) => {
				const array = new Uint8Array(size)
				crypto.getRandomValues(array)
				return array
			}
		} else if ('randomBytes' in crypto) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			randomBytes = (crypto as any).randomBytes
		} else {
			// 降级到 Math.random (不推荐，但作为后备方案)
			randomBytes = (size: number) => {
				const array = new Uint8Array(size)
				for (let i = 0; i < size; i++) {
					array[i] = Math.floor(Math.random() * 256)
				}
				return array
			}
		}
	} else {
		// 降级到 Math.random
		randomBytes = (size: number) => {
			const array = new Uint8Array(size)
			for (let i = 0; i < size; i++) {
				array[i] = Math.floor(Math.random() * 256)
			}
			return array
		}
	}

	// 生成 16 字节的随机数据
	const bytes = randomBytes(16)

	// 设置版本 (4) 和变体位
	bytes[6] = (bytes[6] & 0x0f) | 0x40 // 版本 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80 // 变体 1

	// 转换为十六进制字符串
	const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')

	// 格式化为 UUID 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20, 32),
	].join('-')
}

/**
 * 验证 UUID 格式是否正确
 * @param uuid 要验证的 UUID 字符串
 * @returns 是否为有效的 UUID 格式
 */
export const isValidUuid = (uuid: string): boolean => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
	return uuidRegex.test(uuid)
}
