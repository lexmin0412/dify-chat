import { AppModeOptions, OpeningStatementDisplayModeOptions } from '@dify-chat/core'
import { Form, FormInstance, Input, Select } from 'antd'

import { IDifyAppItem } from '@/types'

import { AppDetailDrawerModeEnum } from '../enums'

interface ISettingFormProps {
	formInstance: FormInstance<Record<string, unknown>>
	mode: AppDetailDrawerModeEnum
	appItem: IDifyAppItem
}

export default function SettingForm(props: ISettingFormProps) {
	const { formInstance, mode, appItem } = props

	const enableAnswerForm = Form.useWatch('enableAnswerForm', formInstance)

	return (
		<Form
			autoComplete="off"
			form={formInstance}
			labelAlign="left"
			labelCol={{
				span: 5,
			}}
			initialValues={{
				enableAnswerForm: false,
				enableUpdateInputAfterStarts: false,
				openingStatementDisplayMode: 'default',
				isEnabled: 1,
				enableAnnotation: false,
			}}
		>
			<div className="mb-3 flex items-center text-base">
				<div className="h-4 w-1 rounded bg-[#1669ee]"></div>
				<div className="ml-2 font-semibold">请求配置</div>
			</div>

			<Form.Item
				label="API Base"
				name="apiBase"
				rules={[{ required: true, message: 'API Base 不能为空' }]}
				tooltip="Dify API 的域名+版本号前缀，如 https://api.dify.ai/v1"
				required
			>
				<Input
					autoComplete="new-password"
					placeholder="请输入 API BASE"
				/>
			</Form.Item>

			<Form.Item
				label="API Secret"
				name="apiKey"
				tooltip="Dify App 的 API Secret (以 app- 开头)"
				rules={[{ required: true, message: 'API Secret 不能为空' }]}
				required
			>
				<Input.Password
					autoComplete="new-password"
					placeholder="请输入 API Secret"
				/>
			</Form.Item>

			<div className="mb-3 flex items-center text-base">
				<div className="h-4 w-1 rounded bg-[#1669ee]"></div>
				<div className="ml-2 font-semibold">基本信息</div>
			</div>
			<Form.Item
				name="info.name"
				label="应用名称"
				hidden={mode === AppDetailDrawerModeEnum.create}
			>
				<Input
					disabled
					placeholder="请输入应用名称"
				/>
			</Form.Item>
			<Form.Item
				name="info.mode"
				label="应用类型"
				tooltip="小于或等于 v1.3.1 的 Dify API 不会返回应用类型字段，需要用户自行选择"
				required
				rules={[{ required: true, message: '应用类型不能为空' }]}
			>
				<Select
					// TODO 等 Dify 支持返回 mode 字段后，这里可以做一个判断，大于支持返回 mode 的版本就禁用，直接取接口值
					// disabled
					placeholder="请选择应用类型"
					options={AppModeOptions}
				/>
			</Form.Item>
			<Form.Item
				name="info.description"
				label="应用描述"
				hidden={mode === AppDetailDrawerModeEnum.create}
			>
				<Input
					disabled
					placeholder="请输入应用描述"
				/>
			</Form.Item>
			<Form.Item
				name="info.tags"
				label="应用标签"
				hidden={mode === AppDetailDrawerModeEnum.create}
			>
				{appItem?.info.tags?.length ? (
					<div className="text-theme-text">{appItem.info.tags.join(', ')}</div>
				) : (
					<>无</>
				)}
			</Form.Item>
			<Form.Item
				name="isEnabled"
				label="应用状态"
				tooltip="设置应用的启用状态"
				rules={[{ required: true, message: '应用状态不能为空' }]}
				required
			>
				<Select
					placeholder="请选择应用状态"
					options={[
						{
							label: '启用',
							value: 1,
						},
						{
							label: '禁用',
							value: 2,
						},
					]}
				/>
			</Form.Item>

			<div className="mb-3 flex items-center text-base">
				<div className="h-4 w-1 rounded bg-[#1669ee]"></div>
				<div className="ml-2 font-semibold">对话配置</div>
			</div>

			<Form.Item
				label="更新历史参数"
				name="enableUpdateInputAfterStarts"
				tooltip="是否允许更新历史对话的输入参数"
				rules={[{ required: true }]}
				required
			>
				<Select
					placeholder="请选择"
					options={[
						{
							label: '启用',
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
				label="开场白展示场景"
				name="openingStatementDisplayMode"
				tooltip="配置开场白的展示逻辑"
				rules={[{ required: true }]}
				required
			>
				<Select
					placeholder="请选择"
					options={OpeningStatementDisplayModeOptions}
				/>
			</Form.Item>

			<div className="mb-3 flex items-center text-base">
				<div className="h-4 w-1 rounded bg-[#1669ee]"></div>
				<div className="ml-2 font-semibold">更多配置</div>
			</div>

			<Form.Item
				label="允许标注"
				name="enableAnnotation"
				tooltip="是否允许在对话中进行标注"
				rules={[{ required: true }]}
				required
			>
				<Select
					placeholder="请选择"
					options={[
						{
							label: '启用',
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
				label="表单回复"
				name="enableAnswerForm"
				tooltip="当工作流需要回复表单给用户填写时，建议开启此功能"
				rules={[{ required: true }]}
				required
			>
				<Select
					placeholder="请选择"
					options={[
						{
							label: '启用',
							value: true,
						},
						{
							label: '禁用',
							value: false,
						},
					]}
				/>
			</Form.Item>
			{enableAnswerForm ? (
				<Form.Item
					label="提交消息文本"
					name="answerForm.feedbackText"
					tooltip="当启用表单回复时，用户填写表单并提交后，默认会以用户角色将填写的表单数据作为消息文本发送，如果配置了此字段，将会固定展示配置的字段值"
				>
					<Input placeholder="请输入提交消息文本" />
				</Form.Item>
			) : null}
		</Form>
	)
}
