import { App } from './types';
import { mockApps } from './mockData';

/**
 * 应用市场服务
 */
export const appMarketService = {
  /**
   * 获取应用列表
   * @returns Promise<App[]>
   */
  getApps: async (): Promise<App[]> => {
    return new Promise((resolve, reject) => {
      // 模拟API请求延迟
      setTimeout(() => {
        // 添加随机失败概率（10%）用于测试错误处理
        const isFailed = Math.random() < 0.4;
        
        if (isFailed) {
          reject(new Error('获取应用市场数据失败，请稍后重试'));
        } else {
          resolve(mockApps);
        }
      }, 800); // 延长延迟时间以便更好地展示加载状态
    });
  }
};