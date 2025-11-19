import { Empty, Result, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import AppCard from './AppCard';
import { App } from '../types';

interface AppListProps {
  apps: App[] | undefined;
  loading: boolean;
  error: Error | undefined;
  onRefresh: () => void;
}

const AppList = ({ apps, loading, error, onRefresh }: AppListProps) => {
  // 加载状态
  if (loading) {
    return (
      <div className="p-3 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="relative p-4 bg-[#1e1e1e] border border-[#333] rounded-lg animate-pulse">
              <div className="flex items-center overflow-hidden mb-3">
                <div className="h-12 w-12 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 overflow-hidden ml-3">
                  <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="p-12 flex justify-center">
        <Result
          status="error"
          title="加载应用失败"
          subTitle={error.message || '请稍后重试'}
          extra={
            <Button type="primary" onClick={onRefresh} icon={<ReloadOutlined />}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  // 空状态
  if (!apps || apps.length === 0) {
    return (
      <div className="p-12 flex justify-center">
        <Empty
          description="暂无应用数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // 正常状态：展示应用列表
  return (
    <div className="p-3 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apps.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};

export default AppList;