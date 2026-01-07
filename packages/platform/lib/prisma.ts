import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

import { PrismaClient } from '@/prisma/generated/client'

// 从环境变量的 DATABASE_URL 中解析出数据库连接配置
const dbUrl = new URL(process.env.DATABASE_URL || '')

if (!dbUrl.hostname || !dbUrl.username || !dbUrl.password) {
	throw new Error('DATABASE_URL 环境变量格式错误, 请检查')
}

const adapter = new PrismaMariaDb({
	host: dbUrl.hostname,
	port: Number(dbUrl.port),
	user: dbUrl.username,
	password: dbUrl.password,
	database: dbUrl.pathname.slice(1),
	connectionLimit: 5,
})

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ['query'],
	})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
