'use server'

import { IDifyAppItem } from '@/types'

// 使用 TypeORM 实现
const getRepo = async () => {
	return await import('./typeorm/app')
}

/**
 * 获取应用列表数据
 */
export const getAppList = async (): Promise<IDifyAppItem[]> => {
	const repo = await getRepo()
	return repo.getAppList()
}

/**
 * 根据 ID 获取应用详情
 */
export const getAppItem = async (id: string): Promise<IDifyAppItem | null> => {
	const repo = await getRepo()
	return repo.getAppItem(id)
}

/**
 * 新增应用配置
 */
export const addApp = async (app: Omit<IDifyAppItem, 'id'>): Promise<IDifyAppItem> => {
	const repo = await getRepo()
	return repo.addApp(app)
}

/**
 * 更新应用
 */
export const updateApp = async (app: IDifyAppItem): Promise<IDifyAppItem> => {
	const repo = await getRepo()
	return repo.updateApp(app)
}

/**
 * 删除应用
 */
export const deleteApp = async (id: string): Promise<void> => {
	const repo = await getRepo()
	return repo.deleteApp(id)
}
