import { LocalStorageKeys, LocalStorageStore } from '@/lib/helpers'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
	const router = useRouter()
	const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)

	return {
		isAuthorized: !!userId,
		goAuthorize: () => router.push('/auth'),
		userId,
	}
}
