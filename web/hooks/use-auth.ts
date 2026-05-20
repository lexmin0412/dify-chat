import { LocalStorageKeys, LocalStorageStore } from '@/lib/helpers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuth = () => {
	const router = useRouter()
	const [userId, setUserId] = useState<string | null>(null)

	useEffect(() => {
		setUserId(LocalStorageStore.get(LocalStorageKeys.USER_ID))
	}, [])

	return {
		isAuthorized: !!userId,
		goAuthorize: () => router.push('/auth'),
		userId,
	}
}
