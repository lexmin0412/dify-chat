import { Col, Row, Spin, Empty, Alert, Button, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useIsMobile } from '@dify-chat/helpers';
import { IApplication } from '@/types';
import AppCard from './app-card';
import { useState, useEffect, useCallback } from 'react';
import { applicationService } from '@/services/application';

interface AppListViewProps {
  workspaceId: string;
  handleWorkspaceSettingClick: () => void;
}

const AppListView = ({ workspaceId, handleWorkspaceSettingClick }: AppListViewProps) => {
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [applicationsError, setApplicationsError] = useState<Error | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  }, []);

//   const handleWorkspaceSettingClick = () => {
//     history.push(`/setting`);
//   };

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

  if (applicationsError) {
    return (
      <div className="flex justify-center items-center h-48">
        <Alert
          message="获取应用列表失败"
          description="请稍后重试"
          type="error"
          showIcon
          action={<button onClick={onRefresh} className="text-primary hover:underline">重新加载</button>}
        />
      </div>
    );
  }

  if (applicationsLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spin size="large" />
        <p className="ml-2 text-theme-text">加载应用列表中...</p>
      </div>
    );
  }

  if (!Array.isArray(applications) || !applications.length) {
    return (
      <div className="w-full h-full box-border flex flex-col items-center justify-center px-3">
        <Empty description="暂无应用" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Button type="primary" size="middle">
          + 创建应用
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
      <Row gutter={[16, 16]}>
        {applications.map(item => (
          <Col key={item.id} span={isMobile ? 24 : 6}>
            <AppCard application={item} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AppListView;