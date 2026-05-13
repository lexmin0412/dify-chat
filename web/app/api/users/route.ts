import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// 获取用户列表
export async function GET() {
	try {
		const prisma = getPrisma()
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return NextResponse.json(users)
	} catch (error) {
		console.error('获取用户列表失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}

// 创建新用户
export async function POST(request: NextRequest) {
	try {
		const prisma = getPrisma()
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { name, email, password } = await request.json()

		if (!name || !email || !password) {
			return NextResponse.json({ message: '姓名、邮箱和密码都是必填项' }, { status: 400 })
		}

		// 检查邮箱是否已存在
		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json({ message: '该邮箱已被使用' }, { status: 400 })
		}

		// 加密密码
		const hashedPassword = await bcrypt.hash(password, 12)

		// 创建用户
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		return NextResponse.json(user, { status: 201 })
	} catch (error) {
		console.error('创建用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
