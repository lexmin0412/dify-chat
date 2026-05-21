import { drizzle } from 'drizzle-orm/mysql2'
import { isNextBuild } from '@/lib/is-next-build'
import * as schema from './schema'

const createThrowingProxy = () =>
	new Proxy(() => undefined, {
		get(_target, prop) {
			if (prop === 'then') return undefined
			return createThrowingProxy()
		},
		apply() {
			throw new Error('DATABASE_URL 环境变量缺失, 请检查')
		},
	})

const createDb = () => {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		throw new Error('DATABASE_URL 环境变量缺失, 请检查')
	}

	return drizzle(databaseUrl, { schema, logger: true })
}

const globalForDb = globalThis as unknown as {
	db: ReturnType<typeof createDb> | undefined
}

let dbInstance: ReturnType<typeof createDb> | undefined

export const getDb = () => {
	if (!process.env.DATABASE_URL && isNextBuild()) {
		if (!dbInstance) dbInstance = createThrowingProxy() as ReturnType<typeof createDb>
		return dbInstance
	}

	if (process.env.NODE_ENV !== 'production') {
		if (!globalForDb.db) globalForDb.db = createDb()
		return globalForDb.db
	}

	if (!dbInstance) dbInstance = createDb()
	return dbInstance
}
