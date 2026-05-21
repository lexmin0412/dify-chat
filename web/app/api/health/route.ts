import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const db = getDb()
		await db.execute(sql`SELECT 1`)
		return NextResponse.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: 'connected',
		})
	} catch (error) {
		return NextResponse.json(
			{
				status: 'error',
				timestamp: new Date().toISOString(),
				database: 'disconnected',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
