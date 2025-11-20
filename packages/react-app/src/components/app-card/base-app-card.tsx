import { TagOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { LucideIcon } from '@/components';
import { IApp } from '@/types';

/**
 * 统一的应用数据类型，支持应用市场和工作室的应用
 */
// export type AppData = IApp;

/**
 * 应用卡片变体类型
 */
export type AppCardVariant = 'market' | 'workspace';

/**
 * 应用卡片属性接口
 */
export interface BaseAppCardProps {
  /** 应用数据 */
  app: IApp;
  /** 卡片变体类型 */
  variant: AppCardVariant;
  /** 点击卡片的回调函数 */
  onCardClick?: () => void;
  /** 渲染自定义操作按钮 */
  renderActions?: () => React.ReactNode;
  /** 渲染自定义元数据 */
  renderMetadata?: () => React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 判断是否为应用市场应用
 */
function isMarketApp(app: IApp): app is IApp {
  return 'creator' in app && 'usageCount' in app;
}

/**
 * 判断是否为工作室应用
 */
function isWorkspaceApp(app: IApp): boolean {
  return !!app.workspaceId;
}

/**
 * 获取应用名称
 */
function getAppName(app: IApp): string {
    return app.name || '';
}

/**
 * 获取应用描述
 */
function getAppDescription(app: IApp): string {
    return app.description || '暂无描述';
}

/**
 * 获取应用标签
 */
function getAppTags(app: IApp): string[] {
    return app.tags || [];
}

/**
 * 获取应用副标题信息
 */
function getAppSubtitle(app: IApp): string {
//   if (isMarketApp(app)) {
//     return app.creator;
//   }
//   if (isWorkspaceApp(app)) {
//     // 这里可以根据需要显示应用模式或其他信息
//     return app.mode || 'unknown';
//   }
  return app.mode || 'unknown';
}

/**
 * 基础应用卡片组件
 * 支持应用市场和工作室两种变体，提供统一的卡片展示逻辑
 */
const BaseAppCard = ({
  app,
  variant,
  onCardClick,
  renderActions,
  renderMetadata,
  className = '',
  style
}: BaseAppCardProps) => {
  const appName = getAppName(app);
  const appDescription = getAppDescription(app);
  const appTags = getAppTags(app);
  const appSubtitle = getAppSubtitle(app);
  const hasTags = appTags.length > 0;

  // 处理应用信息缺失的情况
  if (!appName) {
    return (
      <div className={`relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary ${className}`}>
        应用信息缺失，请检查
      </div>
    );
  }

  // 根据变体选择样式
//   const isMarketVariant = variant === 'market';
  const isMarketVariant = false;
  const cardClasses = isMarketVariant
    ? 'relative p-4 bg-[#1e1e1e] border border-[#333] rounded-lg hover:border-blue-500 transition-all duration-200'
    : 'relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary';

  const iconContainerClasses = isMarketVariant
    ? 'h-12 w-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center'
    : 'h-10 w-10 bg-[#ffead5] dark:bg-transparent border border-solid border-transparent dark:border-theme-border rounded-lg flex items-center justify-center';

  const iconClasses = isMarketVariant
    ? 'text-xl text-blue-400'
    : 'text-xl text-theme-text';

  const textClasses = isMarketVariant
    ? 'text-white'
    : 'text-theme-text';

  const descClasses = isMarketVariant
    ? 'text-gray-300'
    : 'text-theme-desc';

  const subtitleClasses = isMarketVariant
    ? 'text-xs mt-1 text-gray-400'
    : 'text-theme-desc text-xs mt-0.5';

  return (
    <div 
      className={`${cardClasses} ${className}`}
      style={style}
      onClick={onCardClick}
    >
      {/* 应用头部信息 */}
      <div className="flex items-center overflow-hidden mb-3">
        <div className={iconContainerClasses}>
          <LucideIcon
            name="bot"
            className={iconClasses}
          />
        </div>
        <div className="flex-1 overflow-hidden ml-3">
          <div className={`truncate font-semibold pr-4 ${textClasses}`}>
            {appName}
          </div>
          <div className={subtitleClasses}>
            {appSubtitle}
          </div>
        </div>
      </div>

      {/* 应用描述 */}
      <div className={`text-sm leading-5 whitespace-normal line-clamp-2 mb-4 ${descClasses}`}>
        {appDescription}
      </div>

      {/* 自定义元数据渲染 */}
      {renderMetadata && (
        <div className="mb-3">
          {renderMetadata()}
        </div>
      )}

      {/* 应用标签 */}
      {hasTags && (
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          <TagOutlined className="mr-2" />
          {appTags.map(tag => (
            <Tag 
              key={tag} 
              className="bg-gray-700/50 text-gray-300 border-0 px-2 py-0.5 rounded-full text-xs"
            >
              #{tag}
            </Tag>
          ))}
        </div>
      )}

      {/* 自定义操作按钮渲染 */}
      {renderActions && (
        <div className="mt-2">
          {renderActions()}
        </div>
      )}
    </div>
  );
};

export default BaseAppCard;