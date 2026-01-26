import { loadEnvFile } from 'node:process'
import type { PrismaConfig } from 'prisma'

try {
	loadEnvFile()
} catch (error) {
	console.warn('加载 .env 文件失败，请确保你通过其他方式注入了环境变量', error)
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
