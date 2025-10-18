import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { getRepository } from '@/lib/typeorm'
import { User } from '@/entities/User'

interface RouteParams {
	params: Promise<{
		id: string
	}>
}

// 更新用户
export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { id } = await params
		const { name, email, password } = await request.json()

		if (!name || !email) {
			return NextResponse.json({ message: '姓名和邮箱都是必填项' }, { status: 400 })
		}

		const userRepo = await getRepository(User)

		// 检查用户是否存在
		const existingUser = await userRepo.findOne({
			where: { id },
		})

		if (!existingUser) {
			return NextResponse.json({ message: '用户不存在' }, { status: 404 })
		}

		// 检查邮箱是否被其他用户使用
		const emailUser = await userRepo.findOne({
			where: { email },
		})

		if (emailUser && emailUser.id !== id) {
			return NextResponse.json({ message: '该邮箱已被其他用户使用' }, { status: 400 })
		}

		// 准备更新数据
		const updateData: Partial<User> = {
			name,
			email,
		}

		// 如果提供了密码，则更新密码
		if (password && password.trim()) {
			updateData.password = await bcrypt.hash(password, 12)
		}

		// 更新用户
		await userRepo.update(id, updateData)

		// 获取更新后的用户信息
		const updatedUser = await userRepo.findOne({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		return NextResponse.json(updatedUser)
	} catch (error) {
		console.error('更新用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}

// 删除用户
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const session = (await getServerSession(authOptions)) as { user: { id: string } }

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { id } = await params

		// 检查是否尝试删除自己
		if (session.user?.id === id) {
			return NextResponse.json({ message: '不能删除自己的账户' }, { status: 400 })
		}

		const userRepo = await getRepository(User)

		// 检查用户是否存在
		const existingUser = await userRepo.findOne({
			where: { id },
		})

		if (!existingUser) {
			return NextResponse.json({ message: '用户不存在' }, { status: 404 })
		}

		// 删除用户
		await userRepo.delete(id)

		return NextResponse.json({ message: '删除成功' })
	} catch (error) {
		console.error('删除用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
