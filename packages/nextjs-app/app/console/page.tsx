import { getUserAction } from "@/app/actions";
import { getAppList } from "@/app/console/actions";

import { Empty, Row } from "antd";

import AddButton from "@/app/console/components/add-button";
import AppItem from "@/app/console/components/app-item";
import Header from "@/components/layout/header-wrapper";

export default async function AppsPage() {
	const user = await getUserAction();
	const apps = await getAppList();

	const refreshApps = getAppList;

	return (
		<div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
			<Header
				centerTitle={{
					title: "控制台",
					icon: "square-chevron-right",
				}}
				rightLink={{
					icon: "layout-grid",
					href: "/apps",
					title: "应用列表",
				}}
			/>
			<div className="flex-1 bg-theme-main-bg rounded-3xl py-6 overflow-y-auto box-border overflow-x-hidden">
				{apps?.length ? (
					<Row gutter={[16, 16]} className="px-3 md:px-6">
						{apps.map((item) => {
							return (
								<AppItem
									key={item.id}
									item={item}
									enableSetting={user.enableSetting}
								/>
							);
						})}
					</Row>
				) : (
					<div className="w-full h-full box-border flex flex-col items-center justify-center px-3">
                                                <Empty description="暫無應用" />
					</div>
				)}
			</div>

			{user.enableSetting ? <AddButton refreshApps={refreshApps} /> : null}
		</div>
	);
}
