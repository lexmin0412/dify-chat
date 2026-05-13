import { getPrisma } from '@/lib/prisma'

const prisma = getPrisma()

async function main() {
	console.log('开始数据库种子数据初始化...')

	// 示例应用配置
	const sampleApp = await prisma.difyApp.create({
		data: {
			name: '示例聊天助手',
			mode: 'chat',
			description: '这是一个示例的 Dify 聊天助手应用',
			tags: JSON.stringify(['示例', '聊天']),
			apiBase: 'https://api.dify.ai/v1',
			apiKey: 'app-xxxxxxxxxxxxxxxxx',
			enableAnswerForm: false,
			enableUpdateInputAfterStarts: false,
			openingStatementDisplayMode: 'default',
		},
	})

	console.log('创建示例应用:', sampleApp)
	console.log('数据库种子数据初始化完成!')
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
