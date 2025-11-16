import { AppModeEnums } from '@dify-chat/core';

/**
 * 应用信息接口
 */
export interface AppInfo {
  name: string;
  mode: AppModeEnums;
  description: string;
  tags: string[];
  creator: string;
  usageCount: number;
  conversationCount: number;
}

/**
 * 应用接口
 */
export interface App {
  id: string;
  info: AppInfo;
}

/**
 * 排序类型
 */
export type SortByType = 'comprehensive' | 'usageCount' | 'conversationCount';

/**
 * 标签分类接口
 */
export interface TagCategory {
  [key: string]: string[];
}

/**
 * 筛选条件接口
 */
export interface FilterParams {
  searchTerm: string;
  selectedTags: string[];
  sortBy: SortByType;
}