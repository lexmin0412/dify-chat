import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'mysql',
	schema: './db/schema/index.ts',
	out: './db/migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
