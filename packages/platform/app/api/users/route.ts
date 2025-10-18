import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { getRepository } from '@/lib/typeorm'
import { User } from '@/entities/User'

// 获取用户列表
export async function GET() {
	try {
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const userRepo = await getRepository(User)
		const users = await userRepo.find({
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
			order: {
				createdAt: 'DESC',
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
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { name, email, password } = await request.json()

		if (!name || !email || !password) {
			return NextResponse.json({ message: '姓名、邮箱和密码都是必填项' }, { status: 400 })
		}

		const userRepo = await getRepository(User)

		// 检查邮箱是否已存在
		const existingUser = await userRepo.findOne({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json({ message: '该邮箱已被使用' }, { status: 400 })
		}

		// 加密密码
		const hashedPassword = await bcrypt.hash(password, 12)

		// 创建用户
		const user = await userRepo.save({
			name,
			email,
			password: hashedPassword,
		})

		// 返回用户信息（不包含密码）
		const { password: _password, ...userWithoutPassword } = user

		return NextResponse.json(userWithoutPassword, { status: 201 })
	} catch (error) {
		console.error('创建用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
