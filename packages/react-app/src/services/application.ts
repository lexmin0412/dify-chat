import { IApplication, IApp } from '../types';
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

  // 添加应用到工作空间
  addAppToWorkspace: async (app: IApp, workspaceId: string): Promise<IApplication> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        const newApplication: IApplication = {
          id: `app-${Date.now()}`,
          workspaceId: workspaceId,
          info: {
            name: app.name,
            description: app.description,
            mode: app.mode,
            tags: app.tags || []
          }
        };
        
        // In a real application, this would save to backend
        // For now, we just return the new application
        resolve(newApplication);
      }, 500);
    });
  },
};