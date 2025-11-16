// 工作空间接口定义
export interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

// 应用信息接口定义
export interface ApplicationInfo {
  name: string;
  description: string;
  mode: 'chat' | 'workflow';
  tags: string[];
}

// 应用接口定义
export interface Application {
  id: string;
  workspaceId: string;
  info: ApplicationInfo;
}