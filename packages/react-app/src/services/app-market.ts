import { IApp } from '../types';
import { mockApps } from '@/pages/app-markets/mockData';

// 应用市场服务
export const appMarketService = {
  // 获取应用列表
  getApps: async (): Promise<IApp[]> => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        // Randomly fail 40% of the time to test error handling
        if (Math.random() < 0.9) {
          reject(new Error('Failed to fetch apps. Please try again.'));
        } else {
          resolve(mockApps);
        }
      }, 800);
    });
  },
};