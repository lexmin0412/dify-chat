'use client'

import { DifyApi } from '@dify-chat/api'
import { AppModeEnums } from '@dify-chat/core'
import { generateUuidV4 } from '@dify-chat/helpers'
import { useRequest } from 'ahooks'
import { Button, Drawer, DrawerProps, Form, message, Space } from 'antd'
import { useEffect, useState } from 'react'

import { IDifyAppItem } from '@/types'

import { AppDetailDrawerModeEnum } from '../enums'
import SettingForm from './app-setting-form'

interface IAppEditDrawerProps extends DrawerProps {
	detailDrawerMode: AppDetailDrawerModeEnum
	confirmLoading?: boolean
	appItem?: IDifyAppItem
	onClose?: () => void
	confirmCallback?: () => void
	addApi: (appInfo: IDifyAppItem) => Promise<unknown>
	updateApi: (appInfo: IDifyAppItem) => Promise<unknown>
}

/**
 * 应用配置编辑抽屉
 */
export const AppEditDrawer = (props: IAppEditDrawerProps) => {
	const { detailDrawerMode, appItem, open, onClose, confirmCallback, addApi, updateApi } = props
	const [settingForm] = Form.useForm()
	const [confirmLoading, setConfirmBtnLoading] = useState(false)

	useEffect(() => {
		if (appItem?.info.mode) {
			settingForm.setFieldsValue({
				'info.mode': appItem?.info.mode,
			})
		}
	}, [appItem?.info.mode])

	useEffect(() => {
		if (!open) {
			settingForm.resetFields()
		} else if (detailDrawerMode === AppDetailDrawerModeEnum.edit) {
			settingForm.setFieldsValue({
				apiBase: appItem?.requestConfig.apiBase,
				apiKey: appItem?.requestConfig.apiKey,
				'info.name': appItem?.info.name,
				'info.description': appItem?.info.description,
				'info.mode': appItem?.info.mode || AppModeEnums.CHATBOT,
				isEnabled: appItem?.isEnabled,
				enableAnswerForm: appItem?.answerForm?.enabled || false,
				'answerForm.feedbackText': appItem?.answerForm?.feedbackText || '',
				enableUpdateInputAfterStarts: appItem?.inputParams?.enableUpdateAfterCvstStarts || false,
				openingStatementDisplayMode:
					appItem?.extConfig?.conversation?.openingStatement?.displayMode || 'default',
				enableAnnotation: appItem?.extConfig?.annotation?.enabled || false,
			})
		} else if (detailDrawerMode === AppDetailDrawerModeEnum.create) {
			settingForm.setFieldsValue({
				'info.mode': AppModeEnums.CHATBOT,
			})
		}
	}, [open])

	const { runAsync: createApp } = useRequest(
		async (appInfo: IDifyAppItem) => {
			return addApi(appInfo)
		},
		{
			manual: true,
			onSuccess: () => {
				onClose?.()
				message.success('新增应用配置成功')
			},
		},
	)

	const { runAsync: updateApp } = useRequest(
		async (appInfo: IDifyAppItem) => {
			return updateApi(appInfo)
		},
		{
			manual: true,
			onSuccess: () => {
				onClose?.()
				message.success('编辑应用配置成功')
			},
		},
	)

	return (
		<Drawer
			size={700}
			title={`${detailDrawerMode === AppDetailDrawerModeEnum.create ? '新增应用配置' : `编辑应用配置 - ${appItem?.info.name}`}`}
			open={open}
			onClose={onClose}
			extra={
				<Space>
					<Button onClick={onClose}>取消</Button>
					<Button
						type="primary"
						loading={confirmLoading}
						onClick={async () => {
							await settingForm.validateFields()

							setConfirmBtnLoading(true)
							try {
								const values = settingForm.getFieldsValue()
								const updatingItem = appItem

								// 获取 Dify 应用信息
								const newDifyApiInstance = new DifyApi({
									user: '',
									apiBase: values.apiBase,
									apiKey: values.apiKey,
								})
								const difyAppInfo = await newDifyApiInstance.getAppInfo()
								const commonInfo: Omit<IDifyAppItem, 'id'> = {
									info: {
										...difyAppInfo,
										// 兼容处理，当 Dify API 返回的应用信息中没有 mode 时，使用表单中的 mode
										mode: difyAppInfo.mode || values['info.mode'],
									},
									isEnabled: values['isEnabled'],
									requestConfig: {
										apiBase: values.apiBase,
										apiKey: values.apiKey,
									},
									answerForm: {
										enabled: values['enableAnswerForm'],
										feedbackText: values['answerForm.feedbackText'],
									},
									inputParams: {
										enableUpdateAfterCvstStarts: values['enableUpdateInputAfterStarts'],
									},
									extConfig: {
										conversation: {
											openingStatement: {
												displayMode: values['openingStatementDisplayMode'],
											},
										},
										annotation: {
											enabled: values['enableAnnotation'],
										},
									},
								}
								if (detailDrawerMode === AppDetailDrawerModeEnum.edit) {
									await updateApp({
										id: updatingItem!.id,
										...commonInfo,
									})
								} else {
									await createApp({
										id: generateUuidV4(),
										...commonInfo,
									})
								}
								confirmCallback?.()
							} catch (error) {
								console.error('保存应用配置失败', error)
								message.error(`保存应用配置失败: ${error}`)
							} finally {
								setConfirmBtnLoading(false)
							}
						}}
					>
						{detailDrawerMode === AppDetailDrawerModeEnum.create ? '确定' : '更新'}
					</Button>
				</Space>
			}
		>
			<SettingForm
				formInstance={settingForm}
				mode={detailDrawerMode}
				appItem={appItem!}
			/>
		</Drawer>
	)
}
