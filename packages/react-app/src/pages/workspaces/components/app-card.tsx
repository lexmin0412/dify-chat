import { AppModeLabels } from '@dify-chat/core';
import { BaseAppCard } from '@/components';
import { IApp } from '@/types';
import { useHistory } from 'pure-react-router';

interface AppCardProps {
  application: IApp;
}

const AppCard = ({ application }: AppCardProps) => {
  const history = useHistory();

  // 处理应用信息缺失的情况
  if (!application.name) {
    return (
      <BaseAppCard 
        app={application} 
        variant="workspace"
      />
    );
  }

  // 处理应用点击事件
  const handleAppClick = () => {
    history.push(`/app/${application.id}`);
  };

  // 渲染元数据（应用模式）
  const renderMetadata = () => (
    <div className="text-theme-desc text-xs">
      模式: {application.mode ? AppModeLabels[application.mode] : 'unknown'}
    </div>
  );

  return (
    <div onClick={handleAppClick}>
      <BaseAppCard 
        app={application} 
        variant="workspace"
        renderMetadata={renderMetadata}
        onCardClick={handleAppClick}
      />
    </div>
  );
};

export default AppCard;