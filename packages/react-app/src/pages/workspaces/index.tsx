import { useState } from 'react'
import { Layout, Tooltip, Modal, Form, Input, Button, message } from 'antd'
import { ArrowLeftCircle, ArrowRightCircle, FolderClosed } from 'lucide-react'

import { Header, DebugMode, WorkspaceNav } from '@/components'

import { workspaceService } from '@/services/workspace'
import { Workspace } from '@/types'
import AppListView from './components/app-list-view'
import { useParams} from 'pure-react-router'
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
    const [createForm] = Form.useForm()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [newWorkspaceId, setNewWorkspaceId] = useState<string | null>(null)

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

    const handleModalCancel = () => {
        setIsCreateModalVisible(false)
        setIsWorkspaceManagement(false)
        createForm.resetFields()
    }

    const handleCreateWorkspace = async () => {
        try {
            // 验证表单
            const values = await createForm.validateFields()
            
            // 设置提交状态
            setIsSubmitting(true)
            
            // 准备工作空间数据
            const workspaceData = {
                name: values.name.trim(),
                description: values.description ? values.description.trim() : ''
            }
            
            // 检查名称是否已存在
            const nameExists = workspaces.some(ws => ws.name.toLowerCase() === workspaceData.name.toLowerCase())
            if (nameExists) {
                message.error('该工作空间名称已存在，请使用其他名称')
                return
            }
            
            // 由于workspaceService没有createWorkspace方法，这里使用模拟创建
            // 在实际应用中，应该使用正确的API调用
            const newWorkspace = {
                id: `workspace-${Date.now()}`, // 生成临时ID
                name: workspaceData.name,
                description: workspaceData.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar_url: '',
                role: 'owner'
            }
            
            // 更新工作空间列表
            setWorkspaces(prev => [...prev, newWorkspace])
            
            // 选中新创建的工作空间
            setSelectedWorkspaceId(newWorkspace.id)
            
            // 关闭模态框并重置状态
            setIsCreateModalVisible(false)
            setIsWorkspaceManagement(false)
            createForm.resetFields()
            
            // 显示成功消息
            message.success(`工作空间 "${newWorkspace.name}" 创建成功`)
            
            // 设置新创建的工作空间ID，用于高亮显示
            setNewWorkspaceId(newWorkspace.id)
            
            // 3秒后移除高亮效果
            setTimeout(() => {
                setNewWorkspaceId(null)
            }, 3000)
            
        } catch (error: any) {
            // 显示错误消息
            if (error.name === 'ValidateError') {
                // 表单验证错误已通过Form.Item显示
                return
            }
            
            let errorMessage = '工作空间创建失败'
            
            if (error.message) {
                errorMessage = error.message
            }
            
            message.error(errorMessage)
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
							</div>
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
                    {selectedWorkspaceId && isWorkspaceSettingVisible && <WorkspaceSettingView workspaceId={selectedWorkspaceId} handleGoBack={handleGoBack} />}
				</Content>

                {/* 创建工作空间模态框 */}
                <Modal
                    title="创建工作空间"
                    open={isCreateModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    className="workspace-create-modal"
                    // 可访问性支持
                    aria-labelledby="create-workspace-title"
                    keyboard={true}
                    centered
                    // 响应式优化
                    width={{ xs: 320, sm: 500, md: 600 }}
                >
                    <Form
                        form={createForm}
                        layout="vertical"
                        className="mt-4"
                    >
                        <Form.Item
                            name="name"
                            label="工作空间名称"
                            validateFirst
                            rules={[
                                { required: true, message: '请输入工作空间名称' },
                                { min: 1, max: 50, message: '工作空间名称长度应在1-50个字符之间' },
                                {
                                    validator: (_, value) => {
                                        // 检查名称是否只包含允许的字符
                                        if (value && !/^[\u4e00-\u9fa5a-zA-Z0-9-_\s]+$/.test(value)) {
                                            return Promise.reject('工作空间名称只能包含中文、英文、数字、下划线和连字符')
                                        }
                                        return Promise.resolve()
                                    }
                                }
                            ]}
                        >
                            <Input 
                                placeholder="请输入工作空间名称" 
                                showCount 
                                maxLength={50}
                                status={createForm.getFieldError('name').length ? 'error' : ''}
                                // 可访问性支持
                                aria-required={true}
                                autoComplete="off"
                            />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="工作空间描述"
                            rules={[
                                { max: 200, message: '工作空间描述不能超过200个字符' }
                            ]}
                        >
                            <Input.TextArea 
                                rows={4} 
                                placeholder="请输入工作空间描述（选填）"
                                showCount
                                maxLength={200}
                                status={createForm.getFieldError('description').length ? 'error' : ''}
                            />
                        </Form.Item>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                            <Button 
                                onClick={handleModalCancel}
                                // 可访问性支持
                                aria-label="取消创建工作空间"
                            >取消</Button>
                            <Button 
                                type="primary" 
                                onClick={handleCreateWorkspace}
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                // 可访问性支持
                                aria-label="确认创建工作空间"
                                aria-disabled={isSubmitting}
                            >创建工作空间</Button>
                        </div>
                    </Form>
                </Modal>
			</Layout>
			<DebugMode />
		</div>
	)
}
