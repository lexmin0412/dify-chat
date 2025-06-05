import { GithubIcon, LogoIcon } from "@dify-chat/components";
import { useDifyChat } from "@dify-chat/core";
import Link from "next/link";
import React from "react";

interface IMobileHeaderProps {
	/**
	 * 自定义中间部分内容
	 */
	centerChildren: React.ReactNode;
}

/**
 * 移动端共用头部
 */
export const MobileHeader = (props: IMobileHeaderProps) => {
	const { centerChildren } = props;
	const { mode } = useDifyChat();

	return (
		<div className="h-12 !leading-[3rem] px-4 text-base top-0 z-20 bg-theme-bg w-full shadow-sm font-semibold justify-between flex items-center box-border">
			{mode === "multiApp" ? (
				<Link href="/apps" className="flex items-center">
					<LogoIcon />
				</Link>
			) : (
				<div className="flex items-center">
					<LogoIcon />
				</div>
			)}

			<div className="flex-1 overflow-hidden flex items-center justify-center">
				{centerChildren}
			</div>

			<GithubIcon />
		</div>
	);
};
