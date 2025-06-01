import { APPS_JSON_PATH } from "@/config";
import { type IDifyAppItem } from "@dify-chat/core";
import { existsSync, readFileSync, writeFileSync } from "fs";

/**
 * 获取应用列表数据
 */
export const getAppList = async (): Promise<IDifyAppItem[]> => {
	// 判断 APPS_JSON_PATH 路径是否存在，如果不存在则创建
	if (!existsSync(APPS_JSON_PATH)) {
		writeFileSync(APPS_JSON_PATH, JSON.stringify([], null, 2));
		return [];
	}
	try {
		const data = await readFileSync(APPS_JSON_PATH, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading or parsing JSON file:", error);
		// 如果文件不存在或读取失败，返回空数组
		return [];
	}
};

/**
 * 应用列表 CRUD 的 RESTful 实现
 */
class DifyAppService {
	public readonly = false as const;

	async getApps(): Promise<IDifyAppItem[]> {
		const response = await getAppList();
		return response;
	}

	async getApp(id: string): Promise<IDifyAppItem | undefined> {
		try {
			const response = await this.getApps();
			return response?.find((item) => item.id === id);
		} catch (error) {
			console.error("Failed to fetch app:", error);
			return undefined;
		}
	}

	async addApp(config: IDifyAppItem): Promise<{ id: string }> {
		const apps = await getAppList();
		const id = Date.now().toString();
		const newApp = { ...config, id };
		apps.push(newApp);
		await writeFileSync(APPS_JSON_PATH, JSON.stringify(apps, null, 2));
		return { id };
	}

	async updateApp(config: IDifyAppItem): Promise<void> {
		// return request.put(
		// 	`/app/${config.id}`,
		// 	config as unknown as Record<string, unknown>,
		// );
		const apps = await getAppList();
		const index = apps.findIndex((item) => item.id === config.id);
		if (index !== -1) {
			apps[index] = {
				...config,
				id: config.id,
			};
			return writeFileSync(APPS_JSON_PATH, JSON.stringify(apps, null, 2));
		}
		return Promise.reject(new Error("App not found"));
	}

	async deleteApp(id: string): Promise<void> {
		const apps = await getAppList();
		const index = apps.findIndex((item) => item.id === id);
		if (index !== -1) {
			apps.splice(index, 1);
			return writeFileSync(APPS_JSON_PATH, JSON.stringify(apps, null, 2));
		}
		return Promise.reject(new Error("App not found"));
	}
}

export default DifyAppService;
