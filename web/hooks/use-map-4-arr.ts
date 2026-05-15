import { useEffect, useState } from 'react'

/**
 * 将数组映射为 Map 的形式，应用于需要高频查找的场景，提升性能
 * @param arrState 数组
 * @param key 数组元素的 key
 */
export const useMap4Arr = <Item>(arrState: Item[], key: keyof Item) => {
	const [mapState] = useState<Map<Item[typeof key], Item>>(new Map())

	// 监听 arr 状态的变化，更新 Map
	useEffect(() => {
		const newMap = new Map(arrState.map(item => [item[key as keyof Item], item]))
		mapState.clear()
		newMap.forEach((v, k) => mapState.set(k, v))
	}, [arrState, key, mapState])

	return mapState
}
