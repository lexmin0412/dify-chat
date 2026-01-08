import { Attachments } from '@ant-design/x'
import { IMessageFileItem } from '@dify-chat/api'
import { useAppContext } from '@dify-chat/core'
import { useMemo } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

import { useGlobalStore } from '@/store'
import { completeFileUrl } from '@/utils'

const triggerDownload = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename || 'download'
	document.body.appendChild(a)
	a.click()
	a.remove()
	URL.revokeObjectURL(url)
}

/**
 * 从 Content-Disposition 头中解析文件名
 * @param contentDisposition Content-Disposition 头值
 * @param fallback  fallback 文件名
 * @returns 解析后的文件名
 */
const parseFilenameFromCD = (contentDisposition: string | null, fallback: string) => {
	if (!contentDisposition) return fallback
	// 从 Content-Disposition 头中解析文件名
	// e.g. attachment; filename="example.pdf"
	const match = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i)
	const encoded = match?.[1]
	const plain = match?.[2]
	try {
		if (encoded) return decodeURIComponent(encoded)
		if (plain) return plain
	} catch (error) {
		console.warn(`解析文件名失败: ${error}`, contentDisposition)
	}
	return fallback
}

interface IMessageFileListProps {
	/**
	 * 消息附件列表
	 */
	files?: IMessageFileItem[]
}

/**
 * 消息附件列表展示组件
 */
export default function MessageFileList(props: IMessageFileListProps) {
	const { files: filesInProps } = props
	const { difyApi } = useGlobalStore()
	const { currentApp } = useAppContext()

	/**
	 * 处理文件 URL, 如果是本地文件则补全
	 */
	const files = useMemo(() => {
		const appApiBase = currentApp?.config.requestConfig.apiBase || ''
		return (
			filesInProps?.map(item => {
				const newUrl = completeFileUrl(item.url, appApiBase)
				return {
					...item,
					url: newUrl,
				}
			}) || []
		)
	}, [filesInProps, currentApp])

	if (!filesInProps?.length) {
		return null
	}

	const isAllImages = files.every(item => item.type === 'image' && item.url)

	// 如果所有文件都是图片，则直接展示图片列表
	if (isAllImages) {
		return (
			<div className="flex flex-wrap">
				{files.map((item: IMessageFileItem) => {
					return (
						<PhotoProvider key={item.id}>
							<PhotoView src={item.url}>
								<img
									src={item.url}
									key={item.id}
									alt={item.filename}
									className="mr-2 h-24 w-24 cursor-zoom-in rounded-lg"
									style={{
										objectFit: 'cover',
									}}
								/>
							</PhotoView>
						</PhotoProvider>
					)
				})}
			</div>
		)
	}

	// 如果存在非图片文件，则展示文件列表
	return (
		<>
			{files.map((item: IMessageFileItem) => {
				return (
					<a
						title="点击下载文件"
						target="_blank"
						rel="noreferrer"
						key={item.id}
						href={item.url}
						className="cursor-pointer no-underline"
						onClick={async e => {
							if (item.belongs_to === 'assistant') {
								// 如果是 AI 生成的文件，直接使用 a 标签下载功能，因为 preview API 只能用于用户上传的文件
								return
							}
							// 否则阻止默认行为，调用专用的预览 API
							e.preventDefault()
							try {
								const result = await difyApi?.filePreview({
									file_id: item.upload_file_id as string,
									as_attachment: true,
								})

								// Case 1: API returns a fetch Response
								if (typeof Response !== 'undefined' && result instanceof Response) {
									const cd = result.headers?.get?.('content-disposition') || null
									const filename = parseFilenameFromCD(cd, item.filename)
									const blob = await result.blob()
									triggerDownload(blob, filename)
									return
								}
								console.warn('预览接口返回格式错误，无法下载', result)
							} catch (err) {
								console.error('下载失败', err)
							}
						}}
					>
						<Attachments.FileCard
							key={item.id}
							item={{
								...item,
								uid: item.upload_file_id || item.id,
								name: item.filename,
								size: item.size,
								thumbUrl: item.url,
								url: item.url,
							}}
						/>
					</a>
				)
			})}
		</>
	)
}
