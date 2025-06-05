import { genDifyRequest } from "@/app/api/utils";
import { NextRequest } from "next/server";

const POST = async (
	_request: NextRequest,
	{ params }: { params: { appId: string } },
) => {
	const { appId } = await params;
	// 获取 body 中的参数
	const { conversation_id, inputs, files, query, response_mode } =
		await _request.json();
	const difyRequest = await genDifyRequest(appId);
	const user = _request.headers.get("dc-user") as string;
	const response = await difyRequest.baseRequest(`/chat-messages`, {
		method: "POST",
		body: JSON.stringify({
			conversation_id,
			inputs,
			files,
			response_mode,
			user,
			query,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	// 直接将原始响应“透传”给客户端
	return new Response(response.body, {
		status: response.status,
		headers: {
			// 允许流式响应
			"Content-Type":
				response.headers.get("Content-Type") || "application/json",
			// 允许 CORS 或其他你需要的 header
			"X-Version": response.headers.get("X-Version") || "",
			// 允许获取 Dify 版本
			"Access-Control-Allow-Headers": "X-Version, Authorization, Content-Type",
		},
	});
};

export { POST };
