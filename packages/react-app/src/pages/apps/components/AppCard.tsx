import { TagOutlined } from '@ant-design/icons';
import { AppModeLabels } from '@dify-chat/core';
import { Tag } from 'antd';
import { LucideIcon } from '@/components';
import { Application } from '../types';
import { useHistory } from 'pure-react-router';

interface AppCardProps {
  application: Application;
}

const AppCard = ({ application }: AppCardProps) => {
  const history = useHistory();
  const item = application;

  // Handle case where info might be missing
  if (!item.info) {
    return (
      <div className="relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary">
        应用信息缺失，请检查
      </div>
    );
  }

  const hasTags = item.info.tags?.length;

  const handleAppClick = () => {
    history.push(`/app/${item.id}`);
  };

  return (
    <div className="relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary">
      <div onClick={handleAppClick}>
        <div className="flex items-center overflow-hidden">
          <div className="h-10 w-10 bg-[#ffead5] dark:bg-transparent border border-solid border-transparent dark:border-theme-border rounded-lg flex items-center justify-center">
            <LucideIcon
              name="bot"
              className="text-xl text-theme-text"
            />
          </div>
          <div className="flex-1 overflow-hidden ml-3 text-theme-text h-10 flex flex-col justify-between">
            <div className="truncate font-semibold pr-4">{item.info.name}</div>
            <div className="text-theme-desc text-xs mt-0.5">
              {item.info.mode ? AppModeLabels[item.info.mode] : 'unknown'}
            </div>
          </div>
        </div>
        <div className="text-sm mt-3 h-10 overflow-hidden text-ellipsis leading-5 whitespace-normal line-clamp-2 text-theme-desc">
          {item.info.description || '暂无描述'}
        </div>
      </div>
      <div className="flex items-center text-desc truncate mt-3 h-4">
        {hasTags ? (
          <>
            <TagOutlined className="mr-2" />
            {item.info.tags.map(tag => (
              <Tag key={tag} className="bg-gray-700/50 text-gray-300 border-0 px-2 py-0.5 rounded-full text-xs">
                #{tag}
              </Tag>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AppCard;