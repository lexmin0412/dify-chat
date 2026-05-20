'use client'

import { TagOutlined } from '@ant-design/icons'
import { AppModeLabels } from '@/lib/core'
import { useIsMobile } from '@/lib/helpers'
import { useRequest } from 'ahooks'
import { Col, Empty, message, Row } from 'antd'
import { useRouter } from 'next/navigation'

import { LucideIcon } from '@/components/shared'
import appService from '@/services/app'

export default function AppListPage() {
	const router = useRouter()
	const isMobile = useIsMobile()

	const { data: list } = useRequest(() => appService.getApps(), {
		onError: error => {
			message.error(`获取应用列表失败: ${error}`)
			console.error(error)
		},
	})

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden">
			<div className="flex items-center px-3 py-2">
				<LucideIcon
					name="layout-grid"
					size={16}
					className="mr-1"
				/>
				应用列表
			</div>
			<div className="box-border flex-1 overflow-x-hidden overflow-y-auto rounded-t-3xl py-6">
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
										<div className="hover:border-primary bg-theme-main-bg border-theme text-theme-text cursor-pointer rounded-2xl border p-3">
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
										className="hover:border-primary hover:text-primary bg-theme-main-bg border-theme cursor-pointer rounded-2xl border p-3"
										onClick={() => router.push(`/chat/${item.id}`)}
									>
										<div className="flex items-center overflow-hidden">
											<div className="border-theme bg-theme-btn-bg flex h-10 w-10 items-center justify-center rounded-lg border">
												<LucideIcon
													name="bot"
													className="text-theme-text text-xl"
												/>
											</div>
											<div className="ml-3 flex-1 overflow-hidden">
												<div className="text-theme-text truncate font-semibold">
													{item.info.name}
												</div>
												<div className="text-theme-desc text-xs">
													{item.info.mode ? AppModeLabels[item.info.mode] : 'unknown'}
												</div>
											</div>
										</div>
										<div className="text-theme-desc mt-3 line-clamp-2 text-sm">
											{item.info.description || '该应用暂无描述'}
										</div>
										<div className="text-theme-desc mt-3 flex items-center truncate text-xs">
											{hasTags && (
												<>
													<TagOutlined className="mr-2" />
													{item.info.tags.join('、')}
												</>
											)}
										</div>
									</div>
								</Col>
							)
						})}
					</Row>
				) : (
					<div className="flex h-full items-center justify-center">
						<Empty description="暂无应用数据，请联系管理员配置" />
					</div>
				)}
			</div>
		</div>
	)
}
