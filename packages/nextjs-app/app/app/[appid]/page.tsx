"use client";

// 只有放在页面入口才能生效
import "@ant-design/v5-patch-for-react-19";

import { DifyChatProvider } from "@dify-chat/core";
import DifyAppService from "@/services/app/apps";
import MultiAppLayout from "./layout/multi-app-layout";
import { useUserId } from "@/hooks/useUserId";
import { Logo } from "@/components";
import { Spin } from "antd";

export default function AppPage() {
	const user = useUserId();
	if (!user) {
		return (
			<div className="w-screen h-screen flex flex-col items-center justify-center bg-theme-bg">
				<div className="absolute flex-col w-full h-full left-0 top-0 z-50 flex items-center justify-center">
					<Logo hideGithubIcon />
					<div className="text-theme-text">授权登录中...</div>
					<div className="mt-6">
						<Spin spinning />
					</div>
				</div>
			</div>
		);
	}
	return (
		<DifyChatProvider
			value={{
				mode: "multiApp",
				appService: new DifyAppService(),
				enableSetting: true,
				user,
			}}
		>
			<MultiAppLayout />
		</DifyChatProvider>
	);
}
