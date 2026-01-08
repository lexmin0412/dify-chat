import { QuestionCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { IFile, IMessageItem4Render } from '@dify-chat/api'
import { AppModeEnums, Roles, useAppContext } from '@dify-chat/core'
import { Tooltip } from 'antd'
import { useMemo } from 'react'

import { useGlobalStore } from '@/store'

import { MarkdownRenderer } from '../../markdown-renderer'
import ThoughtChain from '../thought-chain'
import MessageFileList from './file-list'
import MessageReferrence from './referrence'
import WorkflowLogs from './workflow-logs'

interface IMessageContentProps {
	/**
	 * 提交消息时触发的回调函数
	 * @param nextContent 下一条消息的内容
	 * @param files 附件文件列表
	 */
	onSubmit: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
	/**
	 * 消息数据对象
	 */
	messageItem: IMessageItem4Render
}

/**
 * 消息内容展示组件
 */
export default function MessageContent(props: IMessageContentProps) {
	const {
		onSubmit,
		messageItem: {
			id,
			status,
			error,
			agentThoughts,
			workflows,
			files,
			content,
			retrieverResources,
			role,
		},
	} = props
	const { difyApi } = useGlobalStore()
	const { currentApp } = useAppContext()

	const computedContent = useMemo(() => {
		const likelyJSON = content.startsWith('{') && content.endsWith('}')
		// 处理回复表单的自动生成消息
		if (role === Roles.LOCAL || (role === Roles.USER && likelyJSON)) {
			if (currentApp?.config.answerForm?.enabled && currentApp.config.answerForm?.feedbackText) {
				// 尝试通过 json 解析
				try {
					const parsedValue = JSON.parse(content)
					return parsedValue.isFormSubmit ? currentApp.config.answerForm?.feedbackText : content
				} catch (error) {
					console.log('computedContent json 解析失败', error)
					return content
				}
			}
		}
		return content
	}, [content, currentApp?.config?.answerForm, role])

	// 如果是错误状态，则直接展示错误信息
	if (status === 'error') {
		return (
			<p className="text-red-700">
				<WarningOutlined className="mr-2" />
				<span>{error}</span>
			</p>
		)
	}

	// 如果状态正常且没有任何数据，则展示缺省
	if (
		status === 'success' &&
		!content &&
		!files?.length &&
		!agentThoughts?.length &&
		!workflows?.nodes?.length &&
		!retrieverResources?.length
	) {
		return (
			<p className="text-orange-600">
				<WarningOutlined className="mr-2" />
				<span>消息内容为空</span>
				<Tooltip title="可能是用户在生成内容的过程中点击了停止响应按钮">
					<QuestionCircleOutlined className="ml-2" />
				</Tooltip>
			</p>
		)
	}

	// 消息附件列表 用户文件展示在消息体上方，AI 消息文件展示在消息体下方
	const fileList = files?.length ? (
		<div className="mt-3">
			<MessageFileList
				previewApi={difyApi!.filePreview}
				files={files}
			/>
		</div>
	) : null

	return (
		<>
			{/* Agent 思维链信息 */}
			<ThoughtChain
				uniqueKey={id as string}
				items={agentThoughts}
			/>

			{/* 工作流执行日志 */}
			<WorkflowLogs
				items={workflows?.nodes || []}
				status={workflows?.status}
			/>

			{/* 消息附件列表 - 用户消息 */}
			{role === Roles.LOCAL || role === Roles.USER ? fileList : null}

			{/* 消息主体文本内容 */}
			{currentApp?.config?.info?.mode !== AppModeEnums.AGENT ||
			role === Roles.LOCAL ||
			role === Roles.USER ? (
				<div className={role === Roles.LOCAL || role === Roles.USER ? '' : 'md:min-w-chat-card'}>
					<MarkdownRenderer
						markdownText={computedContent}
						onSubmit={onSubmit}
					/>
				</div>
			) : null}

			{/* 消息附件列表 - AI 消息 */}
			{role === Roles.AI ? fileList : null}

			{/* 引用链接列表 */}
			<MessageReferrence items={retrieverResources} />
		</>
	)
}
