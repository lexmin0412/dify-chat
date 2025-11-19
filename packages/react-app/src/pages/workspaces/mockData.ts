import { Workspace, IApplication, IUser } from '@/types';

// Mock data for workspaces
export const mockWorkspaces: Workspace[] = [
	{ id: 'workspace-1', name: '默认空间', description: '个人使用的工作空间', memberCount: 1 },
	{ id: 'workspace-2', name: '项目团队', description: '团队协作项目空间', memberCount: 5 },
	{ id: 'workspace-3', name: '开发测试', description: '开发测试专用空间', memberCount: 3 },
	{ id: 'workspace-4', name: '客户演示', description: '客户演示用工作空间', memberCount: 2 },
];

// Mock data for applications
export const mockApplications: IApplication[] = [
	{
		id: 'app-1',
		workspaceId: 'workspace-1',
		info: {
			name: '个人助手',
			description: '帮助管理个人日程和任务的智能助手',
			mode: 'chat',
			tags: ['个人', '助手'],
		},
	},
	{
		id: 'app-2',
		workspaceId: 'workspace-1',
		info: {
			name: '学习笔记',
			description: '智能学习笔记管理工具',
			mode: 'chat',
			tags: ['学习', '笔记'],
		},
	},
	{
		id: 'app-3',
		workspaceId: 'workspace-2',
		info: {
			name: '项目管理',
			description: '团队项目协作与管理平台',
			mode: 'workflow',
			tags: ['团队', '项目'],
		},
	},
	{
		id: 'app-4',
		workspaceId: 'workspace-2',
		info: {
			name: '文档协作',
			description: '多人实时文档编辑与协作工具',
			mode: 'chat',
			tags: ['协作', '文档'],
		},
	},
	{
		id: 'app-5',
		workspaceId: 'workspace-3',
		info: {
			name: 'API测试',
			description: 'API接口测试与调试工具',
			mode: 'workflow',
			tags: ['测试', 'API'],
		},
	},
	{
		id: 'app-6',
		workspaceId: 'workspace-4',
		info: {
			name: '产品演示',
			description: '产品功能演示与介绍应用',
			mode: 'chat',
			tags: ['演示', '产品'],
		},
	},
];

export const mockUser: IUser[] = [
      {
        id: '1',
        username: 'admin',
		workspaceId: 'workspace-1',
        phone: '13800138000',
        email: 'admin@example.com',
        avatar: '',
        role: 'owner',
        joinTime: '2024-01-01 10:00:00'
      },
      {
        id: '2',
        username: 'user1',
		workspaceId: 'workspace-2',
        phone: '13800138001',
        email: 'user1@example.com',
        avatar: '',
        role: 'member',
        joinTime: '2024-01-02 14:30:00'
      },
      {
        id: '3',
        username: 'user2',
		workspaceId: 'workspace-3',
        phone: '13800138002',
        email: 'user2@example.com',
        avatar: '',
        role: 'member',
        joinTime: '2024-01-03 09:15:00'
      }
]