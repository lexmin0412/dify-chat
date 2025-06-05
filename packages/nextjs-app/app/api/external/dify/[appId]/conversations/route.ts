import { genDifyRequest } from "@/app/api/utils";
import { NextRequest, NextResponse } from "next/server";

const GET = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	const user = _request.headers.get("dc-user") as string;
	if (!user) {
		return NextResponse.json({
			code: 401,
			message:
				'Unauthorized: lack of user. Please provide the "dc-user" header in your request.',
		});
	}
	const limit = _request.nextUrl.searchParams.get("limit");
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.get(`/conversations`, {
		user,
		limit: (limit || 100).toString(),
	});
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { GET };
