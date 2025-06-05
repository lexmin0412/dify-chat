import { NextRequest, NextResponse } from "next/server";
import { genDifyRequest } from "@/app/api/utils";

const GET = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	// 实例化 Dify 请求类
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.get(`/info`);
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { GET };
