import { AppModeEnums, IDifyAppItem } from '@dify-chat/core'

/**
 * 静态的应用列表，用于演示
 * 注意：**尽量不要在公开的生产环境中使用静态数据**，推荐使用后端服务
 */
export const staticAppList: IDifyAppItem[] = [
	{
		id: '0.270357011315995',
		info: {
			name: '论文降重助手',
			description:
				'专业的论文降重助手，帮助用户降低论文重复率，提高论文原创性。支持多种降重策略和程度选择。',
			tags: [],
			mode: AppModeEnums.CHATFLOW,
		},
		requestConfig: {
			apiBase: 'https://api.dify.ai/v1',
			apiKey: 'app-Cdj8xSLPhXOQaGdQemq1b6GD',
		},
		//回复表单配置
		answerForm: {
			enabled: false,
			feedbackText: '请输入您的反馈意见',
		},
		/**
		 * 输入参数配置
		 */
		inputParams: {
			enableUpdateAfterCvstStarts: true,
		},
		/**
		 * 其他扩展配置
		 */
		extConfig: {
			/**
			 * 对话相关配置
			 */
			conversation: {
				/**
				 * 开场白配置
				 */
				openingStatement: {
					/**
					 * 展示模式 default-默认（对话开始后不展示） always-固定展示
					 */
					displayMode: 'default',
				},
			},
		},
	},
]
