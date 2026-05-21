import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const db = getDb()
		const session = await getServerSession(authOptions)
		if (!session) return NextResponse.json({ message: '未授权' }, { status: 401 })
		const { id } = await params
		const { name, email, password } = await request.json()
		if (!name || !email)
			return NextResponse.json({ message: '姓名和邮箱都是必填项' }, { status: 400 })
		const rows = await db.select().from(users).where(eq(users.id, id)).limit(1)
		if (!rows[0]) return NextResponse.json({ message: '用户不存在' }, { status: 404 })
		const emailRows = await db.select().from(users).where(eq(users.email, email)).limit(1)
		if (emailRows[0] && emailRows[0].id !== id)
			return NextResponse.json({ message: '该邮箱已被其他用户使用' }, { status: 400 })
		const updateData: Record<string, unknown> = { name, email }
		if (password && password.trim()) updateData.password = await bcrypt.hash(password, 12)
		await db.update(users).set(updateData).where(eq(users.id, id))
		const updated = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
		return NextResponse.json(updated[0])
	} catch (error) {
		console.error('更新用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const db = getDb()
		const session = (await getServerSession(authOptions)) as { user: { id: string } }
		if (!session) return NextResponse.json({ message: '未授权' }, { status: 401 })
		const { id } = await params
		if (session.user?.id === id)
			return NextResponse.json({ message: '不能删除自己的账户' }, { status: 400 })
		const rows = await db.select().from(users).where(eq(users.id, id)).limit(1)
		if (!rows[0]) return NextResponse.json({ message: '用户不存在' }, { status: 404 })
		await db.delete(users).where(eq(users.id, id))
		return NextResponse.json({ message: '删除成功' })
	} catch (error) {
		console.error('删除用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
