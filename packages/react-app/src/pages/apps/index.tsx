import { useEffect, useState } from 'react'
import { Layout } from 'antd'

import { Header, DebugMode } from '@/components'
import { useIsMobile } from '@dify-chat/helpers'

import WorkspaceNav from './components/WorkspaceNav'
import WorkspaceManagementView from './components/WorkspaceManagementView'
import AppListView from './components/AppListView'
import { workspaceService, applicationService } from './services'
import { Workspace, Application as ApplicationType, ApplicationInfo} from './types'



const { Sider, Content } = Layout

export default function AppListPage() {
  const isMobile = useIsMobile()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('workspace-1')
  const [isWorkspaceManagement, setIsWorkspaceManagement] = useState<boolean>(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false)
  const [applications, setApplications] = useState<ApplicationType[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false)
  const [applicationsError, setApplicationsError] = useState<Error | undefined>()

  useEffect(() => {
    setWorkspacesLoading(true)
    workspaceService.getWorkspaces().then((res) => {
      setWorkspaces(res || [])
      setWorkspacesLoading(false)
    })
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
          {isWorkspaceManagement ? (
            // Workspace Management Section
            <WorkspaceManagementView
              workspaces={workspaces}
              workspacesLoading={workspacesLoading}
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
              isMobile={isMobile}
            />
          ) : (
            // Application List Section
            <AppListView
            applications={applications}
            loading={applicationsLoading}
            error={applicationsError}
            onRefresh={handleRefreshApplications}
          />
          )}
        </Content>
      </Layout>
      <DebugMode />
    </div>
  )
}
