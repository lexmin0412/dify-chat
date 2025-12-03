import { DeleteOutlined, DownloadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons'
import { Conversations } from '@ant-design/x'
import { Form, Input, message, Modal } from 'antd'
import { ReactNode, useState } from 'react'

interface IConversationItem {
	key: string
	label?: ReactNode // 修改类型为 ReactNode 以匹配实际使用
}

interface IConversationListProps {
	/**
	 * 删除会话异步函数
	 */
	deleteConversationPromise: (conversationId: string) => Promise<unknown>
	/**
	 * 重命名会话异步函数
	 */
	renameConversationPromise: (conversationId: string, name: string) => Promise<unknown>
	/**
	 * 会话列表
	 */
	items: IConversationItem[]
	/**
	 * 当前激活的会话 ID
	 */
	activeKey?: string
	/**
	 * 会话切换回调
	 */
	onActiveChange?: (key: string) => void
}

/**
 * 会话列表
 */
export const ConversationList = (props: IConversationListProps) => {
	const { deleteConversationPromise, renameConversationPromise, items, activeKey, onActiveChange } =
		props

	const [renameForm] = Form.useForm()
	const [topItems, setTopItems] = useState<IConversationItem[]>([])

	/**
	 * 删除会话
	 * @param conversationId 会话 ID
	 */
	const deleteConversation = async (conversationId: string) => {
		await deleteConversationPromise(conversationId)
		message.success('删除成功')
	}

	/**
	 * 重命名会话
	 * @param conversation 会话对象
	 */
	const renameConversation = (conversation: IConversationItem) => {
		if (!conversation.label) {
			message.error('会话名称不能为空')
			return
		}
		renameForm.setFieldsValue({
			name: conversation.label as string, // 确保类型转换为 string
		})
		Modal.confirm({
			title: '编辑对话名称',
			content: (
				<Form
					form={renameForm}
					className="mt-3"
				>
					<Form.Item name="name">
						<Input placeholder="请输入" />
					</Form.Item>
				</Form>
			),
			onOk: async () => {
				await renameForm.validateFields()
				const values = await renameForm.validateFields()
				await renameConversationPromise(conversation.key, values.name)
				message.success('对话重命名成功')
			},
		})
	}

	/**
	 * 置顶会话
	 * @param conversation 会话对象
	 */
	const topConversation = (conversation: IConversationItem) => {
		if (!conversation.label) {
			message.error('会话名称不能为空')
			return
		}
		setTopItems(prev => [conversation, ...prev])
		message.success('置顶成功')
	}

	/**
	 * 取消置顶会话
	 * @param conversation 会话对象
	 */
	const untopConversation = (conversation: IConversationItem) => {
		setTopItems(prev => prev.filter(item => item.key !== conversation.key))
		message.success('取消置顶成功')
	}

	const handleMenuClick = (conversation: IConversationItem, menuKey: string) => {
		const validConversation: IConversationItem = {
			key: conversation.key,
			label: conversation.label || '未命名会话',
		}

		switch (menuKey) {
			case 'delete':
				deleteConversation(validConversation.key)
				break
			case 'rename':
				renameConversation(validConversation)
				break
			case 'top':
				topConversation(validConversation)
				break
			case 'untop':
				untopConversation(validConversation)
				break
			default:
				break
		}
	}

	/**
	 * 生成菜单配置
	 * @param isPinned 是否为置顶列表
	 */
	const generateMenuConfig = (isPinned: boolean) => {
		const commonMenuItems = [
			{
				label: '重命名',
				key: 'rename',
				icon: <EditOutlined />,
			},
			{
				label: '删除',
				key: 'delete',
				icon: <DeleteOutlined />,
				danger: true,
			},
		]

		// 第一项菜单（置顶或取消置顶）
		const pinMenuItem = isPinned
			? {
					label: '取消置顶',
					key: 'untop',
					icon: <DownloadOutlined />,
				}
			: {
					label: '置顶',
					key: 'top',
					icon: <UploadOutlined />,
				}

		return (conversation: IConversationItem) => ({
			items: [pinMenuItem, ...commonMenuItems],
			onClick: async (menuInfo: { domEvent: React.MouseEvent; key: string }) => {
				menuInfo.domEvent.stopPropagation()
				const validConversation: IConversationItem = {
					key: conversation.key,
					label: conversation.label || '未命名会话',
				}
				handleMenuClick(validConversation, menuInfo.key)
			},
		})
	}

	return (
		<div>
			{/* 置顶列表 */}
			<div
				style={{
					marginBottom: '10px',
					borderBottom: topItems.length > 0 ? '1px solid #f0f0f0' : 'none',
					paddingBottom: '10px',
					display: topItems.length > 0 ? 'block' : 'none',
				}}
			>
				<Conversations
					className="!p-0"
					items={topItems}
					activeKey={activeKey}
					onActiveChange={onActiveChange}
					menu={generateMenuConfig(true)}
				/>
			</div>

			{/* 普通会话列表 */}
			<Conversations
				className="!p-0"
				items={items.filter(item => !topItems.some(topItem => topItem.key === item.key))}
				activeKey={activeKey}
				onActiveChange={onActiveChange}
				menu={generateMenuConfig(false)}
			/>
		</div>
	)
}
