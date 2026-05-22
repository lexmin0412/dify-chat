import { migrate } from 'drizzle-orm/mysql2/migrator'
import { getDb } from '@/db'

const db = getDb()

await migrate(db, { migrationsFolder: './db/migrations' })

console.log('数据库迁移完成')
process.exit(0)
