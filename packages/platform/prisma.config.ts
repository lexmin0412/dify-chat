import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

let databaseURL = ''

// env 函数在环境变量不存在时，会直接抛出错误，这里需要 catch 一下，以防止在构建过程中的 prisma generate 步骤出现问题
try {
	databaseURL = env('DATABASE_URL')
} catch (error) {
	console.error('Error loading DATABASE_URL from environment variables:', error)
}

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	// 这里必须单独定义，用于 Prisma CLI 命令执行
	datasource: {
		url: databaseURL,
	},
})
