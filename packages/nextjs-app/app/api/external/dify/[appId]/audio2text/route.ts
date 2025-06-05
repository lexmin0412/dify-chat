import { genDifyRequest } from "@/app/api/utils";
import { NextRequest, NextResponse } from "next/server";

const POST = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.baseRequest(`/audio-to-text`, {
		method: "POST",
		body: await _request.blob(),
		headers: {
			"Content-Type": _request.headers.get("Content-Type") as string,
		},
	});
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { POST };
