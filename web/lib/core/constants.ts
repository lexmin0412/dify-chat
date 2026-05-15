// web/lib/core/constants.ts
// 合并自原 src/constants/index.ts + src/constants/app.ts

/**
 * 消息角色
 */
export type IMessageRole = 'local' | 'user' | 'ai'

/**
 * 聊天中的角色
 */
export const Roles = {
	USER: 'user',
	AI: 'ai',
	LOCAL: 'local',
} as const

/**
 * 应用类型
 */
export enum AppModeEnums {
	TEXT_GENERATOR = 'completion',
	CHATBOT = 'chat',
	WORKFLOW = 'workflow',
	CHATFLOW = 'advanced-chat',
	AGENT = 'agent-chat',
}

export const AppModeLabels = {
	[AppModeEnums.TEXT_GENERATOR]: 'Text Generator',
	[AppModeEnums.CHATBOT]: 'Chatbot',
	[AppModeEnums.WORKFLOW]: 'Workflow',
	[AppModeEnums.CHATFLOW]: 'Chatflow',
	[AppModeEnums.AGENT]: 'Agent',
}

export const AppModeNames = {
	[AppModeEnums.TEXT_GENERATOR]: '文本生成',
	[AppModeEnums.CHATBOT]: '聊天助手',
	[AppModeEnums.WORKFLOW]: '工作流',
	[AppModeEnums.CHATFLOW]: '支持工作流编排的聊天助手',
	[AppModeEnums.AGENT]: '具备推理和自主调用能力的聊天助手',
}

const getAppModelFullName = (mode: AppModeEnums) => {
	return `${AppModeLabels[mode]}（${AppModeNames[mode]}）`
}

export const AppModeOptions = [
	AppModeEnums.CHATBOT,
	AppModeEnums.WORKFLOW,
	AppModeEnums.CHATFLOW,
	AppModeEnums.AGENT,
	AppModeEnums.TEXT_GENERATOR,
].map(mode => {
	return {
		label: getAppModelFullName(mode),
		value: mode,
	}
})

export const OpeningStatementDisplayMode = {
	Default: 'default',
	Always: 'always',
}

export const OpeningStatementDisplayModeOptions = [
	{ label: '默认（开始对话前展示）', value: OpeningStatementDisplayMode.Default },
	{ label: '总是展示', value: OpeningStatementDisplayMode.Always },
]

export const DEFAULT_APP_SITE_SETTING = {
	title: '',
	chat_color_theme: '',
	chat_color_theme_inverted: false,
	icon_type: 'emoji' as const,
	icon: '🤖',
	icon_background: '#1C64F2',
	icon_url: '',
	description: '',
	copyright: '',
	privacy_policy: '',
	custom_disclaimer: '',
	default_language: 'zh-CN',
	show_workflow_steps: false,
	use_icon_as_answer_icon: false,
}
