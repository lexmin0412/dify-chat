type IOpeningStatementDisplayMode = "default" | "always";

export * from "./app";

/**
 * 所有的配置项
 */
export interface IConfig {
	runningMode: string;
	apiBase: string;
	apiSecret: string;
	appMode: string;
	answerFormEnabled: boolean;
	answerFormFeedbackText: string;
	enableUpdateInputAfterCvstStarts: boolean;
	openingStatementDisplayMode: IOpeningStatementDisplayMode;
}

export const getConfigs = (): IConfig => {
	return {
		runningMode: process.env.RUNNING_MODE || "singleApp",
		apiBase: process.env.DIFY_API_BASE || "",
		apiSecret: process.env.DIFY_API_SECRET || "",
		appMode: process.env.DIFY_APP_MODE || "chat",
		answerFormEnabled: process.env.ANSWER_FORM_ENABLED === "true",
		answerFormFeedbackText: process.env.ANSWER_FORM_FEEDBACK_TEXT || "",
		enableUpdateInputAfterCvstStarts:
			process.env.ENABLE_UPDATE_INPUT_AFTER_CVST_STARTS === "true",
		openingStatementDisplayMode:
			process.env.OPENING_STATEMENT_DISPLAY_MODE || "default",
	} as IConfig;
};
