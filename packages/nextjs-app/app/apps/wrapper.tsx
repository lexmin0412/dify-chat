"use client";

import { DifyChatProvider } from "@dify-chat/core";
import AppsPageMain from "./content-client";
import DifyAppService from "@/services/app/apps";

export default function Wrapper() {
	return (
		<DifyChatProvider
			value={{
				mode: "multiApp",
				appService: new DifyAppService(),
				enableSetting: true,
				user: "",
			}}
		>
			<AppsPageMain />
		</DifyChatProvider>
	);
}
