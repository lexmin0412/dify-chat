'use server'

import { appItemToDbApp, appItemToDbAppUpdate, dbAppToAppItem } from '@/lib/db/types'
import { getRepository } from '@/lib/typeorm'
import { DifyApp } from '@/entities/DifyApp'
import { IDifyAppItem } from '@/types'

/**
 * 获取应用列表数据
 */
export const getAppList = async (): Promise<IDifyAppItem[]> => {
	try {
		const appRepository = await getRepository(DifyApp)
		const dbApps = await appRepository.find({
			order: {
				createdAt: 'DESC',
			},
		})
		return dbApps.map(dbApp => dbAppToAppItem(dbApp as DifyApp))
	} catch (error) {
		console.error('Error fetching app list:', error)
		throw new Error('Failed to fetch app list')
	}
}

/**
 * 根据 ID 获取应用详情
 */
export const getAppItem = async (id: string): Promise<IDifyAppItem | null> => {
	try {
		const appRepository = await getRepository(DifyApp)
		const dbApp = await appRepository.findOne({
			where: { id },
		})
		return dbApp ? dbAppToAppItem(dbApp as DifyApp) : null
	} catch (error) {
		console.error('Error fetching app item:', error)
		throw new Error('Failed to fetch app item')
	}
}

/**
 * 新增应用配置
 */
export const addApp = async (app: Omit<IDifyAppItem, 'id'>): Promise<IDifyAppItem> => {
	try {
		const appRepository = await getRepository(DifyApp)
		const dbAppData = appItemToDbApp(app)
		const dbApp = await appRepository.save(dbAppData)
		return dbAppToAppItem(dbApp as DifyApp)
	} catch (error) {
		console.error('Error adding app:', error)
		throw new Error('Failed to add app')
	}
}

/**
 * 更新应用
 */
export const updateApp = async (app: IDifyAppItem): Promise<IDifyAppItem> => {
	try {
		const appRepository = await getRepository(DifyApp)
		const dbAppData = appItemToDbAppUpdate(app)
		const { id, ...updateData } = dbAppData
		await appRepository.update({ id }, updateData)
		const updatedApp = await appRepository.findOne({ where: { id } })
		if (!updatedApp) {
			throw new Error('App not found after update')
		}
		return dbAppToAppItem(updatedApp as DifyApp)
	} catch (error) {
		console.error('Error updating app:', error)
		throw new Error('Failed to update app')
	}
}

/**
 * 删除应用
 */
export const deleteApp = async (id: string): Promise<void> => {
	try {
		const appRepository = await getRepository(DifyApp)
		await appRepository.delete({ id })
	} catch (error) {
		console.error('Error deleting app:', error)
		throw new Error('Failed to delete app')
	}
}
