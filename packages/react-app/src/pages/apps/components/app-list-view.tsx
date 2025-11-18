import { Col, Row, Spin, Empty, Alert } from 'antd';
import { useIsMobile } from '@dify-chat/helpers';
import { IApplication } from '@/types';
import AppCard from './app-card';
import { useState, useEffect } from 'react';
import { applicationService } from '@/services/application';

interface AppListViewProps {
  workspaceId: string;
}

const AppListView = ({ workspaceId }: AppListViewProps) => {
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [applicationsError, setApplicationsError] = useState<Error | undefined>();

  useEffect(() => {
    if (workspaceId) {
      setApplicationsLoading(true)
      setApplicationsError(undefined)
      applicationService.getApplicationsByWorkspaceId(workspaceId)
        .then((res) => {
          setApplications(res || [])
          setApplicationsLoading(false)
        })
        .catch((error) => {
          setApplicationsError(error)
          setApplicationsLoading(false)
        })
    }
  }, [workspaceId])

  const onRefresh = () => {
    if (workspaceId) {
      setApplicationsLoading(true)
      setApplicationsError(undefined)
      applicationService.getApplicationsByWorkspaceId(workspaceId)
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
    <Row gutter={[16, 16]}>
      {applications.map(item => (
        <Col key={item.id} span={isMobile ? 24 : 6}>
          <AppCard application={item} />
        </Col>
      ))}
    </Row>
  );
};

export default AppListView;