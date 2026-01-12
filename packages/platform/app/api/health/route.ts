import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		// 检查数据库连接
		await prisma.$queryRaw`SELECT 1`

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
