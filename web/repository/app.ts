'use server'

import { IDifyAppItem } from '@/types'

import * as prismaRepo from './prisma/app'

/**
 * 获取应用列表数据
 */
export const getAppList = async (): Promise<IDifyAppItem[]> => {
	return prismaRepo.getAppList()
}

/**
 * 根据 ID 获取应用详情
 */
export const getAppItem = async (id: string): Promise<IDifyAppItem | null> => {
	return prismaRepo.getAppItem(id)
}

/**
 * 新增应用配置
 */
export const addApp = async (app: Omit<IDifyAppItem, 'id'>): Promise<IDifyAppItem> => {
	return prismaRepo.addApp(app)
}

/**
 * 更新应用
 */
export const updateApp = async (app: IDifyAppItem): Promise<IDifyAppItem> => {
	return prismaRepo.updateApp(app)
}

/**
 * 删除应用
 */
export const deleteApp = async (id: string): Promise<void> => {
	return prismaRepo.deleteApp(id)
}
