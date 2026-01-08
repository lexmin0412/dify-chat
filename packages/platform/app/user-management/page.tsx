'use client'

import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { Button, message, Popconfirm, Space, Table, Tag } from 'antd'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import UserEditDrawer from './components/user-edit-drawer'

interface User {
	id: string
	name: string | null
	email: string
	createdAt: string
	updatedAt: string
}

export default function UserManagementPage() {
	const { data: session } = useSession()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(false)
	const [drawerVisible, setDrawerVisible] = useState(false)
	const [editingUser, setEditingUser] = useState<User | null>(null)

	const fetchUsers = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/users')
			if (response.ok) {
				const data = await response.json()
				setUsers(data)
			} else {
				message.error('获取用户列表失败')
			}
		} catch (error) {
			console.error('获取用户列表时发生错误', error)
			message.error('获取用户列表时发生错误')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (userId: string) => {
		try {
			const response = await fetch(`/api/users/${userId}`, {
				method: 'DELETE',
			})
			if (response.ok) {
				message.success('删除用户成功')
				fetchUsers()
			} else {
				message.error('删除用户失败')
			}
		} catch (error) {
			console.error('删除用户时发生错误', error)
			message.error('删除用户时发生错误')
		}
	}

	const handleEdit = (user: User) => {
		setEditingUser(user)
		setDrawerVisible(true)
	}

	const handleAdd = () => {
		setEditingUser(null)
		setDrawerVisible(true)
	}

	const handleDrawerClose = () => {
		setDrawerVisible(false)
		setEditingUser(null)
	}

	const handleSaveSuccess = () => {
		setDrawerVisible(false)
		setEditingUser(null)
		fetchUsers()
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const columns = [
		{
			title: '用户',
			dataIndex: 'name',
			key: 'name',
			render: (name: string | null, record: User) => (
				<Space>
					<UserOutlined />
					<div>
						<div>{name || '未设置姓名'}</div>
						<div className="text-sm text-gray-500">{record.email}</div>
					</div>
				</Space>
			),
		},
		{
			title: '状态',
			key: 'status',
			render: () => <Tag color="green">正常</Tag>,
		},
		{
			title: '创建时间',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => new Date(date).toLocaleString('zh-CN'),
		},
		{
			title: '最后更新',
			dataIndex: 'updatedAt',
			key: 'updatedAt',
			render: (date: string) => new Date(date).toLocaleString('zh-CN'),
		},
		{
			title: '操作',
			key: 'actions',
			render: (_: unknown, record: User) => (
				<Space>
					<Button
						type="text"
						icon={<EditOutlined />}
						onClick={() => handleEdit(record)}
					>
						编辑
					</Button>
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{record.id !== (session?.user as any)?.id && (
						<Popconfirm
							title="确认删除"
							description="确定要删除这个用户吗？此操作不可恢复。"
							onConfirm={() => handleDelete(record.id)}
							okText="确定"
							cancelText="取消"
						>
							<Button
								type="text"
								danger
								icon={<DeleteOutlined />}
							>
								删除
							</Button>
						</Popconfirm>
					)}
				</Space>
			),
		},
	]

	return (
		<div className="h-full w-full px-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">用户管理</h1>
					<p className="mt-1 text-gray-600">管理系统用户账户</p>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={handleAdd}
				>
					添加用户
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={users}
				rowKey="id"
				loading={loading}
				pagination={{
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: total => `共 ${total} 个用户`,
				}}
			/>

			<UserEditDrawer
				visible={drawerVisible}
				user={editingUser}
				onClose={handleDrawerClose}
				onSaveSuccess={handleSaveSuccess}
			/>
		</div>
	)
}
