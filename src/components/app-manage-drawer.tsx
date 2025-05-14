import { DeleteOutlined } from '@ant-design/icons'
import { DifyAppStore, IDifyAppItem, IDifyChatContextMultiApp, useDifyChat } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import {
	Button,
	Col,
	Drawer,
	DrawerProps,
	Empty,
	Form,
	message,
	Popconfirm,
	Row,
	Space,
	Spin,
} from 'antd'
import { useState } from 'react'

import { AppEditDrawer } from './app-edit-drawer'

interface IAppManagerDrawerProps extends DrawerProps {
	/**
	 * 当前激活的应用 ID
	 */
	activeAppId?: string
	/**
	 * 应用列表
	 */
	appList: IDifyAppItem[]
	/**
	 * 获取应用列表
	 */
	getAppList: () => Promise<IDifyAppItem[]>
	/**
	 * 应用列表加载中
	 */
	appListLoading: boolean
	/**
	 * 删除应用成功回调
	 * @param id 删除的应用 ID
	 */
	onDeleteSuccess?: (id: string) => void
}

export enum AppDetailDrawerModeEnum {
	create = 'create',
	edit = 'edit',
}

export default function AppManageDrawer(props: IAppManagerDrawerProps) {
	const { activeAppId, getAppList, appListLoading, appList, onDeleteSuccess, ...drawerProps } =
		props
	const { appService } = useDifyChat() as IDifyChatContextMultiApp
	const [selectedAppId, setSelectedAppId] = useState<string>()
	const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
	const [settingForm] = Form.useForm()
	const [detailDrawerMode, setDetailDrawerMode] = useState<AppDetailDrawerModeEnum>()
	const isMobile = useIsMobile()
	const selectedAppItem = appList?.find(item => item.id === selectedAppId)

	return (
		<Drawer
			width={700}
			title="应用配置管理"
			{...drawerProps}
		>
			<div className="w-full h-full overflow-hidden flex flex-col">
				{/* 🌟 应用管理 */}
				<div className="pb-3 flex-1 overflow-y-auto">
					<Spin spinning={appListLoading}>
						<Row
							gutter={isMobile ? 0 : 16}
							className="w-full"
						>
							{appList?.length ? (
								appList?.map(item => {
									return (
										<Col
											span={isMobile ? 24 : 12}
											key={item.id}
										>
											<div
												className={`p-3 bg-theme-bg mb-3 border border-solid border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:text-primary`}
												onClick={() => {
													setSelectedAppId(item.id)
													settingForm.setFieldsValue({
														apiBase: item.requestConfig.apiBase,
														apiKey: item.requestConfig.apiKey,
														'answerForm.enabled': item.answerForm?.enabled || false,
														'answerForm.feedbackText': item.answerForm?.feedbackText || '',
														'inputParams.enableUpdateAfterCvstStarts':
															item.inputParams?.enableUpdateAfterCvstStarts || false,
														'extConfig.conversation.openingStatement.displayMode':
															item.extConfig?.conversation?.openingStatement?.displayMode ||
															'default',
													})
													setDetailDrawerMode(AppDetailDrawerModeEnum.edit)
													setDetailDrawerVisible(true)
												}}
											>
												<div className="w-full flex items-center overflow-hidden">
													<div className="flex-1 font-semibold truncate">
														{activeAppId === item.id && '【当前】'}
														{item.info.name}
													</div>
													<Space className="inline-flex items-center">
														<Popconfirm
															onPopupClick={e => e.stopPropagation()}
															cancelText="取消"
															okText="确定"
															title="确定删除应用吗？"
															onConfirm={async () => {
																await (appService as DifyAppStore).deleteApp(item.id)
																message.success('删除应用成功')
																getAppList()
																onDeleteSuccess?.(item.id)
															}}
														>
															<DeleteOutlined
																onClick={e => e.stopPropagation()}
																className="p-0 text-red-500"
															/>
														</Popconfirm>
													</Space>
												</div>
												<div
													title={item.info.description}
													className="truncate text-sm mt-2 text-desc h-6 leading-6"
												>
													{item.info.description}
												</div>
												<div
													className="mt-3 text-desc truncate"
													title={item.info.tags.join(', ')}
												>
													标签：
													{item.info.tags?.length ? item.info.tags.join(', ') : <>无</>}
												</div>
											</div>
										</Col>
									)
								})
							) : (
								<Empty
									className="mx-auto"
									description="暂无应用"
								/>
							)}
						</Row>
					</Spin>
				</div>
				<Button
					type="primary"
					size="large"
					block
					onClick={() => {
						setSelectedAppId('')
						setDetailDrawerMode(AppDetailDrawerModeEnum.create)
						settingForm.resetFields()
						setDetailDrawerVisible(true)
					}}
				>
					添加应用
				</Button>
			</div>

			<AppEditDrawer
				open={detailDrawerVisible}
				detailDrawerMode={detailDrawerMode!}
				onClose={() => setDetailDrawerVisible(false)}
				appItem={selectedAppItem}
			/>
		</Drawer>
	)
}
