import { NextRequest, NextResponse } from "next/server";
import { genDifyRequest } from "@/app/api/utils";

export async function GET(
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) {
	const { appId } = await params;
	const request = await genDifyRequest(appId);
	const result = await request.get("/info");

	if (result.error) {
		return NextResponse.json({
			error: result.error,
		});
	}
	return NextResponse.json(result);
}
