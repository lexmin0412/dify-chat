import { Button, Tag } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useHistory } from 'pure-react-router';
import { LucideIcon } from '@/components';
import { App } from '../types';

interface AppCardProps {
  app: App;
}

const AppCard = ({ app }: AppCardProps) => {
  const history = useHistory();
  const { id, info } = app;
  
  // 处理应用信息缺失的情况
  if (!info) {
    return (
      <div className="relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary">
        应用信息缺失，请检查
      </div>
    );
  }

  const { name, description, creator, tags, usageCount, conversationCount } = info;
  const hasTags = tags?.length;

  return (
    <div className="relative p-4 bg-[#1e1e1e] border border-[#333] rounded-lg hover:border-blue-500 transition-all duration-200">
      <div>
        <div className="flex items-center overflow-hidden mb-3">
          <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
            <LucideIcon
              name="bot"
              className="text-xl text-blue-400"
            />
          </div>
          <div className="flex-1 overflow-hidden ml-3">
            <div className="truncate font-semibold text-white text-base pr-4">{name}</div>
            <div className="text-xs mt-1 text-gray-400">
              {creator}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-300 leading-5 whitespace-normal line-clamp-2 mb-4">
          {description || '暂无描述'}
        </div>
      </div>
      
      {/* 应用元数据 */}
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <div className="flex items-center mr-4">
          <LucideIcon name="users" size={12} className="mr-1" />
          <span>{usageCount}</span>
        </div>
        <div className="flex items-center mr-4">
          <LucideIcon name="message-square" size={12} className="mr-1" />
          <span>{conversationCount}</span>
        </div>
      </div>
      
      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        <TagOutlined className="mr-2" />
        {hasTags ? (
          tags.map(tag => (
            <Tag key={tag} className="bg-gray-700/50 text-gray-300 border-0 px-2 py-0.5 rounded-full text-xs">
              #{tag}
            </Tag>
          ))
        ) : null}
      </div>
      
      {/* 使用按钮 */}
      <div className="mt-2">
        <Button 
          type="primary" 
          size="middle" 
          block 
          style={{ height: '30px' }}
          onClick={() => {
            history.push(`/app/${id}`);
          }}
        >
          添加到工作空间
        </Button>
      </div>
    </div>
  );
};

export default AppCard;