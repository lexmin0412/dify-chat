import { Header, WorkspaceNav, WorkspaceManagementView, DebugMode } from "@/components";
import { Layout, Tabs, Button, Modal, Form, Input, Table, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined, LeftOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { workspaceService } from '@/services/workspace'
import { applicationService } from '@/services/application'
import { Workspace, Application as ApplicationType } from '@/types'


const { Sider, Content } = Layout

// 定义用户接口
interface User {
  id: string;
  username: string;
  phone: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'member' | 'admin';
  joinTime: string;
}

// 定义空间接口扩展
interface Space extends Workspace {
  createdAt: string;
  updatedAt: string;
}

export default function Workspaces() {
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('workspace-1')
    const [isWorkspaceManagement, setIsWorkspaceManagement] = useState<boolean>(false)
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
    const [applications, setApplications] = useState<ApplicationType[]>([])
    const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false)
    const [applicationsError, setApplicationsError] = useState<Error | undefined>()
    const [collapsed, setCollapsed] = useState(false)
    
    // 多标签状态
    const [activeTab, setActiveTab] = useState<string>('members')
    
    // 用户数据状态
    const [users, setUsers] = useState<User[]>([])
    
    // 空间数据状态
    const [spaces, setSpaces] = useState<Space[]>([])
    
    // 模态框状态
    const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState<boolean>(false)
    const [isEditSpaceModalVisible, setIsEditSpaceModalVisible] = useState<boolean>(false)
    
    // 表单状态
    const [addMemberForm] = Form.useForm()
    const [editSpaceForm] = Form.useForm()
    
    // 编辑中的空间
    const [editingSpace, setEditingSpace] = useState<Space | null>(null)
    
    // 初始化模拟数据
    useEffect(() => {
        setWorkspacesLoading(true)
        workspaceService.getWorkspaces().then((res) => {
            setWorkspaces(res || [])
            setWorkspacesLoading(false)
            
            // 初始化模拟空间数据
            const mockSpaces: Space[] = (res || []).map(workspace => ({
                ...workspace,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-02'
            }))
            setSpaces(mockSpaces)
        })
        
        // 初始化模拟用户数据
        const mockUsers: User[] = [
            {
                id: '1',
                username: 'admin',
                phone: '13800138000',
                email: 'admin@example.com',
                avatar: '',
                role: 'owner',
                joinTime: '2024-01-01 10:00:00'
            },
            {
                id: '2',
                username: 'user1',
                phone: '13800138001',
                email: 'user1@example.com',
                avatar: '',
                role: 'member',
                joinTime: '2024-01-02 14:30:00'
            },
            {
                id: '3',
                username: 'user2',
                phone: '13800138002',
                email: 'user2@example.com',
                avatar: '',
                role: 'member',
                joinTime: '2024-01-03 09:15:00'
            }
        ]
        setUsers(mockUsers)
        
    }, [])

    useEffect(() => {
        if (selectedWorkspaceId) {
            setApplicationsLoading(true)
            setApplicationsError(undefined)
            applicationService.getApplicationsByWorkspaceId(selectedWorkspaceId)
                .then((res) => {
                    setApplications(res || [])
                    setApplicationsLoading(false)
                })
                .catch((error) => {
                    setApplicationsError(error)
                    setApplicationsLoading(false)
                })
        }
    }, [selectedWorkspaceId])

    const handleRefreshApplications = () => {
        if (selectedWorkspaceId) {
            setApplicationsLoading(true)
            setApplicationsError(undefined)
            applicationService.getApplicationsByWorkspaceId(selectedWorkspaceId)
                .then((res) => {
                    setApplications(res || [])
                    setApplicationsLoading(false)
                })
                .catch((error) => {
                    setApplicationsError(error)
                    setApplicationsLoading(false)
                })
        }
    }

    const handleWorkspaceSelect = (workspaceId: string) => {
        setSelectedWorkspaceId(workspaceId)
        setIsWorkspaceManagement(false)
    }

    const handleWorkspaceManagementEnter = () => {
        setIsWorkspaceManagement(true)
        setSelectedWorkspaceId('')
    }
    
    // 标签页切换处理
    const handleTabChange = (key: string) => {
        setActiveTab(key)
    }
    
    // 打开添加成员模态框
    const handleAddMember = () => {
        setIsAddMemberModalVisible(true)
    }
    
    // 关闭添加成员模态框
    const handleCancelAddMember = () => {
        setIsAddMemberModalVisible(false)
        addMemberForm.resetFields()
    }
    
    // 提交添加成员表单
    const handleSubmitAddMember = () => {
        addMemberForm.validateFields()
            .then(values => {
                // 创建新用户
                const newUser: User = {
                    id: Date.now().toString(),
                    username: values.username,
                    phone: values.phone,
                    email: values.email,
                    avatar: '',
                    role: 'member',
                    joinTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }
                
                // 更新用户列表
                setUsers([...users, newUser])
                
                // 关闭模态框并重置表单
                setIsAddMemberModalVisible(false)
                addMemberForm.resetFields()
                
                // 显示成功消息
                message.success('成员添加成功')
            })
            .catch(info => {
                console.log('表单验证失败:', info)
            })
    }
    
    // 打开编辑空间模态框
    const handleEditSpace = (space: Space) => {
        setEditingSpace(space)
        editSpaceForm.setFieldsValue({
            name: space.name,
            description: space.description
        })
        setIsEditSpaceModalVisible(true)
    }
    
    // 关闭编辑空间模态框
    const handleCancelEditSpace = () => {
        setIsEditSpaceModalVisible(false)
        setEditingSpace(null)
        editSpaceForm.resetFields()
    }
    
    // 提交编辑空间表单
    const handleSubmitEditSpace = () => {
        editSpaceForm.validateFields()
            .then(values => {
                if (!editingSpace) return
                
                // 更新空间信息
                const updatedSpaces = spaces.map(space => 
                    space.id === editingSpace.id 
                        ? { ...space, ...values, updatedAt: new Date().toISOString().slice(0, 10) } 
                        : space
                )
                
                // 更新空间列表
                setSpaces(updatedSpaces)
                
                // 同时更新workspaces列表
                const updatedWorkspaces = workspaces.map(workspace => 
                    workspace.id === editingSpace.id 
                        ? { ...workspace, ...values } 
                        : workspace
                )
                setWorkspaces(updatedWorkspaces)
                
                // 关闭模态框并重置表单
                setIsEditSpaceModalVisible(false)
                setEditingSpace(null)
                editSpaceForm.resetFields()
                
                // 显示成功消息
                message.success('空间信息更新成功')
            })
            .catch(info => {
                console.log('表单验证失败:', info)
            })
    }
    
    // 删除空间
    const handleDeleteSpace = (spaceId: string) => {
        // 从空间列表中删除
        const updatedSpaces = spaces.filter(space => space.id !== spaceId)
        setSpaces(updatedSpaces)
        
        // 同时从workspaces列表中删除
        const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== spaceId)
        setWorkspaces(updatedWorkspaces)
        
        // 显示成功消息
        message.success('空间删除成功')
    }
    
    // 回退按钮处理函数
    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back()
        } else {
            message.info('没有更多历史记录')
        }
    }

    return (
        <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
            <Header />
            <Layout className="flex-1 overflow-hidden">
                {/* Workspace Navigation Panel */}
                <Sider
                    width={240}
                    className="bg-theme-bg border-r border-theme-border hidden md:block"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                >
                    <WorkspaceNav
                        workspaces={workspaces}
                        selectedWorkspaceId={selectedWorkspaceId}
                        isWorkspaceManagement={isWorkspaceManagement}
                        workspacesLoading={workspacesLoading}
                    onWorkspaceSelect={handleWorkspaceSelect}
                    onManagementToggle={handleWorkspaceManagementEnter}
                    />
                </Sider>

                {/* Main Content Area */}
                <Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
                    {/* 顶部操作栏 */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <Button 
                                type="text" 
                                onClick={handleGoBack}
                                icon={<LeftOutlined />}
                                className="mr-2"
                            >
                                返回
                            </Button>
                            <h2 className="text-xl font-bold">工作区管理</h2>
                        </div>
                        {activeTab === 'members' && (
                            <Button 
                                type="primary" 
                                onClick={handleAddMember}
                                icon={<PlusOutlined />}
                            >
                                添加成员
                            </Button>
                        )}
                    </div>
                    
                    {/* 多标签界面 */}
                    <Tabs activeKey={activeTab} onChange={handleTabChange}>
                        {/* 成员管理标签 */}
                        <Tabs.TabPane tab="成员管理" key="members">
                            <Table 
                                dataSource={users} 
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                columns={[
                                    {
                                        title: '用户名',
                                        dataIndex: 'username',
                                        key: 'username',
                                        render: (text: string) => (
                                            <div className="flex items-center">
                                                <UserOutlined className="mr-2" />
                                                {text}
                                            </div>
                                        )
                                    },
                                    {
                                        title: '手机号',
                                        dataIndex: 'phone',
                                        key: 'phone'
                                    },
                                    {
                                        title: '邮箱号',
                                        dataIndex: 'email',
                                        key: 'email'
                                    },
                                    {
                                        title: '角色',
                                        dataIndex: 'role',
                                        key: 'role',
                                        render: (role: string) => {
                                            const roleMap: Record<string, string> = {
                                                'owner': '所有者',
                                                'admin': '管理员',
                                                'member': '成员'
                                            }
                                            return roleMap[role] || role
                                        }
                                    },
                                    {
                                        title: '加入时间',
                                        dataIndex: 'joinTime',
                                        key: 'joinTime'
                                    }
                                ]}
                            />
                        </Tabs.TabPane>
                        
                        {/* 空间管理标签 */}
                        <Tabs.TabPane tab="空间管理" key="spaces">
                            <Table 
                                dataSource={spaces} 
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                columns={[
                                    {
                                        title: '空间名称',
                                        dataIndex: 'name',
                                        key: 'name'
                                    },
                                    {
                                        title: '空间描述',
                                        dataIndex: 'description',
                                        key: 'description'
                                    },
                                    {
                                        title: '成员数量',
                                        dataIndex: 'memberCount',
                                        key: 'memberCount'
                                    },
                                    {
                                        title: '创建时间',
                                        dataIndex: 'createdAt',
                                        key: 'createdAt'
                                    },
                                    {
                                        title: '更新时间',
                                        dataIndex: 'updatedAt',
                                        key: 'updatedAt'
                                    },
                                    {
                                        title: '操作',
                                        key: 'action',
                                        render: (_: any, record: Space) => (
                                            <div className="flex space-x-2">
                                                <Button 
                                                    type="link" 
                                                    icon={<EditOutlined />} 
                                                    onClick={() => handleEditSpace(record)}
                                                >
                                                    编辑
                                                </Button>
                                                <Popconfirm
                                                    title="确定要删除此空间吗？"
                                                    onConfirm={() => handleDeleteSpace(record.id)}
                                                    okText="确定"
                                                    cancelText="取消"
                                                >
                                                    <Button 
                                                        type="link" 
                                                        danger 
                                                        icon={<DeleteOutlined />}
                                                    >
                                                        删除
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </Tabs.TabPane>
                    </Tabs>
                    
                    {/* 添加成员模态框 */}
                    <Modal
                        title="添加新成员"
                        open={isAddMemberModalVisible}
                        onOk={handleSubmitAddMember}
                        onCancel={handleCancelAddMember}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Form
                            form={addMemberForm}
                            layout="vertical"
                            initialValues={{}}
                        >
                            <Form.Item
                                name="username"
                                label="用户名"
                                rules={[{ required: true, message: '请输入用户名' }]}
                            >
                                <Input placeholder="请输入用户名" />
                            </Form.Item>
                            
                            <Form.Item
                                name="phone"
                                label="手机号"
                                rules={[{ required: true, message: '请输入手机号' }]}
                            >
                                <Input placeholder="请输入手机号" />
                            </Form.Item>
                            
                            <Form.Item
                                name="email"
                                label="邮箱号"
                                rules={[
                                    { required: true, message: '请输入邮箱号' },
                                    { type: 'email', message: '请输入有效的邮箱地址' }
                                ]}
                            >
                                <Input placeholder="请输入邮箱号" />
                            </Form.Item>
                        </Form>
                    </Modal>
                    
                    {/* 编辑空间模态框 */}
                    <Modal
                        title="编辑空间信息"
                        open={isEditSpaceModalVisible}
                        onOk={handleSubmitEditSpace}
                        onCancel={handleCancelEditSpace}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Form
                            form={editSpaceForm}
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                label="空间名称"
                                rules={[{ required: true, message: '请输入空间名称' }]}
                            >
                                <Input placeholder="请输入空间名称" />
                            </Form.Item>
                            
                            <Form.Item
                                name="description"
                                label="空间描述"
                            >
                                <Input.TextArea placeholder="请输入空间描述" />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
            <DebugMode />
        </div>
    )
}