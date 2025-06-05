import { genDifyRequest } from "@/app/api/utils";
import { NextRequest, NextResponse } from "next/server";

const GET = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.get(`/site`);
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { GET };
