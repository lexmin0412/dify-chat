import { AppModeEnums } from '../../constants'
import { EIsEnabled } from '../../enums'

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
 * 参数配置 Item
 */
export interface IParamItem {
	variable: string
	required: boolean
	hide: boolean
}

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
	 * 应用状态 1-启用 2-禁用
	 */
	isEnabled: EIsEnabled
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

/**
 * 应用服务的公共方法定义
 */
abstract class DifyAppStoreBase {
	/**
	 * 是否只读
	 */
	abstract readonly?: boolean
	/**
	 * 获取 App 列表
	 */
	abstract getApps(): Promise<IDifyAppItem[]>
	/**
	 * 通过 id 获取 App 详情
	 */
	abstract getApp(id: string): Promise<IDifyAppItem | undefined>
}

/**
 * 只读的应用服务抽象类，只提供列表和详情接口
 * 只需实现 getApps 和 getApp 方法，其他方法不会被调用
 */
export abstract class DifyAppStoreReadonly extends DifyAppStoreBase {
	/**
	 * 声明只读
	 */
	abstract readonly: true
}

/**
 * 完整的应用服务抽象类，支持增删改查
 * 需实现 getApps、getApp、addApp、updateApp 和 deleteApp 方法
 */
export abstract class DifyAppStore extends DifyAppStoreBase {
	/**
	 * 声明可读写
	 */
	abstract readonly: false
	/**
	 * 新增 App
	 */
	abstract addApp(app: IDifyAppItem): Promise<unknown>
	/**
	 * 更新 App
	 */
	abstract updateApp(app: IDifyAppItem): Promise<unknown>
	/**
	 * 删除 App
	 */
	abstract deleteApp(id: string): Promise<unknown>
}
