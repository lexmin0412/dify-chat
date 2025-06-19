"use client";
import { IDifyAppItem4View } from "@/types";
import { TagOutlined } from "@ant-design/icons";
import { LucideIcon } from "@dify-chat/components";
import { AppModeLabels } from "@dify-chat/core";
import { useIsMobile } from "@dify-chat/helpers";

import { Col } from "antd";
import { useRouter } from "next/navigation";

interface IAppItemProps {
	item: IDifyAppItem4View;
}

export default function AppItem(props: IAppItemProps) {
	const router = useRouter();
	const { item } = props;
	const isMobile = useIsMobile();
	const hasTags = item.info.tags?.length;
	return (
		<Col key={item.id} span={isMobile ? 24 : 6}>
			<div
				key={item.id}
				className={`relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary`}
			>
				<div
					onClick={() => {
						router.push(`/app/${item.id}`);
					}}
				>
					<div className="flex items-center overflow-hidden">
						<div className="h-10 w-10 bg-[#ffead5] dark:bg-transparent border border-solid border-transparent dark:border-theme-border rounded-lg flex items-center justify-center">
							<LucideIcon name="bot" className="text-xl text-theme-text" />
						</div>
						<div className="flex-1 overflow-hidden ml-3 text-theme-text h-10 flex flex-col justify-between">
							<div className="truncate font-semibold pr-4">
								{item.info.name}
							</div>
							<div className="text-theme-desc text-xs mt-0.5">
								{item.info.mode ? AppModeLabels[item.info.mode] : "unknown"}
							</div>
						</div>
					</div>
					<div className="text-sm mt-3 h-10 overflow-hidden text-ellipsis leading-5 whitespace-normal line-clamp-2 text-theme-desc">
                                                {item.info.description || "暫無描述"}
					</div>
				</div>
				<div className="flex items-center text-desc truncate mt-3 h-4">
					{hasTags ? (
						<>
							<TagOutlined className="mr-2" />
							{item.info.tags.join("、")}
						</>
					) : null}
				</div>
			</div>
		</Col>
	);
}
