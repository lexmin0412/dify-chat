import { useEffect, useState } from 'react'
import { Layout } from 'antd'

import { Header, DebugMode, WorkspaceNav } from '@/components'

import { workspaceService } from '@/services/workspace'
import { Workspace } from '@/types'
import AppListView from './components/app-list-view'

const { Sider, Content } = Layout

export default function AppListPage() {
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('workspace-1')
	const [workspaces, setWorkspaces] = useState<Workspace[]>([])
	const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
	// const [collapsed, setCollapsed] = useState(false)

	useEffect(() => {
		setWorkspacesLoading(true)
		workspaceService.getWorkspaces().then((res) => {
			setWorkspaces(res || [])
			setWorkspacesLoading(false)
		})
	}, [])

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
					className="bg-theme-bg border-r border-theme-border hidden md:block"
					// collapsible
					// collapsed={collapsed}
					// onCollapse={(value) => setCollapsed(value)}
				>
					<WorkspaceNav
						workspaces={workspaces}
						selectedWorkspaceId={selectedWorkspaceId}
						workspacesLoading={workspacesLoading}
						onWorkspaceSelect={handleWorkspaceSelect}
					// onManagementToggle={handleWorkspaceManagementEnter}
					/>
				</Sider>

				{/* Main Content Area */}
				<Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
					{selectedWorkspaceId && <AppListView workspaceId={selectedWorkspaceId} />}
				</Content>
			</Layout>
			<DebugMode />
		</div>
	)
}
