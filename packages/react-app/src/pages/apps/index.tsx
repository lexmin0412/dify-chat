import { TagOutlined } from '@ant-design/icons'
import { AppModeLabels } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { useRequest } from 'ahooks'
import { Col, Empty, message, Row, Space, Divider, Layout, Spin, Alert, Tag, Input, Button } from 'antd'

import { useState } from 'react'
import { useHistory } from 'pure-react-router'

import { DebugMode, Header, LucideIcon } from '@/components'
import appService from '@/services/app'


export interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export interface ApplicationInfo {
  name: string;
  description: string;
  mode: 'chat' | 'workflow';
  tags: string[];
}

export interface Application {
  id: string;
  workspaceId: string;
  info: ApplicationInfo;
}

const { Sider, Content } = Layout
// Mock data for workspaces
const mockWorkspaces: Workspace[] = [
	{ id: 'workspace-1', name: '个人工作空间', description: '个人使用的工作空间', memberCount: 1 },
	{ id: 'workspace-2', name: '项目团队', description: '团队协作项目空间', memberCount: 5 },
	{ id: 'workspace-3', name: '开发测试', description: '开发测试专用空间', memberCount: 3 },
	{ id: 'workspace-4', name: '客户演示', description: '客户演示用工作空间', memberCount: 2 },
]

// Mock data for applications
const mockApplications: Application[] = [
	{
		id: 'app-1',
		workspaceId: 'workspace-1',
		info: {
			name: '个人助手',
			description: '帮助管理个人日程和任务的智能助手',
			mode: 'chat',
			tags: ['个人', '助手'],
		},
	},
	{
		id: 'app-2',
		workspaceId: 'workspace-1',
		info: {
			name: '学习笔记',
			description: '智能学习笔记管理工具',
			mode: 'chat',
			tags: ['学习', '笔记'],
		},
	},
	{
		id: 'app-3',
		workspaceId: 'workspace-2',
		info: {
			name: '项目管理',
			description: '团队项目协作与管理平台',
			mode: 'workflow',
			tags: ['团队', '项目'],
		},
	},
	{
		id: 'app-4',
		workspaceId: 'workspace-2',
		info: {
			name: '文档协作',
			description: '多人实时文档编辑与协作工具',
			mode: 'chat',
			tags: ['协作', '文档'],
		},
	},
	{
		id: 'app-5',
		workspaceId: 'workspace-3',
		info: {
			name: 'API测试',
			description: 'API接口测试与调试工具',
			mode: 'workflow',
			tags: ['测试', 'API'],
		},
	},
	{
		id: 'app-6',
		workspaceId: 'workspace-4',
		info: {
			name: '产品演示',
			description: '产品功能演示与介绍应用',
			mode: 'chat',
			tags: ['演示', '产品'],
		},
	},
]

