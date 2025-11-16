import { Button } from 'antd';
import { LucideIcon } from '@/components';
import { Workspace } from '../types';
import { useHistory } from 'pure-react-router';

interface WorkspaceCardProps {
  workspace: Workspace;
}

const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const history = useHistory();

  const handleEnterManagement = () => {
    // Navigate to workspace management page
    history.push(`/workspaces/${workspace.id}`);
  };

  return (
    <div className="relative group p-4 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl">
      <div className="flex items-start">
        <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
          <LucideIcon
            name="users"
            className="text-xl text-purple-500"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-theme-text mb-1">{workspace.name}</h3>
          <p className="text-sm text-theme-desc mb-3 line-clamp-2">{workspace.description}</p>
          <div className="flex items-center text-xs text-theme-desc">
            <LucideIcon
              name="user"
              size={12}
              className="mr-1"
            />
            <span>当前成员：{workspace.memberCount} 名</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          size="small"
          className="bg-primary text-white"
          onClick={handleEnterManagement}
        >
          进入管理
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceCard;