import { Divider, Spin } from 'antd';
import { LucideIcon } from '@/components';
import { Workspace } from '@/types';

interface WorkspaceNavProps {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  newWorkspaceId?: string | null;
  isWorkspaceManagement: boolean;
  workspacesLoading: boolean;
  onWorkspaceSelect?: (workspaceId: string) => void;
  onManagementToggle?: () => void;
  // 可访问性增强：键盘导航支持
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

const WorkspaceNav = ({
  workspaces,
  selectedWorkspaceId,
  newWorkspaceId,
  isWorkspaceManagement,
  workspacesLoading,
  onWorkspaceSelect,
  onManagementToggle,
}: WorkspaceNavProps) => {
  return (
    <div 
      className="p-4"
      // 可访问性支持：添加键盘导航容器角色
      role="navigation"
      aria-label="工作空间导航"
    >
      <h3 
        className="text-lg font-semibold mb-4 text-theme-text"
        // 可访问性支持
        aria-level={2}
      >工作空间</h3>
      {workspacesLoading ? (
        <div className="flex justify-center py-4">
          <Spin size="small" />
        </div>
      ) : (
        <div className="space-y-1">
          {workspaces.map(workspace => (
            <div
              key={workspace.id}
              className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedWorkspaceId === workspace.id
                ? 'bg-primary text-white'
                : newWorkspaceId === workspace.id
                ? 'bg-primary/20 text-primary animate-pulse'
                : 'hover:bg-theme-hover text-theme-text'
                }`}
              onClick={() => onWorkspaceSelect?.(workspace.id)}
              // 可访问性支持
              role="button"
              tabIndex={0}
              aria-label={`选择工作空间: ${workspace.name}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onWorkspaceSelect?.(workspace.id);
                }
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
              onClick={onManagementToggle}
              // 可访问性支持
              role="button"
              tabIndex={0}
              aria-label="创建新工作空间"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onManagementToggle?.();
                }
              }}
            >
            <LucideIcon
              name="folder-pen"
              size={16}
              className="mr-2"
            />
            <span className="truncate">创建空间</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceNav;