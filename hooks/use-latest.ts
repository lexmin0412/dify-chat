import { useRef } from 'react'

// 可以提取到公共 hooks
export function useLatest<T>(value: T) {
	const ref = useRef(value)
	ref.current = value
	return ref
}
