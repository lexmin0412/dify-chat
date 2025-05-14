import { MoreOutlined } from '@ant-design/icons'
import { IDifyAppItem } from '@dify-chat/core'
import { Dropdown, message, Tag } from 'antd'

interface IAppListProps {
	/**
	 * 选中的应用 ID
	 */
	selectedId?: string
	/**
	 * 选中的应用 ID 变化时的回调
	 */
	onSelectedChange?: (selectedId: string, selectedAppInfo: IDifyAppItem) => void
	/**
	 * 应用列表
	 */
	list: IDifyAppItem[]
	/**
	 * 删除应用
	 */
	onDelete: (id: string) => Promise<unknown>
	/**
	 * 更新应用配置
	 */
	onUpdate?: (id: string, item: IDifyAppItem) => Promise<unknown>
}

/**
 * Dify 应用列表
 */
export default function AppList(props: IAppListProps) {
	const { selectedId, onSelectedChange, list, onDelete, onUpdate } = props

	return (
		<div>
			{list.map(item => {
				const isSelected = selectedId === item.id
				return (
					<div
						key={item.id}
						className={`p-3 bg-theme-bg mt-3 border border-solid border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:text-primary ${isSelected ? 'text-primary border-primary bg-gradient-to-r from-cyan-50 to-blue-50' : ''}`}
					>
						<div className="w-full flex items-center">
							<div
								className="flex-1 overflow-hidden flex items-center"
								onClick={() => {
									onSelectedChange?.(item.id, item)
								}}
							>
								<span className="font-semibold truncate">{item.info.name}</span>
								{item.info.tags
									? item.info.tags.map(tag => {
											return (
												<Tag
													key={tag}
													className="ml-2"
												>
													{tag}
												</Tag>
											)
										})
									: null}
							</div>
							<Dropdown
								trigger={['click']}
								menu={{
									items: [
										{
											key: 'update',
											label: '更新配置',
											onClick: async event => {
												event.domEvent.stopPropagation()
												await onUpdate?.(item.id, item)
												message.success('更新应用配置成功')
											},
										},
										{
											key: 'delete',
											label: '删除',
											danger: true,
											onClick: async event => {
												event.domEvent.stopPropagation()
												await onDelete(item.id)
												message.success('删除应用成功')
											},
										},
									],
								}}
							>
								<MoreOutlined className="hover:text-primary" />
							</Dropdown>
						</div>
						<div
							className="truncate text-sm mt-2 text-desc"
							onClick={() => {
								onSelectedChange?.(item.id, item)
							}}
						>
							{item.info.description}
						</div>
					</div>
				)
			})}
		</div>
	)
}
