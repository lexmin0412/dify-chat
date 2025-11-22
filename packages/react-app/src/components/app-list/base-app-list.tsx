import { Empty, Result, Button, Col, Row, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useIsMobile } from '@dify-chat/helpers';
import { BaseAppCard } from '../app-card';
import { AppCardVariant } from '../app-card/base-app-card';
import { IApp } from '@/types';

/**
 * 应用列表布局类型
 */
export type AppListLayout = 'grid' | 'row';

/**
 * 应用列表属性接口
 */
export interface BaseAppListProps<T extends IApp> {
  /** 应用数据列表 */
  apps: T[] | undefined;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | undefined;
  /** 刷新回调函数 */
  onRefresh: () => void;
  /** 应用卡片变体类型 */
  variant: AppCardVariant;
  /** 布局类型 */
  layout?: AppListLayout;
  /** 自定义加载骨架屏数量 */
  skeletonCount?: number;
  /** 渲染应用卡片的函数 */
  renderAppCard?: (app: T, index: number) => React.ReactNode;
  /** 渲染头部工具栏 */
  renderHeader?: () => React.ReactNode;
  /** 自定义空状态描述 */
  emptyDescription?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 渲染加载骨架屏,dark:适配不同主题色
 */
const renderLoadingSkeleton = (count: number, layout: AppListLayout) => {
  const skeletonItem = (
    <div className="relative p-4 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg animate-pulse">
      <div className="flex items-center overflow-hidden mb-3">
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1 overflow-hidden ml-3">
          <div className="h-5  bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3  bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-4  bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
      <div className="h-8  bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-8  bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  if (layout === 'row') {
    return (
      <div className="flex justify-center items-center h-48">
        <Spin size="large" />
        <span className="ml-2 text-theme-text">加载应用列表中...</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonItem}</div>
        ))}
      </div>
    </div>
  );
};

/**
 * 渲染错误状态
 */
const renderErrorState = (error: Error, onRefresh: () => void, layout: AppListLayout) => {
  if (layout === 'row') {
    return (
      <div className="flex justify-center items-center h-48">
        <Alert
          message="获取应用列表失败"
          description={error.message || '请稍后重试'}
          type="error"
          showIcon
          action={<button onClick={onRefresh} className="text-primary hover:underline">重新加载</button>}
        />
      </div>
    );
  }

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
};

/**
 * 渲染空状态
 */
const renderEmptyState = (description: string, layout: AppListLayout) => {
  if (layout === 'row') {
    return (
      <div className="w-full h-full box-border flex flex-col items-center justify-center px-3">
        <Empty description={description} />
      </div>
    );
  }

  return (
    <div className="p-12 flex justify-center">
      <Empty
        description={description}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
};

/**
 * 基础应用列表组件
 * 支持网格和行两种布局，提供统一的加载、错误、空状态处理
 */
const BaseAppList = <T extends IApp>({
  apps,
  loading,
  error,
  onRefresh,
  variant,
  layout = 'grid',
  skeletonCount = 8,
  renderAppCard,
  renderHeader,
  emptyDescription = '暂无应用数据',
  className = '',
  style
}: BaseAppListProps<T>) => {
  const isMobile = useIsMobile();

  // 加载状态
  if (loading) {
    return <>{renderLoadingSkeleton(skeletonCount, layout)}</>;
  }

  // 错误状态
  if (error) {
    return <>{renderErrorState(error, onRefresh, layout)}</>;
  }

  // 空状态
  if (!apps || apps.length === 0) {
    return <>{renderEmptyState(emptyDescription, layout)}</>;
  }

  // 正常状态：展示应用列表
  return (
    <div className={className} style={style}>
      {/* 头部工具栏 */}
      {renderHeader && (
        <div className="mb-4">
          {renderHeader()}
        </div>
      )}

      {/* 应用列表 */}
      {layout === 'row' ? (
        <Row gutter={[16, 16]}>
          {apps.map((app, index) => (
            <Col key={app.id} span={isMobile ? 24 : 6}>
              {renderAppCard ? renderAppCard(app, index) : (
                <BaseAppCard 
                  app={app} 
                  variant={variant}
                />
              )}
            </Col>
          ))}
        </Row>
      ) : (
        <div className="p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {apps.map((app, index) => (
              <div key={app.id}>
                {renderAppCard ? renderAppCard(app, index) : (
                  <BaseAppCard 
                    app={app} 
                    variant={variant}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseAppList;