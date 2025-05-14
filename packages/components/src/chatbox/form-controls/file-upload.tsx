import { UploadOutlined } from '@ant-design/icons'
import { DifyApi, IGetAppParametersResponse } from '@dify-chat/api'
import { Button, GetProp, message, Upload } from 'antd'
import { RcFile, UploadFile } from 'antd/es/upload'
import { useEffect, useMemo, useState } from 'react'

import { FileTypeMap, getFileExtByName, getFileTypeByName } from '../../message-sender/utils'

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
	uploadFileApi: DifyApi['uploadFile']
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
	const {
		mode = 'multiple',
		maxCount,
		disabled,
		allowed_file_types,
		uploadFileApi,
		value,
		onChange,
	} = props
	const [files, setFiles] = useState<GetProp<typeof Upload, 'fileList'>>([])

	useEffect(() => {
		if (mode === 'single') {
			setFiles(value ? [value as IUploadFileItem] : [])
		} else {
			const multiModeValues = value as IUploadFileItem[] | undefined
			if (multiModeValues?.length && multiModeValues?.length !== files.length) {
				setFiles(multiModeValues)
			}
		}
	}, [value])

	const formatFiles = (files: IUploadFileItem[]) => {
		return files?.map(file => {
			const fileType = getFileTypeByName(file.name)
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

		const result = await uploadFileApi(file)
		clear()
		const fileType = getFileTypeByName(file.name)
		updateFiles([
			{
				...fileBaseInfo,
				upload_file_id: result.id,
				type: fileType || 'document',
				percent: 100,
				status: 'done',
			},
		])
	}

	return (
		<Upload
			maxCount={mode === 'single' ? 1 : maxCount}
			disabled={disabled}
			fileList={files}
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
				点击上传
			</Button>
		</Upload>
	)
}
