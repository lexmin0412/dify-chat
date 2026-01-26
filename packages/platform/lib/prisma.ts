import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@/prisma/generated/client'
import { isNextBuild } from './is-next-build'

const createThrowingProxy = (): PrismaClient =>
	new Proxy(() => undefined, {
		get(_target, prop) {
			if (prop === 'then') return undefined
			return createThrowingProxy()
		},
		apply() {
			throw new Error('DATABASE_URL 环境变量缺失, 请检查')
		},
	}) as unknown as PrismaClient

const createPrismaClient = () => {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		throw new Error('DATABASE_URL 环境变量缺失, 请检查')
	}

	let dbUrl: URL
	try {
		dbUrl = new URL(databaseUrl)
	} catch {
		throw new Error('DATABASE_URL 环境变量格式错误, 请检查')
	}

	if (!dbUrl.hostname || !dbUrl.username || !dbUrl.password || !dbUrl.pathname) {
		throw new Error('DATABASE_URL 环境变量格式错误, 请检查')
	}

	const adapter = new PrismaMariaDb({
		host: dbUrl.hostname,
		port: Number(dbUrl.port),
		user: dbUrl.username,
		password: dbUrl.password,
		database: dbUrl.pathname.slice(1),
	})

	return new PrismaClient({
		adapter,
		log: ['query'],
	})
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | undefined

export const getPrisma = () => {
	if (!process.env.DATABASE_URL && isNextBuild()) {
		if (!prismaInstance) prismaInstance = createThrowingProxy()
		return prismaInstance
	}

	if (process.env.NODE_ENV !== 'production') {
		if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrismaClient()
		return globalForPrisma.prisma
	}

	if (!prismaInstance) prismaInstance = createPrismaClient()
	return prismaInstance
}
