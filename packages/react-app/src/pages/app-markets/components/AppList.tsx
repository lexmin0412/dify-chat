import { BaseAppList } from '@/components';
import AppCard from './AppCard';
import { IApp } from '@/types';

interface AppListProps {
  apps: IApp[] | undefined;
  loading: boolean;
  error: Error | undefined;
  onRefresh: () => void;
}

const AppList = ({ apps, loading, error, onRefresh }: AppListProps) => {
  // 渲染应用卡片
  const renderAppCard = (app: IApp) => (
    <AppCard key={app.id} app={app} />
  );

  return (
    <BaseAppList
      apps={apps}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      variant="market"
      layout="grid"
      renderAppCard={renderAppCard}
      emptyDescription="暂无应用数据"
      className="p-3 md:p-6"
    />
  );
};

export default AppList;