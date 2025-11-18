import { IAgentThought, IRetrieverResource } from '@dify-chat/api'
import { IWorkflowNode } from '@dify-chat/api'

/**
 * 消息对象中的文件 item
 */
export interface IMessageFileItem {
	id: string
	filename: string
	type: string
	url: string
	mime_type: string
	size: number
	transfer_method: string
	belongs_to: string
}

export interface IAgentMessage {
	/**
	 * 工作流信息
	 */
	workflows?: {
		/**
		 * 整个工作流的运行状态 running-运行中，finished-已完成
		 */
		status?: 'running' | 'finished'
		/**
		 * 工作流的节点详细信息
		 */
		nodes?: IWorkflowNode[]
	}
	/**
	 * 文件列表
	 */
	files?: IMessageFileItem[]
	/**
	 * 消息主体内容
	 */
	content: string
	/**
	 * 输入变量
	 */
	inputs?: Record<string, unknown>
	/**
	 * Agent 思维链信息
	 */
	agentThoughts?: IAgentThought[]
	/**
	 * 知识库引用列表
	 */
	retrieverResources?: IRetrieverResource[]
}

// 工作空间接口定义
export interface Workspace {
	id: string;
	name: string;
	description: string;
	memberCount: number;
}

// 应用信息接口定义
export interface IApplicationInfo {
	name: string;
	description: string;
	mode: 'chat' | 'workflow';
	tags: string[];
}

// 应用接口定义
export interface IApplication {
	id: string;
	workspaceId: string;
	info: IApplicationInfo;
}

// 应用市场应用接口
export interface IApp {
	id: string;
	name: string;
	description: string;
	creator: string;
	mode: 'chat' | 'workflow';
	tags: string[];
	usageCount: number;
	conversationCount: number;
}

// 标签分类接口
export interface TagCategory {
	name: string;
	tags: string[];
}

export type SortByType = 'comprehensive' | 'usageCount' | 'conversationCount';

// 应用市场筛选参数接口
export interface AppMarketFilterParams {
	searchTerm?: string;
	selectedTags?: string[];
	sortBy?: SortByType;
}


export interface IUser {
	id: string;
	username: string;
	workspaceId: string;
	phone: string;
	email: string;
	avatar: string;
	role: 'owner' | 'member';
	joinTime: string;
}