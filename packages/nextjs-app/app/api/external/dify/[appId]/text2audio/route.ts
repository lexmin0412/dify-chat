import { genDifyRequest } from "@/app/api/utils";
import { NextRequest } from "next/server";

const POST = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	const body = await _request.json();
	const { message_id, text } = body;
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.baseRequest(`/text-to-audio`, {
		method: "POST",
		body: JSON.stringify({
			message_id,
			text,
			user: _request.headers.get("dc-user") as string,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
	return new Response(result.body, {
		status: result.status,
		headers: {
			"Content-Type": result.headers.get("Content-Type") || "application/json",
		},
	});
};

export { POST };
