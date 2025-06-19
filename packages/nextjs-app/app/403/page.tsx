"use client";
import { LucideIcon } from "@dify-chat/components";

// 假设 401 页面的美化风格是添加背景色、居中内容、设置字体样式等
export default function Page() {
	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-[#f0f2f5] font-sans">
			<LucideIcon name="lock-keyhole" size={64} />
			<h1 className="text-3xl text-red-500 my-4">403 Forbidden</h1>
			<p className="text-lg text-[#8c8c8c]">
				您沒有權限訪問此頁面，請聯繫管理員。
			</p>
		</div>
	);
}
