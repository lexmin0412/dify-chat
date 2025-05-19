import { IFileType } from '@dify-chat/api'

/**
 * Dify 支持的文件类型和对应的格式
 */
export const FileTypeMap: Map<IFileType, string[]> = new Map()

FileTypeMap.set('document', [
	'txt',
	'md',
	'markdown',
	'pdf',
	'html',
	'xlsx',
	'xls',
	'docx',
	'csv',
	'eml',
	'msg',
	'pptx',
	'ppt',
	'xml',
	'epub',
])
FileTypeMap.set('image', ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'])
FileTypeMap.set('audio', ['mp3', 'm4a', 'wav', 'webm', 'amr'])
FileTypeMap.set('video', ['mp4', 'mov', 'mpeg', 'mpga'])
FileTypeMap.set('custom', [])

/**
 * 获取文件扩展名
 */
export const getFileExtByName = (filename: string) => {
	return filename.split('.').pop()
}

export const getFileTypeByName = (filename: string): IFileType => {
	const ext = filename.split('.').pop()

	// 使用文件扩展名和 FileTypeMap 进行匹配
	let fileType: IFileType = 'custom'
	FileTypeMap.forEach((extensions, type) => {
		if (extensions.indexOf(ext as string) > -1) {
			fileType = type
		}
	})
	return fileType
}

/**
 * 获取文件类型
 * 如果 allowedFileTypes 长度为 1, 则直接返回该类型
 * 否则, 根据文件扩展名进行匹配
 * @param filename 文件名
 * @param allowedFileTypes 允许的文件类型
 */
export const getDifyFileType = (filename: string, allowedFileTypes: IFileType[]): IFileType => {
	if (allowedFileTypes.length === 1) {
		return allowedFileTypes[0]
	}
	return getFileTypeByName(filename)
}

/**
 * 格式化文件大小, 原始单位为 Byte
 * 如果大于 1M, 则显示为 MB, 否则显示为 KB
 * @param size 文件大小
 */
export const formatSize = (size: number) => {
	if (size > 1024 * 1024) {
		return `${(size / 1024 / 1024).toFixed(2)} MB`
	}
	return `${(size / 1024).toFixed(2)} KB`
}
