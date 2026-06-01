import { NextResponse } from 'next/server'
import { count } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const db = getDb()
		const result = await db.select({ count: count() }).from(users)
		return NextResponse.json({ initialized: (result[0]?.count ?? 0) > 0 })
	} catch (error) {
		console.error('Error checking init status:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
