'use client'

import { Spin } from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === 'authenticated' && session) {
			router.replace('/app-management')
		} else if (status === 'unauthenticated') {
			router.replace('/apps')
		}
	}, [session, status, router])

	if (status === 'loading') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spin spinning />
			</div>
		)
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Spin spinning />
		</div>
	)
}
