import { IUserInputFormItemType, IUserInputFormItemValueBase } from '@dify-chat/api'
import { AppModeEnums, useAppContext } from '@dify-chat/core'
import { useConversationsContext } from '@dify-chat/core'
import { isTempId, unParseGzipString } from '@dify-chat/helpers'
import {
	Form,
	FormInstance,
	FormItemProps,
	GetProp,
	Input,
	InputNumber,
	message,
	Select,
	Upload,
} from 'antd'
import { useHistory, useSearchParams } from 'pure-react-router'
import { useEffect, useRef, useState } from 'react'

import { useGlobalStore } from '@/store'
import { isChatLikeApp } from '@/utils'

import FileUpload from './form-controls/file-upload'
import { IDifyConversationInputFile } from './types'

export type IConversationEntryFormItem = FormItemProps &
	Pick<IUserInputFormItemValueBase, 'options' | 'max_length' | 'allowed_file_types'> & {
		type: IUserInputFormItemType
	}

const SUPPORTED_CONTROL_TYPES = ['text-input', 'select', 'number', 'paragraph', 'file', 'file-list']

export interface IAppInputFormProps {
	/**
	 * 表单是否禁用
	 */
	disabled?: boolean
	/**
	 * 表单是否填写
	 */
	formFilled: boolean
	/**
	 * 表单填写状态改变回调
	 */
	onStartConversation: (formValues: Record<string, unknown>) => void
	/**
	 * 应用入参的表单实例
	 */
	// FIXME: any 类型后续优化 @ts-expect-error
	entryForm: FormInstance<Record<string, unknown>>
}

type IUploadFileItem = GetProp<typeof Upload, 'fileList'>[0]

type IFileItem = IUploadFileItem | IDifyConversationInputFile

/**
 * 把 Dify 对话列表返回的参数值转换为对应控件需要的格式
 * @param type 参数类型
 * @param value 原始参数值
 */
function normalizeFieldValue(type: IUserInputFormItemType, value: unknown): unknown {
	const transferFileItem = (file: IFileItem) => ({
		...file,
		name: (file as IUploadFileItem).name || (file as IDifyConversationInputFile).filename,
		url: (file as IUploadFileItem).url || (file as IDifyConversationInputFile).remote_url,
		status: (file as IUploadFileItem).status || 'done',
		upload_file_id:
			(file as IUploadFileItem).upload_file_id || (file as IDifyConversationInputFile).related_id,
	})
	if (type === 'file-list' && Array.isArray(value)) {
		const result = (value as IFileItem[]).map(file => transferFileItem(file))
		return result
	}
	if (type === 'file' && value) {
		const f = value as IDifyConversationInputFile
		return transferFileItem(f) as IDifyConversationInputFile
	}

	return value
}

/**
 * 应用输入表单
 */
