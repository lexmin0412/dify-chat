import { HeaderLayout } from "@dify-chat/components";
import { IDifyAppItem, useAppContext } from "@dify-chat/core";
import { Empty, Spin } from "antd";

interface ICommonLayoutProps {
	initLoading: boolean;
	renderCenterTitle?: (appInfo?: IDifyAppItem["info"]) => React.ReactNode;
	children: React.ReactNode;
	extComponents?: React.ReactNode;
}

export default function CommonLayout(props: ICommonLayoutProps) {
	const { initLoading, renderCenterTitle, children, extComponents } = props;
	const { appLoading, currentApp } = useAppContext();

	return (
		<div
			className={`w-full h-screen flex flex-col overflow-hidden bg-theme-bg`}
		>
			{/* 头部 */}
			<HeaderLayout title={renderCenterTitle?.(currentApp?.config?.info)} />

			{/* Main */}
			<div className="flex-1 overflow-hidden flex rounded-t-3xl bg-theme-main-bg">
				{appLoading || initLoading ? (
					<div className="absolute w-full h-full left-0 top-0 z-50 flex items-center justify-center">
						<Spin spinning />
					</div>
				) : currentApp?.config ? (
					<>{children}</>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Empty
							description="暂无 Dify 应用配置，请联系管理员"
							className="text-base"
						/>
					</div>
				)}
			</div>
			{extComponents}
		</div>
	);
}
