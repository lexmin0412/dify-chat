import { useState } from 'react'
import { Layout, Tooltip, message } from 'antd'
import { ArrowLeftCircle, ArrowRightCircle, FolderClosed, FolderOpen, FolderPen } from 'lucide-react'

import { Header, DebugMode, WorkspaceNav } from '@/components'
import WorkspaceModal from '@/components/workspace/WorkspaceModal'
  
import { workspaceService } from '@/services/workspace'
import { Workspace } from '@/types'
import AppListView from './components/app-list-view'
import { useParams } from 'pure-react-router'
import { WorkspaceSettingView } from '@/components'
import { useMount } from 'ahooks'

const { Sider, Content } = Layout

export default function WorkspacePage() {
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('workspace-1')
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
    const [isWorkspaceSettingVisible, setIsWorkspaceSettingVisible] = useState<boolean>(false)
    const [isWorkspaceManagement, setIsWorkspaceManagement] = useState<boolean>(false)
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
    const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false)
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [newWorkspaceId, setNewWorkspaceId] = useState<string | null>(null)
    const [currentWorkspaceData, setCurrentWorkspaceData] = useState<{ name: string; description: string } | undefined>(undefined)

    const { workspaceId: paramsWorkspaceId } = useParams<{ workspaceId: string }>()

    const handleWorkspaceSettingClick = () => {
        setIsWorkspaceSettingVisible(true)
    }

    const handleGoBack = () => {
        setIsWorkspaceSettingVisible(false)
    }

    const handleWorkspaceManagementClick = () => {
        setIsWorkspaceManagement(true)
        setIsCreateModalVisible(true)
    }

    const handleCreateModalCancel = () => {
        setIsCreateModalVisible(false)
        setIsWorkspaceManagement(false)
    }

    const handleEditModalCancel = () => {
        setIsEditModalVisible(false)
        setCurrentWorkspaceData(undefined)
    }

    const handleCreateOrUpdateWorkspace = async (values: { name: string; description: string }) => {
        try {
            setIsSubmitting(true)

            // 准备工作空间数据
            const workspaceData = {
                name: values.name.trim(),
                description: values.description ? values.description.trim() : ''
            }

            // 检查名称是否已存在
            const isEditMode = isEditModalVisible && currentWorkspaceData
            const nameExists = workspaces.some(ws =>
                ws.name.toLowerCase() === workspaceData.name.toLowerCase() &&
                (isEditMode ? ws.id !== selectedWorkspaceId : true)
            )

            if (nameExists) {
                message.error('该工作空间名称已存在，请使用其他名称')
                return
            }

            if (isEditMode) {
                // 编辑模式 - 更新现有工作空间
                // 模拟API调用，实际应用中应使用正确的API
                // await workspaceAPI.updateWorkspace(selectedWorkspaceId, workspaceData)

                // 更新本地工作空间列表
                setWorkspaces(prev => prev.map(ws =>
                    ws.id === selectedWorkspaceId
                        ? { ...ws, ...workspaceData }
                        : ws
                ))

                // 关闭编辑模态框
                setIsEditModalVisible(false)
                setCurrentWorkspaceData(undefined)

                // 显示成功消息
                message.success('工作空间更新成功')
            } else {
                // 创建模式 - 创建新工作空间
                // 模拟API调用，实际应用中应使用正确的API
                // const response = await workspaceAPI.createWorkspace(workspaceData)
                // const newWorkspace = response.data

                // 模拟创建新工作空间
                const newWorkspace: Workspace = {
                    id: `workspace-${Date.now()}`, // 生成临时ID
                    name: workspaceData.name,
                    description: workspaceData.description,
                    memberCount: 1,
                }

                // 更新本地工作空间列表
                setWorkspaces(prev => [...prev, newWorkspace])

                // 选中新创建的工作空间
                setSelectedWorkspaceId(newWorkspace.id)

                // 关闭创建模态框
                setIsCreateModalVisible(false)
                setIsWorkspaceManagement(false)

                // 显示成功消息
                message.success(`工作空间 "${newWorkspace.name}" 创建成功`)

                // 设置新创建的工作空间ID，用于高亮显示
                setNewWorkspaceId(newWorkspace.id)

                // 3秒后移除高亮效果
                setTimeout(() => {
                    setNewWorkspaceId(null)
                }, 3000)
            }
        } catch (error: any) {
            console.error('操作工作空间失败:', error)
            // 显示错误消息
            message.error(isEditModalVisible ? '工作空间更新失败' : '工作空间创建失败')
            throw error; // 向上抛出错误以便组件知道提交失败
        } finally {
            // 确保无论成功失败都重置提交状态
            setIsSubmitting(false)
        }
    }

    useMount(() => {
        setWorkspacesLoading(true)
        workspaceService.getWorkspaces().then((res) => {
            setWorkspaces(res || [])
            setWorkspacesLoading(false)
        })
        if (paramsWorkspaceId) {
            setSelectedWorkspaceId(paramsWorkspaceId)
        } else {
            setSelectedWorkspaceId(workspaces[0]?.id || 'workspace-1')
        }
    })

    const handleWorkspaceSelect = (workspaceId: string) => {
        setSelectedWorkspaceId(workspaceId)
    }

    return (
        <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
            <Header />
            <Layout className="flex-1 overflow-hidden">
                {/* Workspace Navigation Panel */}
                <Sider
                    width={240}
                    collapsible
                    collapsed={!sidebarOpen}
                    onCollapse={(value) => setSidebarOpen(value)}
                    className={`bg-theme-bg border-r border-theme-border hidden md:block overflow-hidden transition-all duration-300 ease-in-out`}
                    collapsedWidth={48}
                    trigger={null} // We'll use our own custom trigger
                >
                    <div className={`${sidebarOpen ? 'w-full' : 'w-12'} transition-all h-full flex flex-col`}>
                        {sidebarOpen ? (
                            <div className="flex-1 overflow-auto transition-all duration-300">
                                <WorkspaceNav
                                    workspaces={workspaces}
                                    selectedWorkspaceId={selectedWorkspaceId}
                                    newWorkspaceId={newWorkspaceId}
                                    workspacesLoading={workspacesLoading}
                                    onWorkspaceSelect={handleWorkspaceSelect}
                                    isWorkspaceManagement={isWorkspaceManagement}
                                    onManagementToggle={handleWorkspaceManagementClick}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col justify-center items-center flex-1">
                                    {workspaces.map(workspace => (
                                        <Tooltip
                                            key={workspace.id}
                                            title={workspace.name}
                                            placement="right"
                                        >
                                            <div
                                                className={`h-10 w-10 flex items-center justify-center mb-2 rounded-md cursor-pointer transition-colors ${selectedWorkspaceId === workspace.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : newWorkspaceId === workspace.id
                                                        ? 'bg-primary/20 text-primary animate-pulse'
                                                        : 'hover:bg-gray-100'
                                                    }`}
                                                onClick={() => handleWorkspaceSelect(workspace.id)}
                                                // 可访问性支持
                                                role="button"
                                                tabIndex={0}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        handleWorkspaceSelect(workspace.id)
                                                    }
                                                }}
                                            >
                                                <FolderClosed
                                                    strokeWidth={1.25}
                                                    size={18}
                                                />
                                            </div>
                                        </Tooltip>
                                    ))}
                                    <Tooltip
                                        key="create-workspace"
                                        title="创建空间"
                                        placement="right"
                                    >
                                        <div
                                            className={`h-10 w-10 flex items-center justify-center mb-2 rounded-md cursor-pointer transition-colors ${isWorkspaceManagement
                                                ? 'bg-primary/20 text-primary animate-pulse'
                                                : 'hover:bg-gray-100'
                                                }`}
                                            onClick={() => handleWorkspaceManagementClick()}
                                            // 可访问性支持
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    handleWorkspaceManagementClick()
                                                }
                                            }}
                                        >
                                            <FolderPen
                                                strokeWidth={1.25}
                                                size={18}
                                            />
                                        </div>
                                    </Tooltip>
                                </div>
                            </>
                        )}

                        <div className="border-t border-theme-border flex items-center justify-center h-12">
                            <Tooltip
                                title={sidebarOpen ? '折叠侧边栏' : '展开侧边栏'}
                                placement="right"
                            >
                                <div className="flex items-center justify-center">
                                    {sidebarOpen ? (
                                        <ArrowLeftCircle
                                            onClick={() => setSidebarOpen(false)}
                                            className="cursor-pointer hover:text-primary"
                                            strokeWidth={1.25}
                                            size={24}
                                        />
                                    ) : (
                                        <ArrowRightCircle
                                            onClick={() => setSidebarOpen(true)}
                                            className="cursor-pointer hover:text-primary"
                                            strokeWidth={1.25}
                                            size={24}
                                        />
                                    )}
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </Sider>

                {/* Main Content Area */}
                <Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
                    {selectedWorkspaceId && !isWorkspaceSettingVisible && <AppListView workspaceId={selectedWorkspaceId} handleWorkspaceSettingClick={handleWorkspaceSettingClick} />}
                    {selectedWorkspaceId && isWorkspaceSettingVisible && (
                        <WorkspaceSettingView
                            workspaceId={selectedWorkspaceId}
                            handleGoBack={handleGoBack}
                            onEditWorkspace={(workspaceData) => {
                                setCurrentWorkspaceData(workspaceData);
                                setIsEditModalVisible(true);
                            }}
                            workspaceData={workspaces.find(ws => ws.id === selectedWorkspaceId) || undefined}
                            onWorkspaceDeleted={(deletedId) => {
                                // 从工作空间列表中移除已删除的工作空间
                                setWorkspaces(prevWorkspaces => 
                                  prevWorkspaces.filter(ws => ws.id !== deletedId)
                                );
                            }}
                        />
                    )}
                </Content>

                {/* 工作空间创建模态框 */}
                <WorkspaceModal
                    open={isCreateModalVisible}
                    onCancel={handleCreateModalCancel}
                    onSubmit={handleCreateOrUpdateWorkspace}
                    mode="create"
                    isSubmitting={isSubmitting}
                />

                {/* 工作空间编辑模态框 */}
                <WorkspaceModal
                    open={isEditModalVisible}
                    onCancel={handleEditModalCancel}
                    onSubmit={handleCreateOrUpdateWorkspace}
                    mode="edit"
                    workspaceData={currentWorkspaceData}
                    isSubmitting={isSubmitting}
                />
            </Layout>
            <DebugMode />
        </div>
    )
}
