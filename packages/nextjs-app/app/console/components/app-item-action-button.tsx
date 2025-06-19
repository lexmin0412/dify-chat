"use client";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { IDifyAppItem } from "@dify-chat/core";

import { Dropdown, message } from "antd";
import { useAppEditDrawer } from "@/app/console/hooks/use-app-edit-drawer";
import { AppDetailDrawerModeEnum } from "@/app/console/enums";
import { deleteApp } from "@/app/console/actions";
import { redirect } from "next/navigation";

export default function AppItemActionButton(props: { item: IDifyAppItem }) {
	const { item } = props;
	const {
		setAppEditDrawerMode,
		setAppEditDrawerOpen,
		setAppEditDrawerAppItem,
		drawerComponent,
	} = useAppEditDrawer();
	return (
		<>
			<Dropdown
				menu={{
					items: [
						{
							key: "edit",
							icon: <EditOutlined />,
							label: "编辑",
							onClick: () => {
								setAppEditDrawerMode(AppDetailDrawerModeEnum.edit);
								setAppEditDrawerOpen(true);
								setAppEditDrawerAppItem(item);
							},
						},
                                        {
                                                key: "delete",
                                                icon: <DeleteOutlined />,
                                                label: "刪除",
                                                danger: true,
                                                onClick: async () => {
                                                        await deleteApp(item.id);
                                                        message.success("刪除應用成功");
                                                        // 重新加载列表页
                                                        redirect("/console");
                                                },
						},
					],
				}}
			>
				<MoreOutlined className="absolute right-3 top-3 text-lg" />
			</Dropdown>
			{drawerComponent}
		</>
	);
}
