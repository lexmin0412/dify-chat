import { AppModeEnums } from '@/lib/core'
import { FormInstance } from 'antd'

/**
 * 校验表单, 如果校验未通过则生成错误信息
 */
export const validateAndGenErrMsgs = (
	form: FormInstance<Record<string, unknown>>,
): Promise<{ isSuccess: boolean; errMsgs: string }> => {
	return new Promise((resolve, _reject) => {
		form
			.validateFields()
			.then(() => {
				resolve({
					isSuccess: true,
					errMsgs: '',
				})
			})
			.catch(error => {
				console.error('表单校验失败', error)
				const errMsgs = (
					error as {
						errorFields: {
							errors: string[]
						}[]
					}
				).errorFields
					.map(item => {
						return item.errors?.join(',') || ''
					})
					.filter(Boolean)
					.join(',')
				resolve({
					isSuccess: false,
					errMsgs,
				})
			})
	})
}

/**
 * 填充文件的完整 URL，返回全路径
 * @param url 原始 URL
 * @param apiBase 应用的 API Base
 * @returns 完整的文件 URL
 */
export const completeFileUrl = (url: string, apiBase: string) => {
	let result = url
	if (!url) {
		return ''
	}
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		const apiDomain = apiBase.slice(0, apiBase.lastIndexOf('/v1'))
		result = `${apiDomain}${url}`
	}
	return result
}

/**
 * 判断应用是否是 Chat 模式的应用，包括 Chatbot、Chatflow、Agent
 * @param appMode 应用模式
 */
export const isChatLikeApp = (appMode: AppModeEnums) => {
	return [AppModeEnums.CHATBOT, AppModeEnums.CHATFLOW, AppModeEnums.AGENT].includes(appMode)
}

/**
 * 判断应用是否是 Workflow 模式的应用，包括 Workflow、Text Generator
 * @param appMode 应用模式
 */
export const isWorkflowLikeApp = (appMode: AppModeEnums) => {
	return [AppModeEnums.WORKFLOW, AppModeEnums.TEXT_GENERATOR].includes(appMode)
}
