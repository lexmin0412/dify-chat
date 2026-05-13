export * from './app'

/**
 * 消息角色
 */
export type IMessageRole = 'local' | 'user' | 'ai'

/**
 * 聊天中的角色
 */
export const Roles = {
	/**
	 * 用户
	 */
	USER: 'user',
	/**
	 * AI
	 */
	AI: 'ai',
	/**
	 * 本地，用户已发送但还未收到响应
	 */
	LOCAL: 'local',
} as const

/**
 * 运行模式
 */
export const RunningModes = {
	/**
	 * 单应用
	 */
	SingleApp: 'singleApp',
	/**
	 * 多应用
	 */
	MultiApp: 'multiApp',
} as const
