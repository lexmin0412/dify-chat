import { useHistory } from 'pure-react-router'

/**
 * 重定向到首页
 */
export const useRedirect2Index = () => {
	const history = useHistory()

	return () => {
		// history.push('/workspace/workspace-1')
		history.push('/app-markets')
	}
}
