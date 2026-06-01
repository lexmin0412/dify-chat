import { getDb } from '@/db'
import { difyApps } from '@/db/schema'

const db = getDb()

async function main() {
	console.log('开始数据库种子数据初始化...')
	await db.insert(difyApps).values({
		name: '示例聊天助手',
		mode: 'chat',
		description: '这是一个示例的 Dify 聊天助手应用',
		tags: JSON.stringify(['示例', '聊天']),
		apiBase: 'https://api.dify.ai/v1',
		apiKey: 'app-xxxxxxxxxxxxxxxxx',
		enableAnswerForm: false,
		enableUpdateInputAfterStarts: false,
		openingStatementDisplayMode: 'default',
	})
	console.log('数据库种子数据初始化完成!')
}

main()
	.then(async () => {
		await db.$client.end()
	})
	.catch(async e => {
		console.error(e)
		await db.$client.end()
		process.exit(1)
	})
