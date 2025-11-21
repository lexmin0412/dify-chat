import { useState } from 'react'
import { Layout, Tooltip } from 'antd'
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

	const { workspaceId: paramsWorkspaceId } = useParams<{ workspaceId: string }>()

    const handleWorkspaceSettingClick = () => {
        setIsWorkspaceSettingVisible(true)
    }

    const handleGoBack = () => {
        setIsWorkspaceSettingVisible(false)
    }

    const handleWorkspaceManagementClick = () => {
        setIsWorkspaceManagement(true)
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
					className={`bg-theme-bg border-r border-theme-border hidden md:block overflow-hidden transition-all`}
					collapsedWidth={48}
					trigger={null} // We'll use our own custom trigger
				>
					<div className={`${sidebarOpen ? 'w-full' : 'w-12'} transition-all h-full flex flex-col`}>
						{sidebarOpen ? (
							<div className="flex-1 overflow-auto">
								<WorkspaceNav
									workspaces={workspaces}
									selectedWorkspaceId={selectedWorkspaceId}
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
											className={`h-10 w-10 flex items-center justify-center mb-2 rounded-md cursor-pointer transition-colors ${
												selectedWorkspaceId === workspace.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
											}`}
											onClick={() => handleWorkspaceSelect(workspace.id)}
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
			</Layout>
			<DebugMode />
		</div>
	)
}
