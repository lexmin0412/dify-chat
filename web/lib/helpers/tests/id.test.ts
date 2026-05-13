import { describe, expect, test } from 'vitest'

import { isTempId } from '../src/id'

describe('isTempId', () => {
	test('应该识别有效的临时 ID', () => {
		expect(isTempId('temp_123')).toBe(true)
		expect(isTempId('temp-conv')).toBe(true)
		expect(isTempId('temp')).toBe(true)
	})

	test('应该排除非临时 ID', () => {
		expect(isTempId('persist_123')).toBe(false)
		expect(isTempId('')).toBe(false)
		expect(isTempId(undefined)).toBe(false)
		expect(isTempId(null as never)).toBe(false) // 测试非法输入
	})

	test('应该处理边界情况', () => {
		// 测试字符串中间包含 temp
		expect(isTempId('123_temp_456')).toBe(false)
		// 测试大小写敏感
		expect(isTempId('TEMP_123')).toBe(false)
	})
})
