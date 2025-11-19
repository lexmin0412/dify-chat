// import { Header, WorkspaceNav, WorkspaceManagementView, DebugMode } from "@/components";
// import { Layout, Tabs, Button, Modal, Form, Input, Table, Popconfirm, message } from 'antd';
// import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined, LeftOutlined } from '@ant-design/icons';
// import { useState, useEffect } from 'react';
// import { workspaceService } from '@/services/workspace'
// import { applicationService } from '@/services/application'
// import { Workspace, Application as ApplicationType } from '@/types'
// import { BrowserRouter, type IRoute } from 'pure-react-router'
// import { useParams, useLocation } from 'pure-react-router'

// const { Sider, Content } = Layout

// // 定义用户接口
// interface User {
//   id: string;
//   username: string;
//   phone: string;
//   email: string;
//   avatar?: string;
//   role: 'owner' | 'member' | 'admin';
//   joinTime: string;
// }

// // 定义空间接口扩展
// interface Space extends Workspace {
//   createdAt: string;
//   updatedAt: string;
// }

// export default function Workspaces() {
//     const { workspaceId } = useParams<{ workspaceId: string }>();
//     const location = useLocation();
//     const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaceId || 'workspace-1')
//     const [isWorkspaceManagement, setIsWorkspaceManagement] = useState<boolean>(false)
//     const [searchKeyword, setSearchKeyword] = useState<string>('')
//     const [workspaces, setWorkspaces] = useState<Workspace[]>([])
//     const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
//     const [applications, setApplications] = useState<ApplicationType[]>([])
//     const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false)
//     const [applicationsError, setApplicationsError] = useState<Error | undefined>()
//     const [collapsed, setCollapsed] = useState(false)
    
//     // 多标签状态
//     const [activeTab, setActiveTab] = useState<string>('members')
    
//     // 用户数据状态
//     const [users, setUsers] = useState<User[]>([])
    
//     // 空间数据状态
//     const [spaces, setSpaces] = useState<Space[]>([])
    
//     // 模态框状态
//     const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState<boolean>(false)
//     const [isEditSpaceModalVisible, setIsEditSpaceModalVisible] = useState<boolean>(false)
    
//     // 表单状态
//     const [addMemberForm] = Form.useForm()
//     const [editSpaceForm] = Form.useForm()
    
//     // 编辑中的空间
//     const [editingSpace, setEditingSpace] = useState<Space | null>(null)
    
//     // 高亮显示逻辑
//     useEffect(() => {
//         if (workspaceId) {
//             setSelectedWorkspaceId(workspaceId);
//             // 检查是否有高亮参数
//             const urlParams = new URLSearchParams(location.search);
//             const highlight = urlParams.get('highlight');
//             if (highlight === 'true') {
//                 message.success(`已切换到工作空间 ${workspaceId}`);
//                 // 可以在这里添加更多高亮逻辑，比如改变背景色或添加动画
//             }
//         }
//     }, [workspaceId, location.search]);
    
//     // 初始化模拟数据
//     useEffect(() => {
//         setWorkspacesLoading(true)
//         workspaceService.getWorkspaces().then((res) => {
//             setWorkspaces(res || [])
//             setWorkspacesLoading(false)
            
//             // 初始化模拟空间数据
//             const mockSpaces: Space[] = (res || []).map(workspace => ({
//                 ...workspace,
//                 createdAt: '2024-01-01',
//                 updatedAt: '2024-01-02'
//             }))
//             setSpaces(mockSpaces)
//         })
        
//         // 初始化模拟用户数据
//         const mockUsers: User[] = [
//             {
//                 id: '1',
//                 username: 'admin',
//                 phone: '13800138000',
//                 email: 'admin@example.com',
//                 avatar: '',
//                 role: 'owner',
//                 joinTime: '2024-01-01 10:00:00'
//             },
//             {
//                 id: '2',
//                 username: 'user1',
//                 phone: '13800138001',
//                 email: 'user1@example.com',
//                 avatar: '',
//                 role: 'member',
//                 joinTime: '2024-01-02 14:30:00'
//             },
//             {
//                 id: '3',
//                 username: 'user2',
//                 phone: '13800138002',
//                 email: 'user2@example.com',
//                 avatar: '',
//                 role: 'member',
//                 joinTime: '2024-01-03 09:15:00'
//             }
//         ]
//         setUsers(mockUsers)
        
