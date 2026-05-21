'use server'

import { eq, desc } from 'drizzle-orm'
import { getDb } from '@/db'
import { difyApps } from '@/db/schema'
import { generateUuidV4 } from '@/lib/helpers'
import { appItemToDbApp, appItemToDbAppUpdate, dbAppToAppItem } from '@/lib/db/types'
import { IDifyAppItem } from '@/types'

export const getAppList = async (): Promise<IDifyAppItem[]> => {
	try {
		const db = getDb()
		const rows = await db.select().from(difyApps).orderBy(desc(difyApps.createdAt))
		return rows.map(dbAppToAppItem)
	} catch (error) {
		console.error('Error fetching app list:', error)
		throw new Error('Failed to fetch app list')
	}
}

export const getAppItem = async (id: string): Promise<IDifyAppItem | null> => {
	try {
		const db = getDb()
		const rows = await db.select().from(difyApps).where(eq(difyApps.id, id)).limit(1)
		const row = rows[0]
		return row ? dbAppToAppItem(row) : null
	} catch (error) {
		console.error('Error fetching app item:', error)
		throw new Error('Failed to fetch app item')
	}
}

export const addApp = async (app: Omit<IDifyAppItem, 'id'>): Promise<IDifyAppItem> => {
	try {
		const db = getDb()
		const newId = generateUuidV4()
		const dbAppData = appItemToDbApp(app)
		await db.insert(difyApps).values({ ...dbAppData, id: newId })
		const rows = await db.select().from(difyApps).where(eq(difyApps.id, newId)).limit(1)
		return dbAppToAppItem(rows[0])
	} catch (error) {
		console.error('Error adding app:', error)
		throw new Error('Failed to add app')
	}
}

export const updateApp = async (app: IDifyAppItem): Promise<IDifyAppItem> => {
	try {
		const db = getDb()
		const dbAppData = appItemToDbAppUpdate(app)
		await db.update(difyApps).set(dbAppData).where(eq(difyApps.id, app.id))
		const rows = await db.select().from(difyApps).where(eq(difyApps.id, app.id)).limit(1)
		return dbAppToAppItem(rows[0])
	} catch (error) {
		console.error('Error updating app:', error)
		throw new Error('Failed to update app')
	}
}

export const deleteApp = async (id: string): Promise<void> => {
	try {
		const db = getDb()
		await db.delete(difyApps).where(eq(difyApps.id, id))
	} catch (error) {
		console.error('Error deleting app:', error)
		throw new Error('Failed to delete app')
	}
}
