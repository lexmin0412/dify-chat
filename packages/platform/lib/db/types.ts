import { DifyApp } from '@/entities/DifyApp'
import { AppModeEnums, IDifyAppItem } from '@/types'

/**
 * 将数据库模型转换为应用类型
 */
export function dbAppToAppItem(dbApp: DifyApp): IDifyAppItem {
	return {
		id: dbApp.id,
		info: {
			name: dbApp.name,
			mode: dbApp.mode as AppModeEnums | undefined,
			description: dbApp.description || '',
			tags: dbApp.tags ? JSON.parse(dbApp.tags) : [],
		},
		isEnabled: (dbApp.isEnabled || 1) as 1 | 2,
		requestConfig: {
			apiBase: dbApp.apiBase,
			apiKey: dbApp.apiKey,
		},
		answerForm: dbApp.enableAnswerForm
			? {
					enabled: dbApp.enableAnswerForm,
					feedbackText: (dbApp.answerFormFeedbackText as string) || '',
				}
			: undefined,
		inputParams: {
			enableUpdateAfterCvstStarts: dbApp.enableUpdateInputAfterStarts,
		},
		extConfig: {
			conversation: {
				openingStatement: {
					displayMode: dbApp.openingStatementDisplayMode as 'default' | 'always' | undefined,
				},
			},
		},
	}
}

/**
 * 将应用类型转换为数据库模型数据
 */
export function appItemToDbApp(
	appItem: Omit<IDifyAppItem, 'id'>,
): Omit<DifyApp, 'id' | 'createdAt' | 'updatedAt'> {
	return {
		name: appItem.info.name,
		mode: appItem.info.mode || undefined,
		description: appItem.info.description || undefined,
		tags: appItem.info.tags.length > 0 ? JSON.stringify(appItem.info.tags) : undefined,
		isEnabled: appItem.isEnabled,
		apiBase: appItem.requestConfig.apiBase,
		apiKey: appItem.requestConfig.apiKey,
		enableAnswerForm: appItem.answerForm?.enabled || false,
		answerFormFeedbackText: appItem.answerForm?.feedbackText || undefined,
		enableUpdateInputAfterStarts: appItem.inputParams?.enableUpdateAfterCvstStarts || false,
		openingStatementDisplayMode:
			appItem.extConfig?.conversation?.openingStatement?.displayMode || undefined,
	}
}

/**
 * 将应用类型转换为数据库更新数据
 */
export function appItemToDbAppUpdate(
	appItem: IDifyAppItem,
): Omit<DifyApp, 'createdAt' | 'updatedAt'> {
	return {
		id: appItem.id,
		...appItemToDbApp(appItem),
	}
}
