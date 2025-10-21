import 'reflect-metadata'
import path from 'node:path'
import { DataSource } from 'typeorm'
import type { DataSourceOptions } from 'typeorm'
import { User } from '@/entities/User'
import { DifyApp } from '@/entities/DifyApp'

// 数据库类型枚举
export const DatabaseType = {
	SQLITE: 'sqlite',
	POSTGRES: 'postgres',
	MYSQL: 'mysql',
} as const

// 获取数据库类型
function getDatabaseType(): (typeof DatabaseType)[keyof typeof DatabaseType] {
	const dbUrl = (process.env.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '')

	if (dbUrl.startsWith('file:') || dbUrl.includes('sqlite')) {
		return DatabaseType.SQLITE
	}
	if (dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:')) {
		return DatabaseType.POSTGRES
	}
	if (dbUrl.startsWith('mysql:')) {
		return DatabaseType.MYSQL
	}

	// 默认使用 SQLite
	return DatabaseType.SQLITE
}

// 根据数据库类型创建配置
function createDataSourceOptions(): DataSourceOptions {
	const dbType = getDatabaseType()
	const dbUrl = (process.env.DATABASE_URL || 'file:./data/dev.db')
		.trim()
		.replace(/^['"]|['"]$/g, '')
	const isRunMigrations = process.env.RUN_MIGRATIONS === 'true'

	const baseOptions = {
		entities: isRunMigrations ? [path.join(__dirname, '../entities/*.js')] : [User, DifyApp],
		synchronize: process.env.NODE_ENV === 'development',
		logging: process.env.NODE_ENV === 'development',
		migrations: isRunMigrations
			? [path.join(__dirname, '../migrations/*.js')]
			: ['migrations/*.ts'],
		migrationsTableName: 'typeorm_migrations',
	}

	switch (dbType) {
		case DatabaseType.SQLITE:
			return {
				...baseOptions,
				type: 'better-sqlite3',
				database: dbUrl.replace('file:', ''),
			} as DataSourceOptions

		case DatabaseType.POSTGRES:
			return {
				...baseOptions,
				type: 'postgres',
				url: dbUrl,
				ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
			} as DataSourceOptions

		case DatabaseType.MYSQL:
			return {
				...baseOptions,
				type: 'mysql',
				url: dbUrl,
			} as DataSourceOptions

		default:
			throw new Error(`Unsupported database type: ${dbType}`)
	}
}

// 为 TypeORM CLI 直接导出 DataSource 实例
const AppDataSource = new DataSource(createDataSourceOptions())
export default AppDataSource

// 创建数据源实例（延迟初始化）
let _appDataSource: DataSource | null = null

export function getAppDataSource(): DataSource {
	if (!_appDataSource) {
		_appDataSource = AppDataSource
	}
	return _appDataSource
}

// 初始化数据源
export async function initializeDataSource() {
	const dataSource = getAppDataSource()
	if (!dataSource.isInitialized) {
		await dataSource.initialize()
		console.log('✅ TypeORM DataSource initialized successfully')
	}
	return dataSource
}

// 关闭数据源连接
export async function closeDataSource() {
	const dataSource = getAppDataSource()
	if (dataSource.isInitialized) {
		await dataSource.destroy()
		console.log('✅ TypeORM DataSource closed successfully')
	}
}

// 获取当前数据库类型
export function getCurrentDatabaseType(): (typeof DatabaseType)[keyof typeof DatabaseType] {
	return getDatabaseType()
}

// 数据库连接状态检查
export async function checkDatabaseConnection(): Promise<boolean> {
	try {
		const dataSource = getAppDataSource()
		if (!dataSource.isInitialized) {
			await initializeDataSource()
		}
		await dataSource.query('SELECT 1')
		return true
	} catch (error) {
		console.error('Database connection failed:', error)
		return false
	}
}
