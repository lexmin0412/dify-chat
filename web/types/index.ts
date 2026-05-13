export interface IDifyAppRequestConfig {
	/**
	 * 请求地址
	 */
	apiBase: string
	/**
	 * Dify APP API 密钥
	 */
	apiKey: string
}

/**
 * 应用类型
 */
export enum AppModeEnums {
	/**
	 * 文本生成
	 */
	TEXT_GENERATOR = 'completion',
	/**
	 * 聊天助手
	 */
	CHATBOT = 'chat',
	/**
	 * 工作流
	 */
	WORKFLOW = 'workflow',
	/**
	 * 支持工作流编排的聊天助手
	 */
	CHATFLOW = 'advanced-chat',
	/**
	 * 具备推理和自主调用能力的聊天助手
	 */
	AGENT = 'agent-chat',
}

export interface IDifyAppItem4View {
	/**
	 * 唯一标识
	 */
	id: string
	/**
	 * Dify 应用基本信息
	 */
	info: {
		/**
		 * 应用名称
		 */
		name: string
		/**
		 * 应用类型
		 */
		mode?: AppModeEnums
		/**
		 * 应用描述
		 */
		description: string
		/**
		 * 应用标签
		 */
		tags: string[]
	}
	/**
	 * 应用状态 1-启用 2-禁用
	 */
	isEnabled: 1 | 2
}

/**
 * 应用配置 Item
 */
export interface IDifyAppItem extends IDifyAppItem4View {
	/**
	 * 请求配置
	 */
	requestConfig: IDifyAppRequestConfig
	/**
	 * 回复表单配置
	 */
	answerForm?: {
		/**
		 * 是否启用
		 */
		enabled: boolean
		/**
		 * 反馈的占位文字
		 */
		feedbackText?: string
	}
	/**
	 * 输入参数配置
	 */
	inputParams?: {
		/**
		 * 开始对话后，是否支持更新对话参数
		 */
		enableUpdateAfterCvstStarts: boolean
	}
	/**
	 * 其他扩展配置
	 */
	extConfig?: {
		/**
		 * 对话相关配置
		 */
		conversation?: {
			/**
			 * 开场白配置
			 */
			openingStatement?: {
				/**
				 * 展示模式 default-默认（对话开始后不展示） always-固定展示
				 */
				displayMode?: 'default' | 'always'
			}
		}
		/**
		 * 标注相关配置
		 */
		annotation?: {
			/**
			 * 是否启用
			 */
			enabled: boolean
		}
	}
}
