'use client'

import { Button, Drawer, Form, Input, message, Space } from 'antd'
import { useEffect, useState } from 'react'

interface User {
	id: string
	name: string | null
	email: string
	createdAt: string
	updatedAt: string
}

interface UserEditDrawerProps {
	visible: boolean
	user: User | null
	onClose: () => void
	onSaveSuccess: () => void
}

interface UserFormData {
	name: string
	email: string
	password?: string
}

export default function UserEditDrawer({
	visible,
	user,
	onClose,
	onSaveSuccess,
}: UserEditDrawerProps) {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const isEditing = !!user

	useEffect(() => {
		if (visible) {
			if (user) {
				form.setFieldsValue({
					name: user.name || '',
					email: user.email,
				})
			} else {
				form.resetFields()
			}
		}
	}, [visible, user, form])

	const handleSubmit = async (values: UserFormData) => {
		setLoading(true)
		try {
			const url = isEditing ? `/api/users/${user.id}` : '/api/users'
			const method = isEditing ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			})

			if (response.ok) {
				message.success(isEditing ? '更新用户成功' : '添加用户成功')
				onSaveSuccess()
			} else {
				const error = await response.json()
				message.error(error.message || '操作失败')
			}
		} catch (error) {
			console.error('操作时发生错误', error)
			message.error('操作时发生错误')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Drawer
			title={isEditing ? '编辑用户' : '添加用户'}
			size={400}
			open={visible}
			onClose={onClose}
			extra={
				<div className="flex justify-end">
					<Space>
						<Button onClick={onClose}>取消</Button>
						<Button
							type="primary"
							loading={loading}
							onClick={() => form.submit()}
						>
							{isEditing ? '更新' : '添加'}
						</Button>
					</Space>
				</div>
			}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
			>
				<Form.Item
					name="name"
					label="姓名"
					rules={[{ required: true, message: '请输入姓名' }]}
				>
					<Input placeholder="请输入用户姓名" />
				</Form.Item>

				<Form.Item
					name="email"
					label="邮箱"
					rules={[
						{ required: true, message: '请输入邮箱' },
						{ type: 'email', message: '请输入有效的邮箱地址' },
					]}
				>
					<Input placeholder="请输入邮箱地址" />
				</Form.Item>

				{!isEditing && (
					<Form.Item
						name="password"
						label="密码"
						rules={[
							{ required: true, message: '请输入密码' },
							{ min: 6, message: '密码至少6位' },
						]}
					>
						<Input.Password placeholder="请输入密码" />
					</Form.Item>
				)}

				{isEditing && (
					<Form.Item
						name="password"
						label="新密码"
						help="留空则不修改密码"
						rules={[{ min: 6, message: '密码至少6位' }]}
					>
						<Input.Password placeholder="留空则不修改密码" />
					</Form.Item>
				)}
			</Form>
		</Drawer>
	)
}
