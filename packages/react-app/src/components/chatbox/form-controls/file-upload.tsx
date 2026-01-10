import { UploadOutlined } from '@ant-design/icons'
import { IGetAppParametersResponse } from '@dify-chat/api'
import { useAppContext } from '@dify-chat/core'
import { Button, GetProp, message, Upload } from 'antd'
import { RcFile, UploadFile } from 'antd/es/upload'
import { useEffect, useMemo, useState } from 'react'

import { FileTypeMap, getDifyFileType, getFileExtByName } from '@/components/message-sender/utils'
import { useGlobalStore } from '@/store'
import { completeFileUrl } from '@/utils'
import { useTranslation } from 'react-i18next'

export interface IUploadFileItem extends UploadFile {
	type?: string
	transfer_method?: 'local_file' | 'remote_url'
	upload_file_id?: string
	related_id?: string
	remote_url?: string
	filename?: string
}

interface IFileUploadCommonProps {
	allowed_file_types: IGetAppParametersResponse['file_upload']['allowed_file_types']
	disabled?: boolean
	maxCount?: number
}

interface IFileUploadSingleProps extends IFileUploadCommonProps {
	value?: IUploadFileItem
	onChange?: (file: IUploadFileItem) => void
	mode: 'single'
}

interface IFileUploadMultipleProps extends IFileUploadCommonProps {
	value?: IUploadFileItem[]
	onChange?: (files: IUploadFileItem[]) => void
	mode?: 'multiple'
}

type IFileUploadProps = IFileUploadSingleProps | IFileUploadMultipleProps

export default function FileUpload(props: IFileUploadProps) {
	const { mode = 'multiple', maxCount, disabled, allowed_file_types, value, onChange } = props
	const { difyApi } = useGlobalStore()
	const [files, setFiles] = useState<GetProp<typeof Upload, 'fileList'>>([])
	const { currentApp } = useAppContext()
	const { t } = useTranslation()

	useEffect(() => {
		if (mode === 'single') {
			setFiles(value ? [value as IUploadFileItem] : [])
		} else {
			const multiModeValues = value as IUploadFileItem[] | undefined
			if (!multiModeValues?.length) {
				setFiles([])
			} else if (multiModeValues?.length !== files.length) {
				setFiles(multiModeValues)
			}
		}
	}, [value])

	const formatFiles = (files: IUploadFileItem[]) => {
		return files?.map(file => {
			const fileType = getDifyFileType(file.name, allowed_file_types)
			return {
				...file,
				type: fileType,
			}
		})
	}

	const updateFiles = (newFiles: IUploadFileItem[], action: 'update' | 'remove' = 'update') => {
		const formattedNewFiles = formatFiles(newFiles)
		const newFilesState =
			mode === 'single'
				? formattedNewFiles
				: action === 'remove'
					? newFiles
					: [...files, ...formattedNewFiles]
		setFiles(newFilesState)
		if (mode === 'single') {
			;(onChange as IFileUploadSingleProps['onChange'])?.(newFilesState[0])
		} else {
			;(onChange as IFileUploadMultipleProps['onChange'])?.(newFilesState)
		}
	}

	const allowedFileTypes = useMemo(() => {
		const result: string[] = []
		allowed_file_types?.forEach(item => {
			if (FileTypeMap.get(item)) {
				result.push(...((FileTypeMap.get(item) as string[]) || []))
			}
		})
		return result
	}, [allowed_file_types])

	const handleUpload = async (file: RcFile) => {
		const fileBaseInfo: IUploadFileItem = {
			uid: file.uid,
			name: file.name,
			status: 'uploading',
			size: file.size,
			type: file.type,
			originFileObj: file,
			transfer_method: 'local_file',
		}

		// 模拟上传进度
		const mockLoadingProgress = () => {
			let percent = 0
			updateFiles([
				{
					...fileBaseInfo,
					percent: percent,
				},
			])
			const interval = setInterval(() => {
				if (percent >= 99) {
					clearInterval(interval)
					return
				}
				percent = percent + 1
				updateFiles([
					{
						...fileBaseInfo,
						percent,
					},
				])
			}, 100)
			return {
				clear: () => clearInterval(interval),
			}
		}
		const { clear } = mockLoadingProgress()

		const result = await difyApi!.uploadFile(file)
		clear()
		const fileType = getDifyFileType(file.name, allowed_file_types)
		updateFiles([
			{
				...fileBaseInfo,
				upload_file_id: result.id,
				type: fileType || 'custom',
				percent: 100,
				status: 'done',
			},
		])
	}

	/**
	 * 用于渲染的文件列表
	 */
	const files4Render = useMemo(() => {
		return files.map(item => {
			return {
				...item,
				url: completeFileUrl(item.url || '', currentApp?.config.requestConfig.apiBase || ''),
			}
		})
	}, [files, currentApp?.config.requestConfig.apiBase])

	return (
		<Upload
			maxCount={mode === 'single' ? 1 : maxCount}
			disabled={disabled}
			fileList={files4Render}
			beforeUpload={async file => {
				// 校验文件类型
				// 自定义上传
				const ext = getFileExtByName(file.name)
				// 校验文件类型
				if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(ext!)) {
					message.error(`不支持的文件类型: ${ext}`)
					return false
				}

				handleUpload(file)
				return false
			}}
			onRemove={file => {
				updateFiles(
					files.filter(item => item.uid !== file.uid),
					'remove',
				)
			}}
		>
			<Button
				disabled={disabled}
				icon={<UploadOutlined />}
			>
				{t('form.upload_placeholder')}
			</Button>
		</Upload>
	)
}
