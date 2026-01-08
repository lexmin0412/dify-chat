'use client'

import { Alert, Button, Form, Input, message, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InitPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [initialized, setInitialized] = useState<boolean | null>(null)

	useEffect(() => {
		const checkStatus = async () => {
			try {
				const res = await fetch('/api/init/status', { cache: 'no-store' })
				const data = await res.json()
				setInitialized(!!data.initialized)
				if (data.initialized) {
					message.info('系统已初始化，正在跳转到登录页')
					router.replace('/login')
				}
			} catch (e) {
				console.error('初始化状态检查失败:', e)
				message.error('初始化状态检查失败')
			}
		}
		checkStatus()
	}, [router])

	const onFinish = async (values: {
		name: string
		email: string
		password: string
		confirmPassword: string
	}) => {
		if (values.password !== values.confirmPassword) {
			message.warning('两次输入的密码不一致')
			return
		}

		setLoading(true)
		try {
			const res = await fetch('/api/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
			})
			if (res.ok) {
				message.success('管理员创建成功，请使用该账户登录')
				router.replace('/login')
			} else {
				const data = await res.json().catch(() => ({ message: '初始化失败' }))
				message.error(data.message || '初始化失败')
			}
		} catch (error) {
			console.error('初始化失败:', error)
			message.error('网络错误，请稍后重试')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-md rounded bg-white p-6 shadow">
				<Typography.Title level={3}>系统初始化</Typography.Title>
				<Typography.Paragraph>
					首次使用，请创建管理员账户。初始化完成后将跳转至登录页。
				</Typography.Paragraph>

				{initialized === false && (
					<Alert
						type="info"
						showIcon
						message="系统未初始化，请创建管理员账户"
						className="mb-4"
					/>
				)}

				<Form
					layout="vertical"
					onFinish={onFinish}
				>
					<Form.Item
						label="管理员姓名"
						name="name"
						rules={[{ required: true, message: '请输入管理员姓名' }]}
					>
						<Input placeholder="例如：管理员" />
					</Form.Item>
					<Form.Item
						label="管理员邮箱"
						name="email"
						rules={[
							{ required: true, message: '请输入管理员邮箱' },
							{ type: 'email', message: '邮箱格式不正确' },
						]}
					>
						<Input placeholder="例如：admin@example.com" />
					</Form.Item>
					<Form.Item
						label="管理员密码"
						name="password"
						rules={[
							{ required: true, message: '请输入密码' },
							{ min: 8, message: '密码至少 8 位' },
						]}
					>
						<Input.Password placeholder="至少 8 位" />
					</Form.Item>
					<Form.Item
						label="确认密码"
						name="confirmPassword"
						rules={[{ required: true, message: '请再次输入密码' }]}
					>
						<Input.Password placeholder="再次输入密码" />
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							block
							loading={loading}
						>
							创建管理员并初始化
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	)
}
