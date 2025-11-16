import { Workspace, Application } from './types';
import { mockWorkspaces, mockApplications } from './mockData';

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

// 应用服务
export const applicationService = {
  // 根据工作空间ID获取应用列表
  getApplicationsByWorkspaceId: async (workspaceId: string): Promise<Application[]> => {
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