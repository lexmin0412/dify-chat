import { create } from 'zustand'

export interface ICurrentApp {
	config: import('./repository').IDifyAppItem
	parameters: import('./types').IDifyAppParameters
	site?: import('./types').IDifyAppSiteSetting
}

export interface IConversationItem {
	id: string
	name: string
	inputs: Record<string, unknown>
	introduction: string
	created_at: number
	updated_at: number
}

export interface DifyChatState {
	currentAppId: string
	currentApp: ICurrentApp | null
	appLoading: boolean
	currentConversationId: string
	conversations: IConversationItem[]
	globalParams: Record<string, string>
	difyApi: any
}

export interface DifyChatActions {
	setCurrentAppId: (id: string) => void
	setCurrentApp: (app: ICurrentApp | null) => void
	setAppLoading: (loading: boolean) => void
	setCurrentConversationId: (id: string) => void
	setConversations: (list: IConversationItem[]) => void
	setGlobalParams: (params: Record<string, string>) => void
	setDifyApi: (api: any) => void
}

type DifyChatStore = DifyChatState & DifyChatActions

export const useDifyChatStore = create<DifyChatStore>(set => ({
	currentAppId: '',
	currentApp: null,
	appLoading: false,
	currentConversationId: '',
	conversations: [],
	globalParams: {},
	difyApi: null,

	setCurrentAppId: id => set({ currentAppId: id }),
	setCurrentApp: app => set({ currentApp: app, appLoading: false }),
	setAppLoading: loading => set({ appLoading: loading }),
	setCurrentConversationId: id => set({ currentConversationId: id }),
	setConversations: list => set({ conversations: list }),
	setGlobalParams: params => set(state => ({ globalParams: { ...state.globalParams, ...params } })),
	setDifyApi: api => set({ difyApi: api }),
}))
