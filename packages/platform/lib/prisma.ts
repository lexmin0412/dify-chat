import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

import { PrismaClient } from '@/prisma/generated/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL as string

const parseMysqlUrl = (urlStr: string) => {
	const url = new URL(urlStr)
	const database = url.pathname.replace(/^\//, '')
	const port = url.port ? parseInt(url.port, 10) : 3306
	return {
		host: url.hostname,
		port,
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		database,
	}
}

const mysqlOptions = parseMysqlUrl(connectionString)

const adapter = new PrismaMariaDb({
	host: mysqlOptions.host,
	port: mysqlOptions.port,
	user: mysqlOptions.user,
	password: mysqlOptions.password,
	database: mysqlOptions.database,
	connectTimeout: 10000,
})

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
	})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
