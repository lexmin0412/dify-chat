import { create } from 'zustand'

export interface ICurrentApp {
	config: import('./repository').IDifyAppItem
	parameters: import('./types').IDifyAppParameters
}

export interface IConversationItem {
	id: string
	name: string
	inputs: Record<string, unknown>
	introduction: string
	created_at: string
	updated_at: string
}

interface DifyChatState {
	currentApp: ICurrentApp | null
	appLoading: boolean
	currentConversationId: string
	conversations: IConversationItem[]
}

interface DifyChatActions {
	setCurrentApp: (app: ICurrentApp | null) => void
	setAppLoading: (loading: boolean) => void
	setCurrentConversationId: (id: string) => void
	setConversations: (list: IConversationItem[]) => void
}

type DifyChatStore = DifyChatState & DifyChatActions

export const useDifyChatStore = create<DifyChatStore>(set => ({
	currentApp: null,
	appLoading: false,
	currentConversationId: '',
	conversations: [],

	setCurrentApp: app => set({ currentApp: app, appLoading: false }),
	setAppLoading: loading => set({ appLoading: loading }),
	setCurrentConversationId: id => set({ currentConversationId: id }),
	setConversations: list => set({ conversations: list }),
}))
