import { AppModeEnums } from '../../constants'

/**
 * 应用配置 Item
 */
export interface IDifyAppItem {
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
	 * 请求配置
	 */
	requestConfig: {
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
	}
}

/**
 * 抽象类，定义 Dify APP 的 CRUD 接口
 */
export abstract class DifyAppStore {
	/**
	 * 获取 App 列表
	 */
	abstract getApps(): Promise<IDifyAppItem[]>
	/**
	 * 通过 id 获取 App 详情
	 */
	abstract getApp(id: string): Promise<IDifyAppItem | undefined>
	/**
	 * 新增 App
	 */
	abstract addApp(app: IDifyAppItem): Promise<void>
	/**
	 * 更新 App
	 */
	abstract updateApp(app: IDifyAppItem): Promise<void>
	/**
	 * 删除 App
	 */
	abstract deleteApp(id: string): Promise<void>
}
