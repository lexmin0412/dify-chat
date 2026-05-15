import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 定义获取和设置数据时 options 的统一类型
export type IWorkflowDataOptions = {
	appId: string
	conversationId: string
	messageId: string
	key: string
}

// 定义设置数据时 options 的类型，继承自 IWorkflowDataOptions
export type IWorkflowDataSetOptions = IWorkflowDataOptions & {
	value: unknown
}

interface WorkflowStore {
	data: Record<string, unknown>
	setData: (id: string, value: unknown) => void
	getData: (id: string) => unknown
	getAllData: () => { id: string; value: unknown }[]
}

const useWorkflowStore = create<WorkflowStore>()(
	persist(
		(set, get) => ({
			data: {},
			setData: (id, value) => {
				set(state => ({
					data: {
						...state.data,
						[id]: value,
					},
				}))
			},
			getData: id => {
				return get().data[id]
			},
			getAllData: () => {
				const data = get().data
				return Object.entries(data).map(([id, value]) => ({ id, value }))
			},
		}),
		{
			name: 'workflow-data-storage',
		},
	),
)

/**
 * 工作流数据存储，结合 zustand 状态管理和持久化
 * 优点：
 * 1. 内存读取，响应极快，适合流式输出的高频读写
 * 2. 自动持久化，刷新页面后依然可以获取
 * 3. 简化异步处理
 */
class WorkflowDataStorage {
	/**
	 * 生成存储键
	 */
	private generateId(options: IWorkflowDataOptions): string {
		const { appId, conversationId, messageId, key } = options
		return `${appId}_${conversationId}_${messageId}_${key}`
	}

	/**
	 * 获取数据
	 * @param options 包含应用 ID、对话 ID、消息 ID 和数据键的对象
	 * @returns 数据
	 */
	async get(options: IWorkflowDataOptions): Promise<unknown> {
		const id = this.generateId(options)
		return useWorkflowStore.getState().getData(id)
	}

	/**
	 * 设置数据
	 * @param options 包含应用 ID、对话 ID、消息 ID、数据键和数据值的对象
	 */
	async set(options: IWorkflowDataSetOptions): Promise<void> {
		const { value } = options
		const id = this.generateId(options)
		useWorkflowStore.getState().setData(id, value)
	}

	/**
	 * 获取所有缓存的数据
	 * @returns 包含所有缓存数据的数组
	 */
	async listAll(): Promise<{ id: string; value: unknown }[]> {
		return useWorkflowStore.getState().getAllData()
	}
}

export default new WorkflowDataStorage()
