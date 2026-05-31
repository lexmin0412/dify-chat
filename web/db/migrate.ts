import { migrate } from 'drizzle-orm/mysql2/migrator'
import { drizzle } from 'drizzle-orm/mysql2'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	console.error('DATABASE_URL 环境变量缺失, 请检查')
	process.exit(1)
}

const db = drizzle(databaseUrl)

await migrate(db, { migrationsFolder: './db/migrations' })

console.log('数据库迁移完成')
process.exit(0)
