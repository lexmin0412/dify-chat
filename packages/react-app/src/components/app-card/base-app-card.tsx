import { TagOutlined } from '@ant-design/icons';
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
function isMarketApp(app: IApp): app is IApp & { creator?: string; usageCount?: number; conversationCount?: number } {
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
function getAppSubtitle(app: IApp, variant: AppCardVariant): string {
  if (variant === 'market' && isMarketApp(app)) {
    return app.creator || '未知创作者';
  }
  if (variant === 'workspace' && isWorkspaceApp(app)) {
    return app.mode || 'unknown';
  }
  return app.mode || 'unknown';
}

/**
 * 渲染应用市场特有的元数据
 */
function renderMarketMetadata(app: IApp & { usageCount?: number; conversationCount?: number }): React.ReactNode {
  const hasUsageData = app.usageCount !== undefined || app.conversationCount !== undefined;
  
  if (!hasUsageData) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-xs mb-3">
      {app.usageCount !== undefined && (
        <div className="flex items-center gap-1">
          <span className="text-theme-desc">使用次数:</span>
          <span className="text-theme-text font-medium">{app.usageCount}</span>
        </div>
      )}
      {app.conversationCount !== undefined && (
        <div className="flex items-center gap-1">
          <span className="text-theme-desc">对话次数:</span>
          <span className="text-theme-text font-medium">{app.conversationCount}</span>
        </div>
      )}
    </div>
  );
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
  const appSubtitle = getAppSubtitle(app, variant);
  const hasTags = appTags.length > 0;

  // 处理应用信息缺失的情况
  if (!appName) {
    return (
      <div className={`relative group p-4 bg-theme-btn-bg border border-solid border-theme-border rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all duration-200 ${className}`}>
        应用信息缺失，请检查
      </div>
    );
  }

  // 统一的基础样式类
  const baseCardClasses = [
    'relative',
    'group',
    'p-4',
    'bg-theme-btn-bg',
    'border',
    'border-solid',
    'border-theme-border',
    'rounded-xl',
    'cursor-pointer',
    'hover:border-primary',
    'hover:shadow-sm',
    'transition-all',
    'duration-200'
  ].join(' ');


  // 文本统一样式
  const textClasses = 'text-theme-text';

  // 描述统一样式
  const descClasses = 'text-theme-desc';

  // 副标题统一样式
  const subtitleClasses = 'text-xs mt-1 text-theme-desc';

  return (
    <div 
      className={`${baseCardClasses} ${className}`}
      style={style}
      onClick={onCardClick}
    >
      {/* 应用头部信息 */}
      <div className="flex items-center overflow-hidden mb-3">
        <div className="flex items-center justify-center h-12 w-12 border border-solid border-gray-600 rounded-lg">
          <LucideIcon
            name="bot"
            size={24}
            color='gray'
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

      {/* 内置元数据渲染（仅限市场应用） */}
      {variant === 'market' && isMarketApp(app) && renderMarketMetadata(app)}

      {/* 自定义元数据渲染 */}
      {renderMetadata && (
        <div className="mb-3">
          {renderMetadata()}
        </div>
      )}

      {/* 应用标签 */}
      {hasTags && (
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          <TagOutlined />
          {appTags.map(tag => (
            <span key={tag} className='text-sm border border-solid rounded-lg px-2'>{tag}</span>
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