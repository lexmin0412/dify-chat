import type { IDifyAppItem as IDifyAppItemType } from '@/types'

export type IDifyAppItem = IDifyAppItemType

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
