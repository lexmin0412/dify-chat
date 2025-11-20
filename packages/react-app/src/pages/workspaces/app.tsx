// import { useEffect, useState } from 'react'
// import { Layout } from 'antd'

// import { Header, DebugMode, WorkspaceNav, WorkspaceListView } from '@/components'
// import { useIsMobile } from '@dify-chat/helpers'

// import { workspaceService } from '@/services/workspace'
// import { applicationService } from '@/services/application'
// import { Workspace, IApp as ApplicationType } from '@/types'
// import AppListView from './components/app-list-view'
// import WorkspaceManagementView from '../../components/workspace/workspace-management-view'



// const { Sider, Content } = Layout

// export default function AppListPage() {
//     const isMobile = useIsMobile()
//     const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('')
//     const [isWorkspaceManagement, setIsWorkspaceManagement] = useState<boolean>(false)
//     const [searchKeyword, setSearchKeyword] = useState<string>('')
//     const [workspaces, setWorkspaces] = useState<Workspace[]>([])
//     const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
//     const [applications, setApplications] = useState<ApplicationType[]>([])
//     const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false)
//     const [applicationsError, setApplicationsError] = useState<Error | undefined>()
//     const [collapsed, setCollapsed] = useState(false)
//     const [transitionKey, setTransitionKey] = useState<number>(0)

//     useEffect(() => {
//         setWorkspacesLoading(true)
//         workspaceService.getWorkspaces().then((res) => {
//             setWorkspaces(res || [])
//             setWorkspacesLoading(false)
//         })
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
//         // Force re-render with new transition key for animation
//         setTransitionKey(prev => prev + 1)
//     }

//     const handleWorkspaceManagementEnter = () => {
//         setIsWorkspaceManagement(true)
//         setSelectedWorkspaceId('')
//         // Force re-render with new transition key for animation
//         setTransitionKey(prev => prev + 1)
//     }

//     // 监听浏览器历史记录变化，确保回退时侧边栏高亮正确选项
//     useEffect(() => {
//         const handlePopState = () => {
//             // 当发生回退操作时，确保侧边栏高亮正确选项
//             setIsWorkspaceManagement(false)
//             setSelectedWorkspaceId('')
//             // Force re-render with new transition key for animation
//             setTransitionKey(prev => prev + 1)
//         }
        
//         // 添加popstate事件监听器
//         window.addEventListener('popstate', handlePopState)
        
//         // 组件卸载时移除监听器
//         return () => {
//             window.removeEventListener('popstate', handlePopState)
//         }
//     }, [])

//     return (
//         <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
//             <Header />
//             <Layout className="flex-1 overflow-hidden">
//                 {/* Workspace Navigation Panel */}
//                 <Sider
//                     width={240}
//                     className="bg-theme-bg border-r border-theme-border hidden md:block"
//                     collapsible
//                     collapsed={collapsed} 
//                     onCollapse={(value) => setCollapsed(value)}
//                 >
//                     <WorkspaceNav
//                         workspaces={workspaces}
//                         selectedWorkspaceId={selectedWorkspaceId}
//                         isWorkspaceManagement={isWorkspaceManagement}
//                         workspacesLoading={workspacesLoading}
//                         onWorkspaceSelect={handleWorkspaceSelect}
//                         onManagementToggle={handleWorkspaceManagementEnter}
//                     />
//                 </Sider>

//                 {/* Main Content Area */}
//             <Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
//                 <div 
//                     key={transitionKey}
//                     className="transition-all duration-300 ease-in-out transform"
//                     style={{ 
//                         opacity: 0, 
//                         animation: 'fadeIn 0.3s forwards'
//                     }}
//                 >
//                     {isWorkspaceManagement ? (
//                         // Workspace Management Section
//                         <WorkspaceManagementView
//                             workspaces={workspaces}
//                             workspacesLoading={workspacesLoading}
//                             searchKeyword={searchKeyword}
//                             onSearchChange={setSearchKeyword}
//                             isMobile={isMobile}
//                             onBack={() => {
//                                 // 回退时确保侧边栏高亮正确选项
//                                 setIsWorkspaceManagement(false)
//                                 setSelectedWorkspaceId('')
//                                 // Force re-render with new transition key for animation
//                                 setTransitionKey(prev => prev + 1)
//                             }}
//                         />
//                     ) : selectedWorkspaceId ? (
//                         // Application List Section
//                         <AppListView
//                             // applications={applications}
//                             // loading={applicationsLoading}
//                             // error={applicationsError}
//                             // onRefresh={handleRefreshApplications}
//                         />
//                     ) : (
//                         // Workspace List View (default)
//                         <WorkspaceListView
//                             workspaces={workspaces}
//                             workspacesLoading={workspacesLoading}
//                             searchKeyword={searchKeyword}
//                             onSearchChange={setSearchKeyword}
//                             isMobile={isMobile}
//                             onEnterManagement={handleWorkspaceSelect}
//                         />
//                     )}
//                 </div>
//             </Content>
//             </Layout>
//             <DebugMode />
//         </div>
//     )
// }
