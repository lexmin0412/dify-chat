import React, { useContext } from 'react'

import { AppModeEnums } from '../constants'
import { EIsEnabled } from '../enums'
import { DifyAppStore, DifyAppStoreReadonly, IDifyAppItem } from '../repository'

export type IDifyChatMode = 'singleApp' | 'multiApp'

interface IDifyChatContextBase {
	/**
	 * 当前用户
	 */
	user: string
}

/**
 * 单应用模式下的上下文
 */
export interface IDifyChatContextSingleApp extends IDifyChatContextBase {
	/**
	 * 交互模式 - 单应用
	 */
	mode: 'singleApp'
	/**
	 * 当前应用配置
	 */
	appConfig: Omit<IDifyAppItem, 'id' | 'info'> & {
		/**
		 * 应用信息 可选，主要是为了兼容旧版本 dify(<=1.3.1) 的 /info 接口没有返回 mode 的情况
		 */
		info?: {
			/**
			 * 应用类型
			 */
			mode?: AppModeEnums
		}
	}
}

/**
 * 多应用模式下的上下文
 */
export interface IDifyChatContextMultiApp extends IDifyChatContextBase {
	/**
	 * 交互模式 - 多应用
	 */
	mode: 'multiApp'
	/**
	 * 应用服务，用于实现应用列表的 CRUD 管理
	 */
	appService: DifyAppStore | DifyAppStoreReadonly
}

/**
 * DifyChat 上下文类型
 */
type IDifyChatContext = IDifyChatContextSingleApp | IDifyChatContextMultiApp

const DEFAULT_CONTEXT_VALUE: IDifyChatContext = {
	mode: 'multiApp',
	user: '',
	// 修正为符合 DifyAppStore 类型的初始值，这里假设可以使用一个空对象作为初始值
	appService: {} as DifyAppStore,
}

/**
 * 单应用模式下的默认上下文
 */
const DEFAULT_CONTEXT_VALUE_SINGLE_APP: IDifyChatContextSingleApp = {
	mode: 'singleApp',
	user: '',
	appConfig: {
		requestConfig: {
			apiBase: '',
			apiKey: '',
		},
		isEnabled: EIsEnabled.enabled,
		answerForm: {
			enabled: false,
			feedbackText: '',
		},
	},
}

/**
 * DifyChat 全局上下文
 */
export const DifyChatContext = React.createContext<IDifyChatContext>(DEFAULT_CONTEXT_VALUE)

/**
 * DifyChatContext 的 Provider
 */
export const DifyChatProvider = DifyChatContext.Provider

/**
 * 使用 DifyChat 的 context 值
 */
export const useDifyChat = (): IDifyChatContext => {
	const difyChatContext = useContext(DifyChatContext)
	const { mode } = difyChatContext
	const defaultValue =
		mode === 'multiApp' ? DEFAULT_CONTEXT_VALUE : DEFAULT_CONTEXT_VALUE_SINGLE_APP
	return {
		...defaultValue,
		...difyChatContext,
	}
}
