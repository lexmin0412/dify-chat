import { genDifyRequest } from "@/app/api/utils";
import { NextRequest, NextResponse } from "next/server";

const GET = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.get(
		`/workflows/run/${_request.nextUrl.searchParams.get("id")}`,
	);
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

const POST = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	const { inputs } = await _request.json();
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.post(`/workflows/run`, {
		response_mode: "blocking",
		user: _request.headers.get("dc-user") as string,
		inputs,
	});
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { GET, POST };
