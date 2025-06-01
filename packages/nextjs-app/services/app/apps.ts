import { DifyAppStore, type IDifyAppItem } from "@dify-chat/core";

import { BaseRequest } from "@dify-chat/helpers";

const API_BASE_URL = "/api";

const request = new BaseRequest({ baseURL: API_BASE_URL });

/**
 * 应用列表 CRUD 的 RESTful 实现
 */
class DifyAppService extends DifyAppStore {
	public readonly = false as const;

	async getApps(): Promise<IDifyAppItem[]> {
		const response = await request.get(`/apps`);
		return response;
	}

	async getApp(id: string): Promise<IDifyAppItem | undefined> {
		try {
			const response = await request.get(`/apps/${id}`);
			return response;
		} catch (error) {
			console.error("Failed to fetch app:", error);
			return undefined;
		}
	}

	async addApp(config: IDifyAppItem): Promise<void> {
		return request.post(`/apps`, config as unknown as Record<string, unknown>);
	}

	async updateApp(config: IDifyAppItem): Promise<void> {
		return request.put(
			`/apps/${config.id}`,
			config as unknown as Record<string, unknown>,
		);
	}

	async deleteApp(id: string): Promise<void> {
		await request.delete(`/apps/${id}`);
	}
}

export default DifyAppService;
