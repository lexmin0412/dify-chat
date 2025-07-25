import { BaseRequest } from '@dify-chat/helpers'

import { IDifyAppItem } from '@/types'

const API_BASE_URL = 'http://localhost:3000'

const baseRequest = new BaseRequest({
	baseURL: API_BASE_URL,
})

export const getAppList = async (): Promise<IDifyAppItem[]> => {
	const response = await baseRequest.get(`/apps`)
	return response
}

export const getAppItem = async (id: string): Promise<IDifyAppItem | undefined> => {
	const response = await baseRequest.get(`/apps/${id}`)
	return response
}

export const addApp = async (app: IDifyAppItem): Promise<void> => {
	const response = await baseRequest.post(`/apps`, app as unknown as Record<string, unknown>)
	return response
}

export const updateApp = async (app: IDifyAppItem): Promise<void> => {
	const response = await baseRequest.put(
		`/apps/${app.id}`,
		app as unknown as Record<string, unknown>,
	)
	return response
}

export const deleteApp = async (id: string): Promise<unknown> => {
	await baseRequest.delete(`/apps/${id}`)
	return {}
}
