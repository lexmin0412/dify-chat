/**
 * 应用类型
 */
export enum AppModeEnums {
	/**
	 * 文本生成
	 */
	TextGeneration = 'completion',
	/**
	 * 聊天助手
	 */
	CHAT = 'chat',
	/**
	 * 工作流
	 */
	WORKFLOW = 'workflow',
	/**
	 * 支持工作流编排的聊天助手
	 */
	ADVANCED_CHAT = 'advanced-chat',
	/**
	 * 具备推理和自主调用能力的聊天助手
	 */
	AGENT_CHAT = 'agent-chat',
}

/**
 * 应用类型选项
 */
export const AppModeOptions = [
	{
		label: '聊天助手',
		value: AppModeEnums.CHAT,
	},
	{
		label: '工作流',
		value: AppModeEnums.WORKFLOW,
	},
	{
		label: '支持工作流编排的聊天助手',
		value: AppModeEnums.ADVANCED_CHAT,
	},
	{
		label: '具备推理和自主调用能力的聊天助手',
		value: AppModeEnums.AGENT_CHAT,
	},
	{
		label: '文本生成',
		value: AppModeEnums.TextGeneration,
	},
]
