import { BaseRequest } from "@dify-chat/helpers";
import { DifyAppService } from "@/domain/app";

const appService = new DifyAppService();

/**
 * 生成 Dify 请求函数
 */
export const genDifyRequest = async (appId: string) => {
	const appItem = await appService.getApp(appId);
	// 从配置列表中找到 requestConfig 再发起请求获取
	const request = new BaseRequest({
		baseURL: appItem?.requestConfig?.apiBase || "",
		headers: {
			Authorization: `Bearer ${appItem?.requestConfig.apiKey as string}`,
		},
	});
	return request;
};
