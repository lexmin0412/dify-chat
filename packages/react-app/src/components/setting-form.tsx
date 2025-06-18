import { AppModeOptions, IDifyAppItem, OpeningStatementDisplayModeOptions } from '@dify-chat/core'
import { Form, FormInstance, Input, Select } from 'antd'

import { AppDetailDrawerModeEnum } from '@/enums'

interface ISettingFormProps {
	formInstance: FormInstance<Record<string, unknown>>
	mode: AppDetailDrawerModeEnum
	appItem: IDifyAppItem
}

export default function SettingForm(props: ISettingFormProps) {
	const { formInstance, mode, appItem } = props

	const answerFormEnabled = Form.useWatch('answerForm.enabled', formInstance)

	return (
		<Form
			autoComplete="off"
			form={formInstance}
			labelAlign="left"
			labelCol={{
				span: 5,
			}}
			initialValues={{
				'answerForm.enabled': false,
				'inputParams.enableUpdateAfterCvstStarts': false,
				'extConfig.conversation.openingStatement.displayMode': 'default',
			}}
		>
			<div className="text-base mb-3 flex items-center">
				<div className="h-4 w-1 bg-primary rounded"></div>
                                <div className="ml-2 font-semibold">請求配置</div>
			</div>
			<Form.Item
				label="API Base"
				name="apiBase"
                                rules={[{ required: true, message: 'API Base 不能為空' }]}
				tooltip="Dify API 的域名+版本号前缀，如 https://api.dify.ai/v1"
				required
			>
				<Input
					autoComplete="new-password"
                                        placeholder="請輸入 API BASE"
				/>
			</Form.Item>
			<Form.Item
				label="API Secret"
				name="apiKey"
                                tooltip="Dify App 的 API Secret (以 app- 開頭)"
                                rules={[{ required: true, message: 'API Secret 不能為空' }]}
				required
			>
				<Input.Password
					autoComplete="new-password"
                                        placeholder="請輸入 API Secret"
				/>
			</Form.Item>

			<div className="text-base mb-3 flex items-center">
				<div className="h-4 w-1 bg-primary rounded"></div>
                                <div className="ml-2 font-semibold">基本資訊</div>
			</div>
			<Form.Item
				name="info.name"
                                label="應用名稱"
				hidden={mode === AppDetailDrawerModeEnum.create}
			>
				<Input
					disabled
                                        placeholder="請輸入應用名稱"
				/>
			</Form.Item>
			<Form.Item
				name="info.mode"
                                label="應用類型"
                                tooltip="小於或等於 v1.3.1 的 Dify API 不會返回應用類型字段，需要用戶自行選擇"
				required
                                rules={[{ required: true, message: '應用類型不能為空' }]}
			>
				<Select
					// TODO 等 Dify 支持返回 mode 字段后，这里可以做一个判断，大于支持返回 mode 的版本就禁用，直接取接口值
					// disabled
                                        placeholder="請選擇應用類型"
					options={AppModeOptions}
				/>
			</Form.Item>
			<Form.Item
				name="info.description"
                                label="應用描述"
				hidden={mode === AppDetailDrawerModeEnum.create}
			>
				<Input
					disabled
                                        placeholder="請輸入應用描述"
				/>
			</Form.Item>
			<Form.Item
				name="info.tags"
                                label="應用標籤"
				hidden={mode === AppDetailDrawerModeEnum.create}
			>
				{appItem?.info.tags?.length ? (
					<div className="text-theme-text">{appItem.info.tags.join(', ')}</div>
				) : (
                                        <>無</>
				)}
			</Form.Item>

			<div className="text-base mb-3 flex items-center">
				<div className="h-4 w-1 bg-primary rounded"></div>
                                <div className="ml-2 font-semibold">對話配置</div>
			</div>

			<Form.Item
                                label="更新歷史參數"
				name="inputParams.enableUpdateAfterCvstStarts"
                                tooltip="是否允許更新歷史對話的輸入參數"
				rules={[{ required: true }]}
				required
			>
				<Select
                                        placeholder="請選擇"
					options={[
						{
                                                        label: '啟用',
							value: true,
						},
						{
                                                        label: '禁用',
							value: false,
						},
					]}
				/>
			</Form.Item>

			<Form.Item
                                label="開場白展示場景"
				name="extConfig.conversation.openingStatement.displayMode"
                                tooltip="配置開場白的展示邏輯"
				rules={[{ required: true }]}
				required
			>
				<Select
                                        placeholder="請選擇"
					options={OpeningStatementDisplayModeOptions}
				/>
			</Form.Item>

			<div className="text-base mb-3 flex items-center">
				<div className="h-4 w-1 bg-primary rounded"></div>
				<div className="ml-2 font-semibold">更多配置</div>
			</div>

			<Form.Item
                                label="表單回覆"
				name="answerForm.enabled"
                                tooltip="當工作流需要回覆表單給用戶填寫時，建議開啟此功能"
				rules={[{ required: true }]}
				required
			>
				<Select
                                        placeholder="請選擇"
					options={[
						{
                                                        label: '啟用',
							value: true,
						},
						{
                                                        label: '禁用',
							value: false,
						},
					]}
				/>
			</Form.Item>
			{answerFormEnabled ? (
				<Form.Item
                                        label="提交訊息文本"
					name="answerForm.feedbackText"
                                        tooltip="當啟用表單回覆時，用戶填寫表單並提交後，預設會以用戶角色將填寫的表單數據作為訊息文本發送，如果配置了此字段，將會固定展示配置的字段值"
				>
                                        <Input placeholder="請輸入提交訊息文本" />
				</Form.Item>
			) : null}
		</Form>
	)
}
