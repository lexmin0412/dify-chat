import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

import { PrismaClient } from '@/prisma/generated/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

const parseMySqlOptionsFromConnectionString = (connectionString: string) => {
	const url = new URL(connectionString)
	return {
		host: url.hostname,
		port: parseInt(url.port),
		user: url.username,
		password: url.password,
	}
}
const mysqlOptions = parseMySqlOptionsFromConnectionString(connectionString as string)

const adapter = new PrismaMariaDb({
	host: mysqlOptions.host,
	port: mysqlOptions.port,
	user: mysqlOptions.user,
	password: mysqlOptions.password,
	connectTimeout: 10000,
})

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
	})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
