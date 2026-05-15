import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Conversations } from '@ant-design/x'
import { Form, Input, message, Modal } from 'antd'
import { useTranslation } from 'react-i18next'

interface IConversationItem {
	key: string
	label: string
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
	const { t } = useTranslation()
	const [renameForm] = Form.useForm()

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
		renameForm.setFieldsValue({
			name: conversation.label,
		})
		Modal.confirm({
			destroyOnClose: true,
			title: t('chat.rename'),
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

	return (
		<Conversations
			className="!p-0"
			items={items}
			activeKey={activeKey}
			onActiveChange={onActiveChange}
			menu={conversation => ({
				items: [
					{
						label: t('chat.rename'),
						key: 'rename',
						icon: <EditOutlined />,
					},
					{
						label: t('chat.delete'),
						key: 'delete',
						icon: <DeleteOutlined />,
						danger: true,
					},
				],
				onClick: async menuInfo => {
					// 阻止冒泡 防止点击更多按钮时触发 onActiveChange
					menuInfo.domEvent.stopPropagation()
					switch (menuInfo.key) {
						case 'delete':
							await deleteConversation(conversation.key)
							break
						case 'rename':
							renameConversation(conversation as IConversationItem)
							break
						default:
							break
					}
				},
			})}
		/>
	)
}
