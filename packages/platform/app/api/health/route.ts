import { NextResponse } from 'next/server'

import { checkDatabaseConnection } from '@/lib/typeorm.config'

export async function GET() {
	try {
		// 检查数据库连接
		const isConnected = await checkDatabaseConnection()

		if (!isConnected) {
			throw new Error('Database connection failed')
		}

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
