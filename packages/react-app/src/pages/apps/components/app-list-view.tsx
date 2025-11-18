import { Col, Row, Spin, Empty, Alert, Button, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useIsMobile } from '@dify-chat/helpers';
import { IApplication } from '@/types';
import AppCard from './app-card';
import { useState, useEffect } from 'react';
import { applicationService } from '@/services/application';
import { useHistory } from 'pure-react-router';

interface AppListViewProps {
  workspaceId: string;
}

const AppListView = ({ workspaceId }: AppListViewProps) => {
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [applicationsError, setApplicationsError] = useState<Error | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const history = useHistory()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleWorkspaceSettingClick = () => {
    history.push(`/setting`);
  };

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
    <div className="">
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Button type="primary" size="middle">
          + 创建空间
        </Button>
        <div className="flex gap-2">
          <Button type="primary" size="middle" onClick={handleWorkspaceSettingClick}>
            空间管理
          </Button>
          {/* <Button
            type="default"
            className={`px-4 py-1 rounded-full ${searchKeyword === '' ? 'bg-primary text-white' : ''}`}
          // onClick={() => onSearchChange('')}
          >
            空间管理
          </Button> */}
          {/* <Button
            type="default"
            className={`px-4 py-1 rounded-full ${searchKeyword === '我创建的' ? 'bg-primary text-white' : ''}`}
          // onClick={() => onSearchChange('我创建的')}
          >
            我创建的
          </Button> */}
        </div>
        <Input
          placeholder="搜索应用"
          value={searchKeyword}
          size="small"
          onChange={handleSearchChange}
          prefix={<TagOutlined />}
          allowClear
          className="max-w-sm"
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