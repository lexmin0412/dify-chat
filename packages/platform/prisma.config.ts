import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	// 这里必须单独定义，用于 Prisma CLI 命令执行
	datasource: {
		url: process.env.DATABASE_URL,
	},
})
