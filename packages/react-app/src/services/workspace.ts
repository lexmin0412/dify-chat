import { mockWorkspaces, mockApplications } from '@/pages/workspaces/mockData';

interface WorkspaceService {
  getWorkspaces: () => Promise<Array<any>>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export const workspaceService: WorkspaceService = {
  // 获取工作空间列表
  getWorkspaces: async () => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 返回工作空间列表的副本，避免直接修改原始数据
    return [...mockWorkspaces];
  },
  
  // 删除工作空间
  deleteWorkspace: async (workspaceId: string) => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 检查工作空间是否存在
    const workspaceIndex = mockWorkspaces.findIndex((workspace: any) => workspace.id === workspaceId);
    
    if (workspaceIndex === -1) {
      throw new Error('工作空间不存在或已被删除');
    }
    
    // 实际从mock数据中删除工作空间
    mockWorkspaces.splice(workspaceIndex, 1);
    
    // 同时删除与该工作空间关联的所有应用
    const appIndices: number[] = [];
    for (let i = 0; i < mockApplications.length; i++) {
      if (mockApplications[i].workspaceId === workspaceId) {
        appIndices.push(i);
      }
    }
    
    // 从后往前删除应用，避免索引变化问题
    for (let i = appIndices.length - 1; i >= 0; i--) {
      mockApplications.splice(appIndices[i], 1);
    }
    
    // 返回成功的Promise
    return Promise.resolve();
  }
};