export default function AppInputForm(props: IAppInputFormProps) {
	const { entryForm, disabled } = props
	const { currentApp } = useAppContext()
	const { currentConversationId, currentConversationInfo, setConversations } =
		useConversationsContext()
	const history = useHistory()
	const searchParams = useSearchParams()
	const {
		location: { pathname },
	} = useHistory()
	const [userInputItems, setUserInputItems] = useState<IConversationEntryFormItem[]>([])
	const cachedSearchParams = useRef<URLSearchParams>(new URLSearchParams(searchParams))
	const store = useGlobalStore()

	useEffect(() => {
		const user_input_form = currentApp?.parameters.user_input_form
		if (!user_input_form?.length) {
			setUserInputItems([])
			return
		}
		setUserInputItems(
			user_input_form?.map(item => {
				const fieldType = Object.keys(item)[0]
				const fieldInfo = Object.values(item)[0]
				const originalProps = fieldInfo
				const baseProps: IConversationEntryFormItem = {
					type: fieldType as IUserInputFormItemType,
					label: originalProps.label,
					name: originalProps.variable,
					options: originalProps.options,
					max_length: originalProps.max_length,
					allowed_file_types: originalProps.allowed_file_types,
					hidden: originalProps.hide,
				}
				const searchValue = cachedSearchParams.current.get(originalProps.variable)
				const cachedValue = store.globalParams[originalProps.variable]
				const currentConversationInputs = currentConversationInfo?.inputs || {}
				// 如果 URL 或者缓存中存在该参数，则使用它
				if (searchValue || cachedValue) {
					const { error, data } = unParseGzipString(searchValue || cachedValue)

					if (error) {
						message.error(`解压缩参数 ${originalProps.variable} 失败: ${error}`)
					}

					// 解析正常且是新对话 或者允许更新对话参数，则写入 URL 参数
					if (
						(!error && isTempId(currentConversationId)) ||
						currentApp?.config?.inputParams?.enableUpdateAfterCvstStarts
					) {
						// 新对话或者允许更新对话参数, 则更新表单值
						entryForm.setFieldValue(originalProps.variable, data)
						cachedSearchParams.current.delete(originalProps.variable)
					} else {
						entryForm.setFieldValue(
							originalProps.variable,
							currentConversationInfo?.inputs?.[originalProps.variable],
						)
					}
				} else if (currentConversationInputs[originalProps.variable]) {
					// 对话参数中存在该参数，且不是临时对话，则使用对话参数
					const fieldValue = normalizeFieldValue(
						originalProps.type,
						currentConversationInputs[originalProps.variable],
					)
					entryForm.setFieldValue(originalProps.variable, fieldValue)
				} else {
					// 只有在非临时对话时才使用 currentConversationInfo 的 inputs
					// 临时对话的 inputs 通常是空的，不应该覆盖可能存在的默认值
					if (
						isChatLikeApp(currentApp?.config?.info?.mode as AppModeEnums) &&
						!isTempId(currentConversationId)
					) {
						const fieldValue = normalizeFieldValue(
							originalProps.type,
							currentConversationInfo?.inputs?.[originalProps.variable],
						)
						entryForm.setFieldValue(originalProps.variable, fieldValue)
					} else if (originalProps.default) {
						entryForm.setFieldValue(originalProps.variable, originalProps.default)
					} else {
						// 如果是临时对话且没有 URL 参数，则清空表单字段
						entryForm.setFieldValue(originalProps.variable, undefined)
					}
				}
				if (originalProps.required) {
					baseProps.required = true
					baseProps.rules = [{ required: true, message: '请输入' }]
				}
				return baseProps
			}) || [],
		)
		// 如果处理后的参数数量和之前的不一致，表示有表单相关，更新 URL
		if (searchParams.size !== cachedSearchParams.current.size) {
			if (cachedSearchParams.current.has('isNewCvst')) {
				cachedSearchParams.current.delete('isNewCvst')
			}
			const searchString = cachedSearchParams.current.size
				? `?${cachedSearchParams.current.toString()}`
				: ''
			history.push(`${pathname}${searchString}`)
		}
	}, [currentApp?.parameters.user_input_form, currentConversationInfo])

	return (
		<>
			{currentApp?.parameters.user_input_form?.length ? (
				<>
					<Form
						layout="vertical"
						form={entryForm}
						labelCol={{ span: 5 }}
						onValuesChange={(_changedValues, allValues) => {
							setConversations(prev => {
								return prev.map(item => {
									if (item.id === currentConversationId) {
										return {
											...item,
											inputs: allValues,
										}
									}
									return item
								})
							})
						}}
					>
						{userInputItems
							.filter(item => SUPPORTED_CONTROL_TYPES.includes(item.type))
							.map(item => {
								return (
									<Form.Item
										key={item.name}
										name={item.name}
										label={item.label}
										required={item.required}
										hidden={item.hidden}
										rules={
											item.required
												? [
														{
															required: true,
															message: `${item.label}不能为空`,
														},
													]
												: []
										}
									>
										{item.type === 'text-input' ? (
											<Input
												placeholder="请输入"
												maxLength={item.max_length}
												disabled={disabled}
											/>
										) : item.type === 'select' ? (
											<Select
												placeholder="请选择"
												disabled={disabled}
												options={
													item.options?.map(option => {
														return {
															value: option,
															label: option,
														}
													}) || []
												}
											/>
										) : item.type === 'paragraph' ? (
											<Input.TextArea
												placeholder="请输入"
												disabled={disabled}
												maxLength={item.max_length}
											/>
										) : item.type === 'number' ? (
											<InputNumber
												placeholder="请输入"
												disabled={disabled}
												className="w-full"
											/>
										) : item.type === 'file' ? (
											<FileUpload
												mode="single"
												disabled={disabled}
												allowed_file_types={item.allowed_file_types || []}
											/>
										) : item.type === 'file-list' ? (
											<FileUpload
												maxCount={item.max_length!}
												disabled={disabled}
												allowed_file_types={item.allowed_file_types || []}
											/>
										) : (
											`暂不支持的控件类型: ${item.type}`
										)}
									</Form.Item>
								)
							})}
					</Form>
				</>
			) : null}
		</>
	)
}
