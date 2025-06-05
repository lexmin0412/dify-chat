import { genDifyRequest } from "@/app/api/utils";
import { NextRequest, NextResponse } from "next/server";

const GET = async (
	request: NextRequest,
	{
		params,
	}: { params: { appId: string; conversationId: string; messageId: string } },
) => {
	const { appId, messageId } = await params;
	const user = request.headers.get("dc-user") as string;
	if (!user) {
		return NextResponse.json({
			code: 401,
			message:
				'Unauthorized: lack of user. Please provide the "dc-user" header in your request.',
		});
	}
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.get(`/messages/${messageId}/suggested`, {
		user,
	});
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { GET };
