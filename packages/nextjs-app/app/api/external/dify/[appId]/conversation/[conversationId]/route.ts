import { genDifyRequest } from "@/app/api/utils";
import { NextRequest, NextResponse } from "next/server";

const DELETE = async (
	_request: NextRequest,
	{ params }: { params: { appId: string; conversationId: string } },
) => {
	const { appId, conversationId } = await params;
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.delete(`/conversations/${conversationId}`, {
		user: _request.headers.get("dc-user") as string,
	});
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { DELETE };
