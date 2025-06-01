import path from "path";

/**
 * 应用列表的 JSON 路径
 */
export const APPS_JSON_PATH = path.resolve(
	process.env.PROJECT_ROOT!,
	".dify-chat",
	"storage",
	"apps.json",
);
