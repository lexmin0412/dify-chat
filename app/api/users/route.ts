import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const db = getDb()
		const session = await getServerSession(authOptions)
		if (!session) return NextResponse.json({ message: '未授权' }, { status: 401 })
		const allUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.orderBy(desc(users.createdAt))
		return NextResponse.json(allUsers)
	} catch (error) {
		console.error('获取用户列表失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const db = getDb()
		const session = await getServerSession(authOptions)
		if (!session) return NextResponse.json({ message: '未授权' }, { status: 401 })
		const { name, email, password } = await request.json()
		if (!name || !email || !password)
			return NextResponse.json({ message: '姓名、邮箱和密码都是必填项' }, { status: 400 })
		const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
		if (rows[0]) return NextResponse.json({ message: '该邮箱已被使用' }, { status: 400 })
		const hashedPassword = await bcrypt.hash(password, 12)
		await db.insert(users).values({ name, email, password: hashedPassword })
		const newRows = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
		return NextResponse.json(newRows[0], { status: 201 })
	} catch (error) {
		console.error('创建用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
