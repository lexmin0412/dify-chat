import { Workspace } from '../types';
import { mockWorkspaces } from '@/pages/workspaces/mockData';

// 工作空间服务
export const workspaceService = {
  // 获取所有工作空间
  getWorkspaces: async (): Promise<Workspace[]> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        resolve(mockWorkspaces);
      }, 500);
    });
  },
};