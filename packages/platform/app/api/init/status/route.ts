import { NextResponse } from 'next/server'

import { getRepository } from '@/lib/typeorm'
import { User } from '@/entities/User'

export async function GET() {
	try {
		const userRepo = await getRepository(User)
		const count = await userRepo.count()
		return NextResponse.json({ initialized: count > 0 })
	} catch (error) {
		return NextResponse.json(
			{
				initialized: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
