import { DifyAppService } from "@/domain/app";
import { NextRequest, NextResponse } from "next/server";

const appService = new DifyAppService();

/**
 * 获取应用详情
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) {
	const { appId } = await params;
	const app = await appService.getApp(appId);
	if (!app) {
		return NextResponse.json({
			error: `找不到应用: ${appId}`,
		});
	}
	return NextResponse.json(app);
}

/**
 * 更新应用
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { appId: string } },
) {
	const { appId } = await params;
	// 获取 body
	const body = await request.json();
	await appService.updateApp({
		...body,
		id: appId,
	});
	return NextResponse.json({});
}

/**
 * 删除应用
 */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) {
	const { appId } = await params;
	const result = await appService.deleteApp(appId);
	return NextResponse.json(result);
}
