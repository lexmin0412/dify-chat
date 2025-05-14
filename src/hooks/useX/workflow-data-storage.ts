// 定义获取和设置数据时 options 的统一类型
type IWorkflowDataOptions = {
	appId: string
	conversationId: string
	messageId: string
	key: string
}

// 定义设置数据时 options 的类型，继承自 IWorkflowDataOptions
type IWorkflowDataSetOptions = IWorkflowDataOptions & {
	value: unknown
}

/**
 * 工作流数据存储，以 应用=>对话=>消息 为维度存储数据
 */
class WorkflowDataStorage {
	/**
	 * 存储数据
	 */
	private data: Record<string, Record<string, Record<string, Record<string, unknown>>>> = {}

	/**
	 * 获取数据
	 * @param options 包含应用 ID、对话 ID、消息 ID 和数据键的对象
	 * @returns 数据
	 */
	get(options: IWorkflowDataOptions) {
		const { appId, conversationId, messageId, key } = options
		return this.data[appId]?.[conversationId]?.[messageId]?.[key]
	}

	/**
	 * 设置数据
	 * @param options 包含应用 ID、对话 ID、消息 ID、数据键和数据值的对象
	 */
	set(options: IWorkflowDataSetOptions) {
		const { appId, conversationId, messageId, key, value } = options
		if (!this.data[appId]) this.data[appId] = {}
		if (!this.data[appId][conversationId]) this.data[appId][conversationId] = {}
		if (!this.data[appId][conversationId][messageId])
			this.data[appId][conversationId][messageId] = {}
		this.data[appId][conversationId][messageId][key] = value
	}
}

export default new WorkflowDataStorage()
