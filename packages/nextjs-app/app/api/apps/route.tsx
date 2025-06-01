import { DifyAppService } from "@/domain/app";
import { NextRequest, NextResponse } from "next/server";

const appService = new DifyAppService();

/**
 * 获取应用列表
 */
export async function GET() {
	const result = await appService.getApps();
	return NextResponse.json(result);
}

/**
 * 创建应用
 */
export async function POST(request: NextRequest) {
	// 获取 body
	const body = await request.json();
	const result = await appService.addApp({
		...body,
		id: Date.now().toString(),
	});
	return NextResponse.json(result);
}
