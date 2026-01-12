import bcrypt from 'bcryptjs'
import * as readline from 'readline'

import { getPrisma } from '../lib/prisma'

const prisma = getPrisma()

// 创建 readline 接口
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

// 封装 readline 为 Promise
function question(prompt: string): Promise<string> {
	return new Promise(resolve => {
		rl.question(prompt, resolve)
	})
}

async function createAdmin() {
	console.log('=== 创建管理员账户 ===')

	// 获取用户输入
	const email = await question('请输入管理员邮箱: ')
	const password = await question('请输入管理员密码: ')
	const name = await question('请输入管理员姓名: ')

	// 验证输入
	if (!email || !password || !name) {
		console.log('邮箱、密码和姓名都不能为空')
		rl.close()
		return
	}

	// 验证邮箱格式
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		console.log('邮箱格式不正确')
		rl.close()
		return
	}

	// 检查管理员是否已存在
	const existingUser = await prisma.user.findUnique({
		where: { email },
	})

	if (existingUser) {
		console.log('管理员账户已存在')
		rl.close()
		return
	}

	// 加密密码
	const hashedPassword = await bcrypt.hash(password, 12)

	// 创建管理员账户
	const admin = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			name,
		},
	})

	console.log('\n管理员账户创建成功:')
	console.log(`邮箱: ${admin.email}`)
	console.log(`密码: ${password}`)
	console.log(`姓名: ${admin.name}`)

	rl.close()
}

createAdmin()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
