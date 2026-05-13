import { DifyApi, IAnnotationItem } from '@dify-chat/api'
import { IDifyAppItem } from '@dify-chat/core'
import { useRequest } from 'ahooks'
import { Button, Drawer, Form, Input, message, Popconfirm, Popover, Space, Table } from 'antd'
import { useEffect, useState } from 'react'

interface IAnnotationManagerDrawerProps {
	open: boolean
	onClose: () => void
	appItem?: IDifyAppItem
}

const DEFAULT_PAGE_SIZE = 10

export const AnnotationManagerDrawer = (props: IAnnotationManagerDrawerProps) => {
	const { open, onClose, appItem } = props
	const [difyApi, setDifyApi] = useState<DifyApi>()

	// State for Add/Edit Modal
	const [modalOpen, setModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
	const [currentAnnotation, setCurrentAnnotation] = useState<IAnnotationItem>()
	const [form] = Form.useForm()

	// Initialize DifyApi when appItem changes
	useEffect(() => {
		if (appItem) {
			setDifyApi(
				new DifyApi({
					...appItem.requestConfig,
					user: '', // User is not needed for annotation management
				}),
			)
		}
	}, [appItem])

	// Fetch List
	const {
		data,
		loading,
		run: fetchList,
		refresh,
		params,
	} = useRequest(
		async (params: { page: number; limit: number }) => {
			if (!difyApi) return { list: [], total: 0 }
			const res = await difyApi.getAnnotationList(params)
			return {
				list: res.data,
				total: res.total,
			}
		},
		{
			manual: true,
			defaultParams: [{ page: 1, limit: DEFAULT_PAGE_SIZE }],
		},
	)

	// Trigger fetch when open or difyApi ready
	useEffect(() => {
		if (open && difyApi) {
			fetchList({ page: 1, limit: DEFAULT_PAGE_SIZE })
		}
	}, [open, difyApi, fetchList])

	// Handlers
	const handleEdit = (record: IAnnotationItem) => {
		setCurrentAnnotation(record)
		setModalMode('edit')
		form.setFieldsValue({
			question: record.question,
			answer: record.answer,
		})
		setModalOpen(true)
	}

	const handleDelete = async (id: string) => {
		if (!difyApi) return
		try {
			await difyApi.deleteAnnotation(id)
			message.success('删除成功')
			refresh()
		} catch (e) {
			message.error('删除失败')
			console.error(e)
		}
	}

	const handleModalOk = async () => {
		if (!difyApi) return
		try {
			const values = await form.validateFields()
			if (modalMode === 'create') {
				await difyApi.createAnnotation(values)
				message.success('创建成功')
			} else {
				await difyApi.updateAnnotation(currentAnnotation!.id, values)
				message.success('更新成功')
			}
			setModalOpen(false)
			refresh()
		} catch (e) {
			console.error(e)
			message.error('操作失败')
		}
	}

	// Table Columns
	const columns = [
		{
			title: '问题',
			dataIndex: 'question',
			key: 'question',
			width: 200,
			render: (text: string) => (
				<Popover
					content={
						<div
							style={{
								maxWidth: 400,
								maxHeight: 300,
								overflow: 'auto',
								whiteSpace: 'pre-wrap',
							}}
						>
							{text}
						</div>
					}
					title={null}
				>
					<div
						style={{
							display: '-webkit-box',
							WebkitLineClamp: 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							cursor: 'pointer',
							wordBreak: 'break-all',
						}}
					>
						{text}
					</div>
				</Popover>
			),
		},
		{
			title: '回答',
			dataIndex: 'answer',
			key: 'answer',
			width: 200,
			render: (text: string) => (
				<Popover
					content={
						<div
							style={{
								maxWidth: 400,
								maxHeight: 300,
								overflow: 'auto',
								whiteSpace: 'pre-wrap',
							}}
						>
							{text}
						</div>
					}
					title={null}
				>
					<div
						style={{
							display: '-webkit-box',
							WebkitLineClamp: 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							cursor: 'pointer',
							wordBreak: 'break-all',
						}}
					>
						{text}
					</div>
				</Popover>
			),
		},
		{
			title: '命中次数',
			dataIndex: 'hit_count',
			key: 'hit_count',
			width: 100,
		},
		{
			title: '创建时间',
			dataIndex: 'created_at',
			key: 'created_at',
			render: (val: number) => new Date(val * 1000).toLocaleString(),
			width: 180,
		},
		{
			title: '操作',
			key: 'action',
			width: 120,
			render: (_: unknown, record: IAnnotationItem) => (
				<Space>
					<Button
						className="!px-0"
						type="link"
						onClick={() => handleEdit(record)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确认删除?"
						onConfirm={() => handleDelete(record.id)}
					>
						<Button
							className="!px-0"
							type="link"
							danger
						>
							删除
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	]

	return (
		<Drawer
			title="标注管理"
			size={1000}
			open={open}
			onClose={onClose}
			extra={
				<Button
					type="primary"
					onClick={() => {
						setModalMode('create')
						form.resetFields()
						setModalOpen(true)
					}}
				>
					新增标注
				</Button>
			}
		>
			<Table
				rowKey="id"
				columns={columns}
				dataSource={data?.list}
				loading={loading}
				className="w-full overflow-auto"
				pagination={{
					current: params?.[0]?.page || 1,
					pageSize: params?.[0]?.limit || DEFAULT_PAGE_SIZE,
					total: data?.total,
					showSizeChanger: true,
					pageSizeOptions: ['10', '20', '50', '100'],
					showTotal: total => `共 ${total} 条`,
					onChange: (page, pageSize) => fetchList({ page, limit: pageSize }),
				}}
			/>

			<Drawer
				title={modalMode === 'create' ? '新增标注' : '编辑标注'}
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				destroyOnHidden
				size={600}
				extra={
					<Space>
						<Button onClick={() => setModalOpen(false)}>取消</Button>
						<Button
							type="primary"
							onClick={handleModalOk}
						>
							确定
						</Button>
					</Space>
				}
			>
				<Form
					form={form}
					layout="vertical"
				>
					<Form.Item
						name="question"
						label="问题"
						rules={[{ required: true, message: '请输入问题' }]}
					>
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item
						name="answer"
						label="回答"
						rules={[{ required: true, message: '请输入答案' }]}
					>
						<Input.TextArea autoSize={{ minRows: 3, maxRows: 15 }} />
					</Form.Item>
				</Form>
			</Drawer>
		</Drawer>
	)
}
