import { create } from 'zustand'

import { DifyApi } from '@/utils/dify-api'

export interface IGlobalStore {
	globalParams: Record<string, string>
	setGlobalParams: (params: Record<string, string>) => void

	difyApi: DifyApi | null
	setDifyApi: (api: DifyApi | null) => void
}

export const useGlobalStore = create<IGlobalStore>(set => ({
	globalParams: {},
	setGlobalParams: (params: Record<string, string>) =>
		set(state => ({
			globalParams: { ...state.globalParams, ...params },
		})),

	difyApi: null,
	setDifyApi: (api: DifyApi | null) => set(() => ({ difyApi: api })),
}))
