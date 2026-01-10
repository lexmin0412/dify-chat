import { TagOutlined } from '@ant-design/icons'
import { AppModeLabels } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { useRequest } from 'ahooks'
import { Col, Empty, message, Row } from 'antd'
import { useHistory } from 'pure-react-router'

import { DebugMode, HeaderLayout, LucideIcon } from '@/components'
import appService from '@/services/app'
import { useTranslation } from 'react-i18next'

export default function AppListPage() {
	const history = useHistory()
	const isMobile = useIsMobile()
	const { t } = useTranslation()

	const { data: list } = useRequest(
		() => {
			return appService.getApps()
		},
		{
			onError: error => {
				message.error(`获取应用列表失败: ${error}`)
				console.error(error)
			},
		},
	)

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden bg-theme-bg">
			<HeaderLayout
				title={
					<div className="flex items-center">
						<LucideIcon
							name="layout-grid"
							size={16}
							className="mr-1"
						/>
						{t('app.list')}
					</div>
				}
			/>
			<div className="box-border flex-1 overflow-y-auto overflow-x-hidden rounded-t-3xl bg-theme-main-bg py-6">
				{list?.length ? (
					<Row
						gutter={[16, 16]}
						className="px-3 md:px-6"
					>
						{list.map(item => {
							if (!item.info) {
								return (
									<Col
										key={item.id}
										span={isMobile ? 24 : 6}
									>
										<div
											key={item.id}
											className={`group relative cursor-pointer rounded-2xl border border-solid border-theme-border bg-theme-btn-bg p-3 hover:border-primary hover:text-primary`}
										>
											应用信息缺失，请检查
										</div>
									</Col>
								)
							}
							const hasTags = item.info.tags?.length
							return (
								<Col
									key={item.id}
									span={isMobile ? 24 : 6}
								>
									<div
										key={item.id}
										className={`group relative cursor-pointer rounded-2xl border border-solid border-theme-border bg-theme-btn-bg p-3 hover:border-primary hover:text-primary`}
									>
										<div
											onClick={() => {
												history.push(`/app/${item.id}`)
											}}
										>
											<div className="flex items-center overflow-hidden">
												<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-solid border-transparent bg-[#ffead5] dark:border-theme-border dark:bg-transparent">
													<LucideIcon
														name="bot"
														className="text-xl text-theme-text"
													/>
												</div>
												<div className="ml-3 flex h-10 flex-1 flex-col justify-between overflow-hidden text-theme-text">
													<div className="truncate pr-4 font-semibold">{item.info.name}</div>
													<div className="mt-0.5 text-xs text-theme-desc">
														{item.info.mode ? AppModeLabels[item.info.mode] : 'unknown'}
													</div>
												</div>
											</div>
											<div className="mt-3 line-clamp-2 h-10 overflow-hidden text-ellipsis whitespace-normal text-sm leading-5 text-theme-desc">
												{item.info.description || t('app.no_description')}
											</div>
										</div>
										<div className="mt-3 flex h-4 items-center truncate text-desc">
											{hasTags ? (
												<>
													<TagOutlined className="mr-2" />
													{item.info.tags.join('、')}
												</>
											) : null}
										</div>
									</div>
								</Col>
							)
						})}
					</Row>
				) : (
					<div className="box-border flex h-full w-full flex-col items-center justify-center px-3">
						<Empty description="暂无应用" />
					</div>
				)}
			</div>
			<DebugMode />
		</div>
	)
}
