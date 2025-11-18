import { IUser } from '../types';
import { mockUser } from '@/pages/apps/mockData';

// 用户服务
export const userService = {
  // 根据工作空间ID获取用户列表
  getUsersByWorkspaceId: async (workspaceId: string): Promise<IUser[]> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Filter users by selected workspace
        const filteredUsers = mockUser.filter(
          user => user.workspaceId === workspaceId
        );
        resolve(filteredUsers);
      }, 800);
    });
  },
};