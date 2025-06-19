import { DifyApi } from '@dify-chat/api'
import { AppModeEnums, DifyAppStore, IDifyAppItem } from '@dify-chat/core'
import { useRequest } from 'ahooks'
import { Button, Drawer, DrawerProps, Form, message, Space } from 'antd'
import { useEffect, useState } from 'react'

import { AppDetailDrawerModeEnum } from '@/enums'
import { useAuth } from '@/hooks/use-auth'

import SettingForm from './setting-form'

interface IAppEditDrawerProps extends DrawerProps {
	detailDrawerMode: AppDetailDrawerModeEnum
	confirmLoading?: boolean
	appItem?: IDifyAppItem
	onClose?: () => void
	confirmCallback?: () => void
	addApi: DifyAppStore['addApp']
	updateApi: DifyAppStore['updateApp']
}

/**
 * 应用配置编辑抽屉
 */
export const AppEditDrawer = (props: IAppEditDrawerProps) => {
	const { detailDrawerMode, appItem, open, onClose, confirmCallback, addApi, updateApi } = props
	const [settingForm] = Form.useForm()
	const [confirmLoading, setConfirmBtnLoading] = useState(false)
	const { userId } = useAuth()

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
				'answerForm.enabled': appItem?.answerForm?.enabled || false,
				'answerForm.feedbackText': appItem?.answerForm?.feedbackText || '',
				'inputParams.enableUpdateAfterCvstStarts':
					appItem?.inputParams?.enableUpdateAfterCvstStarts || false,
				'extConfig.conversation.openingStatement.displayMode':
					appItem?.extConfig?.conversation?.openingStatement?.displayMode || 'default',
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
                                message.success('新增應用配置成功')
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
                                message.success('編輯應用配置成功')
			},
		},
	)

	return (
		<Drawer
			width={700}
                        title={`${detailDrawerMode === AppDetailDrawerModeEnum.create ? '新增應用配置' : `編輯應用配置 - ${appItem?.info.name}`}`}
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
									user: userId,
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
									requestConfig: {
										apiBase: values.apiBase,
										apiKey: values.apiKey,
									},
									answerForm: {
										enabled: values['answerForm.enabled'],
										feedbackText: values['answerForm.feedbackText'],
									},
									inputParams: {
										enableUpdateAfterCvstStarts: values['inputParams.enableUpdateAfterCvstStarts'],
									},
									extConfig: {
										conversation: {
											openingStatement: {
												displayMode: values['extConfig.conversation.openingStatement.displayMode'],
											},
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
										id: Math.random().toString(),
										...commonInfo,
									})
								}
								confirmCallback?.()
							} catch (error) {
                                                                console.error('保存應用配置失敗', error)
                                                                message.error(`保存應用配置失敗: ${error}`)
							} finally {
								setConfirmBtnLoading(false)
							}
						}}
					>
                                                {detailDrawerMode === AppDetailDrawerModeEnum.create ? '確定' : '更新'}
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
