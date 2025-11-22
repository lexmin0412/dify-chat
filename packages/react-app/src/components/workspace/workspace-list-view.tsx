import { TagOutlined } from '@ant-design/icons';
import { Button, Input, Row, Col, Spin } from 'antd';
import { useIsMobile } from '@dify-chat/helpers';
import { Workspace } from '@/types';
import WorkspaceCard from './workspace-card';

interface WorkspaceListViewProps {
  workspaces: Workspace[];
  workspacesLoading: boolean;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  isMobile: boolean;
  onEnterManagement?: (workspaceId: string) => void;
}

const WorkspaceListView = ({
  workspaces,
  workspacesLoading,
  searchKeyword,
  onSearchChange,
  isMobile,
  onEnterManagement,
}: WorkspaceListViewProps) => {

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const filteredWorkspaces = workspaces.filter(workspace =>
    searchKeyword === '' ||
    searchKeyword === '我创建的' ||
    workspace.name.includes(searchKeyword)
  );

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Button type="primary" size="middle">
          + 创建空间
        </Button>
        <div className="flex gap-2">
          <Button
            type="default"
            className={`px-4 py-1 rounded-full ${searchKeyword === '' ? 'bg-primary text-white' : ''}`}
            onClick={() => onSearchChange('')}
          >
            全部空间
          </Button>
          <Button
            type="default"
            className={`px-4 py-1 rounded-full ${searchKeyword === '我创建的' ? 'bg-primary text-white' : ''}`}
            onClick={() => onSearchChange('我创建的')}
          >
            我创建的
          </Button>
        </div>
        <Input
          placeholder="搜索空间名称"
          value={searchKeyword}
          size="small"
          onChange={handleSearchChange}
          prefix={<TagOutlined />}
          allowClear
          className="max-w-sm"
        />
      </div>

      {workspacesLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
          <p className="ml-2 text-theme-text">加载空间列表中...</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredWorkspaces.map(workspace => (
            <Col span={isMobile ? 24 : 12} key={workspace.id}>
              <WorkspaceCard workspace={workspace} onEnterManagement={onEnterManagement} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default WorkspaceListView;