//     }, [])

//     useEffect(() => {
//         if (selectedWorkspaceId) {
//             setApplicationsLoading(true)
//             setApplicationsError(undefined)
//             applicationService.getApplicationsByWorkspaceId(selectedWorkspaceId)
//                 .then((res) => {
//                     setApplications(res || [])
//                     setApplicationsLoading(false)
//                 })
//                 .catch((error) => {
//                     setApplicationsError(error)
//                     setApplicationsLoading(false)
//                 })
//         }
//     }, [selectedWorkspaceId])

//     const handleRefreshApplications = () => {
//         if (selectedWorkspaceId) {
//             setApplicationsLoading(true)
//             setApplicationsError(undefined)
//             applicationService.getApplicationsByWorkspaceId(selectedWorkspaceId)
//                 .then((res) => {
//                     setApplications(res || [])
//                     setApplicationsLoading(false)
//                 })
//                 .catch((error) => {
//                     setApplicationsError(error)
//                     setApplicationsLoading(false)
//                 })
//         }
//     }

//     const handleWorkspaceSelect = (workspaceId: string) => {
//         setSelectedWorkspaceId(workspaceId)
//         setIsWorkspaceManagement(false)
//     }

//     const handleWorkspaceManagementEnter = () => {
//         setIsWorkspaceManagement(true)
//         setSelectedWorkspaceId('')
//     }
    
//     // 标签页切换处理
//     const handleTabChange = (key: string) => {
//         setActiveTab(key)
//     }
    
//     // 打开添加成员模态框
//     const handleAddMember = () => {
//         setIsAddMemberModalVisible(true)
//     }
    
//     // 关闭添加成员模态框
//     const handleCancelAddMember = () => {
//         setIsAddMemberModalVisible(false)
//         addMemberForm.resetFields()
//     }
    
//     // 提交添加成员表单
//     const handleSubmitAddMember = () => {
//         addMemberForm.validateFields()
//             .then(values => {
//                 // 创建新用户
//                 const newUser: User = {
//                     id: Date.now().toString(),
//                     username: values.username,
//                     phone: values.phone,
//                     email: values.email,
//                     avatar: '',
//                     role: 'member',
//                     joinTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
//                 }
                
//                 // 更新用户列表
//                 setUsers([...users, newUser])
                
//                 // 关闭模态框并重置表单
//                 setIsAddMemberModalVisible(false)
//                 addMemberForm.resetFields()
                
//                 // 显示成功消息
//                 message.success('成员添加成功')
//             })
//             .catch(info => {
//                 console.log('表单验证失败:', info)
//             })
//     }
    
//     // 打开编辑空间模态框
//     const handleEditSpace = (space: Space) => {
//         setEditingSpace(space)
//         editSpaceForm.setFieldsValue({
//             name: space.name,
//             description: space.description
//         })
//         setIsEditSpaceModalVisible(true)
//     }
    
//     // 关闭编辑空间模态框
//     const handleCancelEditSpace = () => {
//         setIsEditSpaceModalVisible(false)
//         setEditingSpace(null)
//         editSpaceForm.resetFields()
//     }
    
//     // 提交编辑空间表单
//     const handleSubmitEditSpace = () => {
//         editSpaceForm.validateFields()
//             .then(values => {
//                 if (editingSpace) {
//                     // 更新空间信息
//                     const updatedSpaces = spaces.map(space => 
//                         space.id === editingSpace.id 
//                             ? { ...space, ...values, updatedAt: new Date().toISOString().slice(0, 10) }
//                             : space
//                     )
//                     setSpaces(updatedSpaces)
                    
//                     // 关闭模态框并重置表单
//                     setIsEditSpaceModalVisible(false)
//                     setEditingSpace(null)
//                     editSpaceForm.resetFields()
                    
//                     // 显示成功消息
//                     message.success('空间信息更新成功')
//                 }
//             })
//             .catch(info => {
//                 console.log('表单验证失败:', info)
//             })
//     }
    
//     // 删除空间
//     const handleDeleteSpace = (spaceId: string) => {
//         const updatedSpaces = spaces.filter(space => space.id !== spaceId)
//         setSpaces(updatedSpaces)
//         message.success('空间删除成功')
//     }
    
//     // 删除用户
//     const handleDeleteUser = (userId: string) => {
//         const updatedUsers = users.filter(user => user.id !== userId)
//         setUsers(updatedUsers)
//         message.success('成员删除成功')
//     }
    
//     // 用户表格列定义
//     const userColumns = [
//         {
//             title: '用户名',
//             dataIndex: 'username',
//             key: 'username',
//         },
//         {
//             title: '手机号',
//             dataIndex: 'phone',
//             key: 'phone',
//         },
//         {
//             title: '邮箱',
//             dataIndex: 'email',
//             key: 'email',
//         },
//         {
//             title: '角色',
//             dataIndex: 'role',
//             key: 'role',
//             render: (role: string) => {
//                 const roleMap: { [key: string]: { text: string; color: string } } = {
//                     owner: { text: '所有者', color: 'red' },
//                     admin: { text: '管理员', color: 'blue' },
//                     member: { text: '成员', color: 'green' }
//                 }
//                 const roleInfo = roleMap[role] || { text: role, color: 'default' }
//                 return <span style={{ color: roleInfo.color }}>{roleInfo.text}</span>
//             }
//         },
//         {
//             title: '加入时间',
//             dataIndex: 'joinTime',
//             key: 'joinTime',
//         },
//         {
//             title: '操作',
//             key: 'action',
//             render: (text: any, record: User) => (
//                 <Popconfirm
//                     title="确定要删除这个成员吗？"
//                     onConfirm={() => handleDeleteUser(record.id)}
//                     okText="确定"
//                     cancelText="取消"
//                 >
//                     <Button type="link" danger size="small">
//                         删除
//                     </Button>
//                 </Popconfirm>
//             ),
//         },
//     ]
    
//     // 空间表格列定义
//     const spaceColumns = [
//         {
//             title: '空间名称',
//             dataIndex: 'name',
//             key: 'name',
//         },
//         {
//             title: '描述',
//             dataIndex: 'description',
//             key: 'description',
//         },
//         {
//             title: '成员数量',
//             dataIndex: 'memberCount',
//             key: 'memberCount',
//         },
//         {
//             title: '创建时间',
//             dataIndex: 'createdAt',
//             key: 'createdAt',
//         },
//         {
//             title: '更新时间',
//             dataIndex: 'updatedAt',
//             key: 'updatedAt',
//         },
//         {
//             title: '操作',
//             key: 'action',
//             render: (text: any, record: Space) => (
//                 <div>
//                     <Button 
//                         type="link" 
//                         size="small"
//                         onClick={() => handleEditSpace(record)}
//                     >
//                         编辑
//                     </Button>
//                     <Popconfirm
//                         title="确定要删除这个空间吗？"
//                         onConfirm={() => handleDeleteSpace(record.id)}
//                         okText="确定"
//                         cancelText="取消"
//                     >
//                         <Button type="link" danger size="small">
//                             删除
//                         </Button>
//                     </Popconfirm>
//                 </div>
//             ),
//         },
//     ]
    
//     // 应用表格列定义
//     const applicationColumns = [
//         {
//             title: '应用名称',
//             dataIndex: ['info', 'name'],
//             key: 'name',
//         },
//         {
//             title: '描述',
//             dataIndex: ['info', 'description'],
//             key: 'description',
//         },
//         {
//             title: '模式',
//             dataIndex: ['info', 'mode'],
//             key: 'mode',
//         },
//         {
//             title: '标签',
//             dataIndex: ['info', 'tags'],
//             key: 'tags',
//             render: (tags: string[]) => tags?.join(', ') || '-'
//         },
//     ]
    
//     // 标签页配置
//     const tabItems = [
//         {
//             key: 'members',
//             label: '成员管理',
//             children: (
//                 <div>
//                     <div style={{ marginBottom: 16 }}>
//                         <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMember}>
//                             添加成员
//                         </Button>
//                     </div>
//                     <Table 
//                         columns={userColumns} 
//                         dataSource={users} 
//                         rowKey="id"
//                         pagination={{ pageSize: 10 }}
//                     />
//                 </div>
//             )
//         },
//         {
//             key: 'applications',
//             label: '应用管理',
//             children: (
//                 <div>
//                     <div style={{ marginBottom: 16 }}>
//                         <Button onClick={handleRefreshApplications}>
//                             刷新应用列表
//                         </Button>
//                     </div>
//                     <Table 
//                         columns={applicationColumns} 
//                         dataSource={applications} 
//                         rowKey="id"
//                         loading={applicationsLoading}
//                         pagination={{ pageSize: 10 }}
//                     />
//                     {applicationsError && (
//                         <div style={{ color: 'red', marginTop: 16 }}>
//                             加载应用失败: {applicationsError.message}
//                         </div>
//                     )}
//                 </div>
//             )
//         },
//         {
//             key: 'spaces',
//             label: '空间设置',
//             children: (
//                 <Table 
//                     columns={spaceColumns} 
//                     dataSource={spaces} 
//                     rowKey="id"
//                     pagination={{ pageSize: 10 }}
//                 />
//             )
//         },
//     ]
    
//     return (
//         <Layout style={{ minHeight: '100vh' }}>
//             <Header />
//             <Layout>
//                 <Sider 
//                     width={300} 
//                     style={{ background: '#fff' }}
//                     collapsible
//                     collapsed={collapsed}
//                     onCollapse={setCollapsed}
//                 >
//                     <WorkspaceNav
//                         workspaces={workspaces}
//                         selectedWorkspaceId={selectedWorkspaceId}
//                         onSelect={handleWorkspaceSelect}
//                         onManagementEnter={handleWorkspaceManagementEnter}
//                         isManagement={isWorkspaceManagement}
//                         loading={workspacesLoading}
//                         searchKeyword={searchKeyword}
//                         onSearchChange={setSearchKeyword}
//                     />
//                 </Sider>
//                 <Layout>
//                     <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
//                         {isWorkspaceManagement ? (
//                             <WorkspaceManagementView />
//                         ) : (
//                             <div>
//                                 <h2>工作空间管理</h2>
//                                 <Tabs items={tabItems} onChange={handleTabChange} />
//                             </div>
//                         )}
//                     </Content>
//                 </Layout>
//             </Layout>
            
//             {/* 添加成员模态框 */}
//             <Modal
//                 title="添加成员"
//                 open={isAddMemberModalVisible}
//                 onOk={handleSubmitAddMember}
//                 onCancel={handleCancelAddMember}
//                 okText="确定"
//                 cancelText="取消"
//             >
//                 <Form form={addMemberForm} layout="vertical">
//                     <Form.Item
//                         name="username"
//                         label="用户名"
//                         rules={[{ required: true, message: '请输入用户名' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="phone"
//                         label="手机号"
//                         rules={[{ required: true, message: '请输入手机号' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="email"
//                         label="邮箱"
//                         rules={[
//                             { required: true, message: '请输入邮箱' },
//                             { type: 'email', message: '请输入有效的邮箱地址' }
//                         ]}
//                     >
//                         <Input />
//                     </Form.Item>
//                 </Form>
//             </Modal>
            
//             {/* 编辑空间模态框 */}
//             <Modal
//                 title="编辑空间"
//                 open={isEditSpaceModalVisible}
//                 onOk={handleSubmitEditSpace}
//                 onCancel={handleCancelEditSpace}
//                 okText="确定"
//                 cancelText="取消"
//             >
//                 <Form form={editSpaceForm} layout="vertical">
//                     <Form.Item
//                         name="name"
//                         label="空间名称"
//                         rules={[{ required: true, message: '请输入空间名称' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="description"
//                         label="空间描述"
//                     >
//                         <Input.TextArea rows={4} />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </Layout>
//     )
// }