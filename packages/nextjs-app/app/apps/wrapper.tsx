"use client";

import { DifyChatProvider } from "@dify-chat/core";
import AppsPageMain from "./content-client";
import DifyAppService from "@/services/app/apps";
import { useUserId } from "@/hooks/useUserId";

export default function Wrapper() {
	const user = useUserId();
	return (
		<DifyChatProvider
			value={{
				mode: "multiApp",
				appService: new DifyAppService(),
				enableSetting: true,
				user,
			}}
		>
			<AppsPageMain />
		</DifyChatProvider>
	);
}
