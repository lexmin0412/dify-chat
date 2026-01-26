import { existsSync } from 'node:fs'
import type { PrismaConfig } from 'prisma'

// 判断 .env 存在时才从 .env 中加载环境变量
if (existsSync('.env')) {
	const process = await import('node:process')
	process.loadEnvFile()
}

export default {
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	// 这里必须单独定义，用于 Prisma CLI 命令执行
	datasource: {
		url: process.env.DATABASE_URL,
	},
} satisfies PrismaConfig
