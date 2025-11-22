import { Button, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { BaseAppList } from '@/components';
import { IApp } from '@/types';
import AppCard from './app-card';
import { useState, useEffect, useCallback } from 'react';
import { applicationService } from '@/services/application';

interface AppListViewProps {
  workspaceId: string;
  handleWorkspaceSettingClick: () => void;
}

const AppListView = ({ workspaceId, handleWorkspaceSettingClick }: AppListViewProps) => {
  const [applications, setApplications] = useState<IApp[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [applicationsError, setApplicationsError] = useState<Error | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  }, []);

  const fetchApplications = useCallback(async (workspaceId: string) => {
    setApplicationsLoading(true);
    setApplicationsError(undefined);
    
    try {
      const res = await applicationService.getApplicationsByWorkspaceId(workspaceId);
      setApplications(res || []);
    } catch (error) {
      setApplicationsError(error as Error);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workspaceId) {
      fetchApplications(workspaceId);
    }
  }, [workspaceId, fetchApplications]);

  const onRefresh = useCallback(() => {
    if (workspaceId) {
      fetchApplications(workspaceId);
    }
  }, [workspaceId, fetchApplications]);

  // 过滤应用
  const filteredApplications = applications.filter(app => 
    !searchKeyword || 
    app.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="">
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Button type="primary" size="middle">
          + 添加应用
        </Button>
        <div className="flex gap-2">
          <Button type="primary" size="middle" onClick={handleWorkspaceSettingClick}>
            空间管理
          </Button>
        </div>
        <Input
          placeholder="搜索应用"
          value={searchKeyword}
          size="small"
          onChange={handleSearchChange}
          prefix={<TagOutlined />}
          allowClear
          className="max-w-sm"
          style={{ width: 200 }}
        />
      </div>
      
      <BaseAppList
        apps={filteredApplications}
        loading={applicationsLoading}
        error={applicationsError}
        onRefresh={onRefresh}
        variant="workspace"
        layout="grid"
        skeletonCount={8}
        renderAppCard={(app, index) => (
          <AppCard 
            key={app.id} 
            application={app}
          />
        )}
        emptyDescription="该工作空间暂无应用"
      />
    </div>
  );
};

export default AppListView;