import { useState } from 'react';
import { useIsMobile } from '@dify-chat/helpers';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { DebugMode, Header } from '@/components';

// 导入类型定义
import { App, AppMarketFilterParams as FilterParams } from './types';

// 导入服务模块
import { appMarketService } from './services';

// 导入模拟数据
import { tagCategories } from './mockData';

// 导入组件
import AppMarketFilter from './components/AppMarketFilter';
import AppList from './components/AppList';

export default function AppMarketsPage() {
  const isMobile = useIsMobile();
  
  // 筛选参数状态
  const [filterParams, setFilterParams] = useState<FilterParams>({
    searchTerm: '',
    selectedTags: [],
    sortBy: 'comprehensive'
  });

  // 使用服务获取应用数据
  const { data: apps, loading, error, refresh } = useRequest<App[], any[]>(() => {
    return appMarketService.getApps();
  }, {
    retryInterval: 1000,
    retryCount: 1,
    onError: (err) => {
      console.error('应用市场数据获取失败:', err);
      // message.error('获取应用市场数据失败，请稍后重试');
    },
    onSuccess: () => {
      console.log('应用市场数据获取成功');
    }
  });

  // 筛选应用列表
  const filteredApps = (Array.isArray(apps) ? apps : []).filter(app => {
    if (!app.tags) return false;
    
    // 标签筛选
    const tagMatch = filterParams.selectedTags?.length === 0 || 
      filterParams.selectedTags?.some(tag => app.tags.includes(tag));
    
    // 搜索筛选
    const searchMatch = !filterParams.searchTerm || 
      app.name.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) ||
      app.creator.toLowerCase().includes(filterParams.searchTerm.toLowerCase());
      
    return tagMatch && searchMatch;
  });

  // 排序应用列表
  const sortedApps = filteredApps?.sort((a, b) => {
    switch (filterParams.sortBy) {
      case 'usageCount':
        // 最多使用：按使用人数从高到低排序
        return b.usageCount - a.usageCount;
      case 'conversationCount':
        // 最多对话：按对话次数从高到低排序
        return b.conversationCount - a.conversationCount;
      case 'comprehensive':
      default:
        // 综合排序：使用加权算法，使用人数权重0.6，对话次数权重0.4
        const scoreA = a.usageCount * 0.6 + a.conversationCount * 0.4;
        const scoreB = b.usageCount * 0.6 + b.conversationCount * 0.4;
        return scoreB - scoreA;
    }
  });

  // 处理筛选参数变化
  const handleFilterChange = (newParams: Partial<FilterParams>) => {
    setFilterParams(prev => ({
      ...prev,
      ...newParams
    }));
  };

  // 处理刷新
  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
      <Header />
      <div className="flex-1 bg-theme-main-bg rounded-t-3xl py-6 overflow-y-auto box-border overflow-x-hidden">
        {/* 筛选区域 */}
        <AppMarketFilter
          filterParams={filterParams}
          tagCategories={tagCategories}
          onFilterChange={handleFilterChange}
        />

        {/* 应用列表 */}
        <AppList
          apps={sortedApps}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
      <DebugMode />
    </div>
  );
}