import {
	AndroidOutlined,
	DeleteOutlined,
	EditOutlined,
	MoreOutlined,
	RobotFilled,
	TagOutlined,
} from '@ant-design/icons'
import { IDifyAppItem, IDifyChatContextMultiApp, useDifyChat } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { useRequest } from 'ahooks'
import { Button, Col, Dropdown, Empty, message, Row } from 'antd'
import { useHistory } from 'pure-react-router'
import { useEffect, useState } from 'react'

import { AppEditDrawer } from '@/components/app-edit-drawer'
import { AppDetailDrawerModeEnum } from '@/components/app-manage-drawer'
import HeaderLayout from '@/layout/header'

export default function AppListPage() {
	const history = useHistory()
	const { appService, mode, enableSetting } = useDifyChat() as IDifyChatContextMultiApp
	const isMobile = useIsMobile()
	const [appEditDrawerOpen, setAppEditDrawerOpen] = useState(false)
	const [appEditDrawerMode, setAppEditDrawerMode] = useState<AppDetailDrawerModeEnum>()
	const [appEditDrawerAppItem, setAppEditDrawerAppItem] = useState<IDifyAppItem>()

	const { runAsync: getAppList, data: list } = useRequest(
		() => {
			return appService.getApps()
		},
		{
			manual: true,
			onError: error => {
				message.error(`获取应用列表失败: ${error}`)
				console.error(error)
			},
		},
	)

	useEffect(() => {
		if (mode === 'multiApp') {
			getAppList()
		} else {
			// FIXME: 若不加定时器，URL 会更新但是页面 UI 仍然停在当前页面
			setTimeout(() => {
				history.push('/chat')
			}, 200)
		}
	}, [])

	return (
		<div className="h-screen relative overflow-hidden flex flex-col bg-[#f2f4f7] w-full">
			<HeaderLayout
				title={
					<div>
						<RobotFilled className="mr-2" />
						应用列表
					</div>
				}
			/>
			<div className="flex-1 bg-white rounded-3xl py-6 overflow-y-auto box-border overflow-x-hidden">
				{list?.length ? (
					<Row
						gutter={[16, 16]}
						className="px-3 md:px-6"
					>
						{list.map(item => {
							const hasTags = item.info.tags?.length
							return (
								<Col
									key={item.id}
									span={isMobile ? 24 : 6}
								>
									<div
										key={item.id}
										className={`relative group p-3 bg-white border border-solid border-gray-200 rounded-2xl cursor-pointer hover:border-primary hover:text-primary`}
									>
										<div
											onClick={() => {
												history.push(`/app/${item.id}`)
											}}
										>
											<div className="flex items-center overflow-hidden">
												<div className="h-10 w-10 bg-[#ffead5] rounded-lg flex items-center justify-center">
													<AndroidOutlined className="text-xl text-default" />
												</div>
												<div className="flex-1 overflow-hidden ml-3">
													<div className="truncate font-semibold pr-4">{item.info.name}</div>
													<div className="text-desc text-xs mt-0.5">Unknown</div>
												</div>
											</div>
											<div className="text-sm mt-3 h-10 overflow-hidden text-ellipsis leading-5 whitespace-normal line-clamp-2">
												{item.info.description || '暂无描述'}
											</div>
										</div>
										<div className="flex items-center text-desc truncate mt-3 h-4">
											{hasTags ? (
												<>
													<TagOutlined className="mr-2" />
													{item.info.tags.join('、')}
												</>
											) : null}
										</div>

										{/* 操作图标 */}
										{enableSetting ? (
											<Dropdown
												menu={{
													items: [
														{
															key: 'edit',
															icon: <EditOutlined />,
															label: '编辑',
															onClick: () => {
																setAppEditDrawerMode(AppDetailDrawerModeEnum.edit)
																setAppEditDrawerOpen(true)
																setAppEditDrawerAppItem(item)
															},
														},
														{
															key: 'delete',
															icon: <DeleteOutlined />,
															label: '删除',
															danger: true,
															onClick: async () => {
																await appService.deleteApp(item.id)
																message.success('删除应用成功')
																getAppList()
															},
														},
													],
												}}
											>
												<MoreOutlined className="absolute right-3 top-3 text-lg" />
											</Dropdown>
										) : null}
									</div>
								</Col>
							)
						})}
					</Row>
				) : (
					<div className="w-full h-full box-border flex flex-col items-center justify-center px-3">
						<Empty description="暂无应用" />
					</div>
				)}
			</div>

			{enableSetting ? (
				<Button
					type="primary"
					size="large"
					className="!absolute w-4/5 md:!w-96 box-border bottom-4 left-1/2 !rounded-3xl"
					style={{
						transform: 'translateX(-50%)',
					}}
					onClick={() => {
						setAppEditDrawerMode(AppDetailDrawerModeEnum.create)
						setAppEditDrawerOpen(true)
						setAppEditDrawerAppItem(undefined)
					}}
				>
					新增应用配置
				</Button>
			) : null}

			<AppEditDrawer
				detailDrawerMode={appEditDrawerMode!}
				open={appEditDrawerOpen}
				onClose={() => setAppEditDrawerOpen(false)}
				appItem={appEditDrawerAppItem}
				confirmCallback={() => {
					getAppList()
				}}
			/>
		</div>
	)
}