export default function AppListPage() {
	const history = useHistory()
	const isMobile = useIsMobile()
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('workspace-1')
	const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
	const [searchKeyword, setSearchKeyword] = useState<string>('')
	const [isWorkspaceManagement, setIsWorkspaceManagement] = useState<boolean>(false)

	// Fetch workspaces (simulated with mock data)
	useRequest<Workspace[], Workspace[]>(
		() => {
			// Simulate API call delay
			return new Promise<Workspace[]>((resolve) => {
				setWorkspacesLoading(true)
				setTimeout(() => {
					setWorkspacesLoading(false)
					resolve(mockWorkspaces)
				}, 500)
			})
		},
		{
			onError: error => {
				console.error('获取工作空间失败:', error)
			},
		},
	)

	// Fetch applications filtered by selected workspace
	const { data: list, loading: appsLoading, error: appsError, refresh } = useRequest<Application[], Application[]>(
		() => {
			// Simulate API call delay
			return new Promise<Application[]>((resolve) => {
				setTimeout(() => {
					// Filter apps by selected workspace
					const filteredApps = mockApplications.filter(
						app => app.workspaceId === selectedWorkspaceId
					)
					resolve(filteredApps)
				}, 800)
			})
		},
		{
			ready: !!selectedWorkspaceId, // 当 workspace 变化时重新触发
			onError: error => {
				console.error('获取应用列表失败:', error)
			},
		},
	)

	return (
		<div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
			<Header />
			<Layout className="flex-1 overflow-hidden">
				{/* Workspace Navigation Panel */}
				<Sider
					width={240}
					className="bg-theme-bg border-r border-theme-border hidden md:block"
					collapsible={false}
				>
					<div className="p-4">
						<h3 className="text-lg font-semibold mb-4 text-theme-text">工作空间</h3>
						{workspacesLoading ? (
							<div className="flex justify-center py-4">
								<Spin size="small" />
							</div>
						) : (
							<div className="space-y-1">
								{mockWorkspaces.map(workspace => (
									<div
										key={workspace.id}
										className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedWorkspaceId === workspace.id && !isWorkspaceManagement
											? 'bg-primary text-white'
											: 'hover:bg-theme-hover text-theme-text'
											}`}
										onClick={() => {
											setSelectedWorkspaceId(workspace.id)
											setIsWorkspaceManagement(false)
										}}
									>
										<LucideIcon
											name="folder"
											size={16}
											className="mr-2"
										/>
										<span className="truncate">{workspace.name}</span>
									</div>
								))}
								<Divider size="small" />
								<div
									key="create_workspace"
									className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isWorkspaceManagement
										? 'bg-primary text-white'
										: 'hover:bg-theme-hover text-theme-text'
										}`}
									onClick={() => {
										setIsWorkspaceManagement(true)
										setSelectedWorkspaceId('')
									}}
								>
									<LucideIcon
										name="folder"
										size={16}
										className="mr-2"
									/>
									<span className="truncate">空间管理</span>
								</div>
							</div>
						)}
					</div>
				</Sider>

				{/* Main Content Area */}
				<Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
					{isWorkspaceManagement ? (
						// Workspace Management Section
						<>
							<div className="flex gap-2 mb-4 overflow-x-auto pb-2 justify-end">
								<Button type="primary" size="middle">
									+ 创建空间
								</Button>
								<Button
									type="default"
									className={`px-4 py-1 rounded-full ${searchKeyword === '' ? 'bg-primary text-white' : ''}`}
									onClick={() => { }}
								>
									全部空间
								</Button>
								<Button
									type="default"
									className={`px-4 py-1 rounded-full ${searchKeyword === '我创建的' ? 'bg-primary text-white' : ''}`}
									onClick={() => { }}
								>
									我创建的
								</Button>
								<Input
									placeholder="搜索空间名称"
									value={searchKeyword}
									size="small"
									onChange={(e) => { }}
									prefix={<TagOutlined />}
									allowClear
									className="max-w-sm"
								/>
							</div>

							{workspacesLoading ? (
								<div className="flex justify-center items-center h-48">
									<Spin size="large" />
									<p className="ml-2 text-theme-text">加载空间列表中...</p>
								</div>
							) : (
								<Row gutter={[16, 16]}>
									{mockWorkspaces
										.filter(workspace =>
											searchKeyword === '' ||
											searchKeyword === '我创建的' ||
											workspace.name.includes(searchKeyword)
										)
										.map(workspace => (
											<Col span={isMobile ? 24 : 12} key={workspace.id}>
												<div className="relative group p-4 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl">
													<div className="flex items-start">
														<div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
															<LucideIcon
																name="users"
																className="text-xl text-purple-500"
															/>
														</div>
														<div className="flex-1">
															<h3 className="text-lg font-semibold text-theme-text mb-1">{workspace.name}</h3>
															<p className="text-sm text-theme-desc mb-3 line-clamp-2">{workspace.description}</p>
															<div className="flex items-center text-xs text-theme-desc">
																<LucideIcon
																	name="user"
																	size={12}
																	className="mr-1"
																/>
																<span>当前成员：{workspace.memberCount} 名</span>
															</div>
														</div>
													</div>
													<div className="mt-4 flex justify-end">
														<Button
															type="primary"
															size="small"
															className="bg-primary text-white"
															onClick={() => {
																// Navigate to workspace management page
																history.push(`/workspaces/${workspace.id}`)
															}}
														>
															进入管理
														</Button>
													</div>
												</div>
											</Col>
										))}
								</Row>
							)}
						</>
					) : (
						// Application List Section
						<>
							{appsError ? (
								<div className="flex justify-center items-center h-48">
									<Alert
										message="获取应用列表失败"
										description="请稍后重试"
										type="error"
										showIcon
										action={<button onClick={refresh} className="text-primary hover:underline">重新加载</button>}
									/>
								</div>
							) : appsLoading ? (
								<div className="flex justify-center items-center h-48">
									<Spin size="large" />
									<p className="ml-2 text-theme-text">加载应用列表中...</p>
								</div>
							) : Array.isArray(list) && list.length ? (
								<Row
									gutter={[16, 16]}
									className=""
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
														className={`relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary`}
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
													className={`relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary`}
												>
													<div
														onClick={() => {
															history.push(`/app/${item.id}`)
														}}
													>
														<div className="flex items-center overflow-hidden">
															<div className="h-10 w-10 bg-[#ffead5] dark:bg-transparent border border-solid border-transparent dark:border-theme-border rounded-lg flex items-center justify-center">
																<LucideIcon
																	name="bot"
																	className="text-xl text-theme-text"
																/>
															</div>
															<div className="flex-1 overflow-hidden ml-3 text-theme-text h-10 flex flex-col justify-between">
																<div className="truncate font-semibold pr-4">{item.info.name}</div>
																<div className="text-theme-desc text-xs mt-0.5">
																	{item.info.mode ? AppModeLabels[item.info.mode] : 'unknown'}
																</div>
															</div>
														</div>
														<div className="text-sm mt-3 h-10 overflow-hidden text-ellipsis leading-5 whitespace-normal line-clamp-2 text-theme-desc">
															{item.info.description || '暂无描述'}
														</div>
													</div>
													<div className="flex items-center text-desc truncate mt-3 h-4">
														{hasTags ? (
															<>
																<TagOutlined className="mr-2" />
																{
																	item.info.tags.map(tag => (
																		<Tag key={tag} className="bg-gray-700/50 text-gray-300 border-0 px-2 py-0.5 rounded-full text-xs">
																			#{tag}
																		</Tag>
																	))
																}
															</>
														) : null}
													</div>
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
						</>
					)}
				</Content>
			</Layout>
			<DebugMode />
		</div>
	)
}
