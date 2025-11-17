import { Divider, Spin } from 'antd';
import { LucideIcon } from '@/components';
import { Workspace } from '@/types';

interface WorkspaceNavProps {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  isWorkspaceManagement: boolean;
  workspacesLoading: boolean;
  onWorkspaceSelect?: (workspaceId: string) => void;
  onManagementToggle?: () => void;
}

const WorkspaceNav = ({
  workspaces,
  selectedWorkspaceId,
  isWorkspaceManagement,
  workspacesLoading,
  onWorkspaceSelect,
  onManagementToggle,
}: WorkspaceNavProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-theme-text">工作空间</h3>
      {workspacesLoading ? (
        <div className="flex justify-center py-4">
          <Spin size="small" />
        </div>
      ) : (
        <div className="space-y-1">
          {workspaces.map(workspace => (
            <div
              key={workspace.id}
              className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedWorkspaceId === workspace.id && !isWorkspaceManagement
                ? 'bg-primary text-white'
                : 'hover:bg-theme-hover text-theme-text'
                }`}
              onClick={() => onWorkspaceSelect?.(workspace.id)}
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
            onClick={onManagementToggle}
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
  );
};

export default WorkspaceNav;