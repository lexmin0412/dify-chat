import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { getPrisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
	try {
		const prisma = getPrisma()

		// 如果已经初始化（存在至少一个用户），则拒绝再次初始化
		const userCount = await prisma.user.count()
		if (userCount > 0) {
			return NextResponse.json({ message: '系统已初始化' }, { status: 409 })
		}

		const { email, password, name } = await request.json()

		if (!email || !password || !name) {
			return NextResponse.json({ message: '姓名、邮箱和密码都是必填项' }, { status: 400 })
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json({ message: '邮箱格式不正确' }, { status: 400 })
		}

		if (typeof password !== 'string' || password.length < 8) {
			return NextResponse.json({ message: '密码长度至少为 8 位' }, { status: 400 })
		}

		// 加密密码并创建管理员账户
		const hashedPassword = await bcrypt.hash(password, 12)
		const admin = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
			},
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
			},
		})

		return NextResponse.json({ message: '初始化成功', user: admin }, { status: 201 })
	} catch (error) {
		console.error('初始化管理员失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
