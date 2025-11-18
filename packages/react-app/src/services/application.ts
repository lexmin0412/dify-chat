import { IApplication } from '../types';
import { mockApplications } from '@/pages/apps/mockData';

// 应用服务
export const applicationService = {
  // 根据工作空间ID获取应用列表
  getApplicationsByWorkspaceId: async (workspaceId: string): Promise<IApplication[]> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Filter apps by selected workspace
        const filteredApps = mockApplications.filter(
          app => app.workspaceId === workspaceId
        );
        resolve(filteredApps);
      }, 800);
    });
  },
};