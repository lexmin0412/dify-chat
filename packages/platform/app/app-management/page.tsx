'use client'

import { DifyApi } from '@dify-chat/api'
import { AppModeEnums, IDifyAppItem } from '@dify-chat/core'
import { AppModeNames } from '@dify-chat/core'
import { useMount, useRequest } from 'ahooks'
import { Button, message, Popconfirm, Space, Table, Tag } from 'antd'
import Title from 'antd/es/typography/Title'
import { useState } from 'react'

import { addApp } from '@/repository/app'

import { deleteApp, getApp, listApp, updateApp } from './actions'
import { AppEditDrawer } from './components/app-edit-drawer'
import { AppDetailDrawerModeEnum } from './enums'

export default function AppManagementPage() {
	const [appEditDrawerOpen, setAppEditDrawerOpen] = useState(false)
	const [appEditDrawerMode, setAppEditDrawerMode] = useState<AppDetailDrawerModeEnum>()
	const [appEditDrawerAppItem, setAppEditDrawerAppItem] = useState<IDifyAppItem>()

	const {
		runAsync: getAppList,
		data: list,
		loading: listLoading,
	} = useRequest(
		() => {
			return listApp()
		},
		{
			manual: true,
		},
	)

	useMount(() => {
		getAppList()
	})

	return (
		<>
			<div className="flex-1 h-full overflow-auto px-6">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center">
						<Title level={3}>应用配置</Title>
					</div>
					<Button
						type="primary"
						onClick={() => {
							setAppEditDrawerMode(AppDetailDrawerModeEnum.create)
							setAppEditDrawerOpen(true)
							setAppEditDrawerAppItem(undefined)
						}}
					>
						新增
					</Button>
				</div>
				<Table
					dataSource={list}
					loading={listLoading}
					scroll={{ x: 1200 }}
					columns={[
						{
							title: '名称',
							dataIndex: 'info.name',
							key: 'info.name',
							width: 180,
							fixed: 'left',
							ellipsis: true,
							render: (_text, record) => {
								return record.info.name
							},
						},
						{
							title: '类型',
							dataIndex: 'info.mode',
							key: 'info.mode',
							width: 200,
							render: (_mode: AppModeEnums, record) => {
								return record.info.mode
									? AppModeNames[(record.info.mode || AppModeEnums.CHATBOT) as AppModeEnums]
									: '--'
							},
						},
						{
							title: '描述',
							dataIndex: 'info.description',
							key: 'info.description',
							width: 300,
							ellipsis: true,
							render: (_text, record) => {
								return record.info.description || '暂无描述'
							},
						},
						{
							title: '标签',
							dataIndex: 'info.tags',
							key: 'info.tags',
							width: 200,
							render: (_text, record) => {
								return record.info.tags?.length ? (
									<Space>
										{record.info.tags.map((tag: string) => (
											<Tag key={`${record.id}__${tag}`}>{tag}</Tag>
										))}
									</Space>
								) : null
							},
						},
						{
							title: '状态',
							dataIndex: 'is_enabled',
							key: 'is_enabled',
							width: 140,
							render: () => {
								return <Tag color="success">已启用</Tag>
							},
						},
						{
							title: '操作',
							key: 'action',
							width: 200,
							fixed: 'right',
							render: (_, record) => (
								<Space size="middle">
									<Button
										className="!px-0"
										type="link"
										onClick={() => {
											setAppEditDrawerMode(AppDetailDrawerModeEnum.edit)
											setAppEditDrawerOpen(true)
											setAppEditDrawerAppItem(record)
										}}
									>
										编辑
									</Button>
									<Button
										className="!px-0"
										type="link"
										onClick={async () => {
											const appItem = await getApp(record.id)
											if (!appItem) {
												message.error('应用不存在')
												return
											}
											const { info: originalInfo, ...rest } = appItem!
											// 调用获取应用信息接口
											const difyApi = new DifyApi({
												...appItem.requestConfig,
												// TODO: 获取应用信息的 API 其实不用 user，后面处理掉
												user: '',
											})
											const appInfo = await difyApi.getAppInfo()
											try {
												await updateApp({
													...rest,
													info: {
														...originalInfo,
														...appInfo,
													},
												})
												message.success('同步应用成功')
												getAppList()
											} catch (error) {
												message.error('同步应用失败')
												console.error(error)
											}
										}}
									>
										同步应用信息
									</Button>
									<Popconfirm
										title="确定删除该应用吗？"
										description="删除后将无法恢复"
										onConfirm={async () => {
											await deleteApp(record.id)
											message.success('删除应用成功')
											getAppList()
										}}
									>
										<Button
											className="!px-0"
											type="link"
											danger
										>
											删除
										</Button>
									</Popconfirm>
								</Space>
							),
						},
					]}
				/>
			</div>

			<AppEditDrawer
				detailDrawerMode={appEditDrawerMode!}
				open={appEditDrawerOpen}
				onClose={() => setAppEditDrawerOpen(false)}
				appItem={appEditDrawerAppItem}
				confirmCallback={() => {
					getAppList()
				}}
				addApi={addApp}
				updateApi={updateApp}
			/>
		</>
	)
}
