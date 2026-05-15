/**
 * Dify 对话输入（文件类型）
 */
export interface IDifyConversationInputFile {
	dify_model_identity: string
	id: string | null
	tenant_id: string
	type: string
	transfer_method: string
	remote_url: string
	related_id: string
	filename: string
	extension: string
	mime_type: string
	size: number
}
