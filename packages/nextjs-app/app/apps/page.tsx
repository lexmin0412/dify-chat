"use client";
import { getAppList } from "@/app/apps/actions";

import { Empty, Row } from "antd";

import AppItem from "@/app/apps/components/app-item";
import HeaderWrapper, {
	IHeaderWrapperProps,
} from "@/components/layout/header-wrapper";
import { useMount } from "ahooks";
import { useMemo, useState } from "react";
import { IDifyAppItem4View } from "@/types";
import { getAllState } from "@/store";

export default function AppsPage() {
	const [apps, setApps] = useState<IDifyAppItem4View[]>();

	const initData = async () => {
		const appsRes = await getAppList();
		setApps(appsRes);
	};

	useMount(() => {
		initData();
	});

	const headerWrapperProps: IHeaderWrapperProps = useMemo(() => {
		const userInfo = getAllState().user;
		const enableSetting = userInfo?.enableSetting;
		return {
			centerTitle: {
				icon: "layout-grid",
				title: "應用列表",
			},
			rightLink: enableSetting
				? {
						icon: "square-chevron-right",
						href: "/console",
						title: "控制台",
					}
				: undefined,
		};
	}, []);

	return (
		<div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
			<HeaderWrapper {...headerWrapperProps} />
			<div className="flex-1 bg-theme-main-bg rounded-3xl py-6 overflow-y-auto box-border overflow-x-hidden">
				{apps?.length ? (
					<Row gutter={[16, 16]} className="px-3 md:px-6">
						{apps.map((item) => {
							return <AppItem key={item.id} item={item} />;
						})}
					</Row>
				) : (
					<div className="w-full h-full box-border flex flex-col items-center justify-center px-3">
						<Empty description="暫無應用" />
					</div>
				)}
			</div>
		</div>
	);
}
