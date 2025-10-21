import 'reflect-metadata'
import path from 'node:path'
import dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import type { DataSourceOptions } from 'typeorm'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
console.log('TypeORM CLI DATABASE_URL =', process.env.DATABASE_URL)

export const DatabaseType = {
	SQLITE: 'sqlite',
	POSTGRES: 'postgres',
	MYSQL: 'mysql',
} as const

function getDatabaseType(): (typeof DatabaseType)[keyof typeof DatabaseType] {
	const dbUrl = (process.env.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '')
	if (dbUrl.startsWith('file:') || dbUrl.includes('sqlite')) return DatabaseType.SQLITE
	if (dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:')) return DatabaseType.POSTGRES
	if (dbUrl.startsWith('mysql:')) return DatabaseType.MYSQL
	return DatabaseType.SQLITE
}

function createCliDataSourceOptions(): DataSourceOptions {
	const dbType = getDatabaseType()
	const dbUrl = (process.env.DATABASE_URL || 'file:./data/dev.db')
		.trim()
		.replace(/^['"]|['"]$/g, '')
	console.log('TypeORM CLI DB type =', dbType, 'url =', dbUrl)

	const baseOptions = {
		entities: [path.join(__dirname, '../entities/*.js')],
		migrations: [path.join(__dirname, '../migrations/*.js')],
		migrationsTableName: 'typeorm_migrations',
		synchronize: false,
		logging: process.env.NODE_ENV === 'development',
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

const CliDataSource = new DataSource(createCliDataSourceOptions())
export default CliDataSource
