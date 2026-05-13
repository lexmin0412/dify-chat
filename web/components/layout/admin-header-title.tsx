'use client'

import { AppstoreOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, message, Segmented, Space } from 'antd'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

enum ETopMenuKeys {
	AppManagement = 'app-management',
	UserManagement = 'user-management',
}

interface ITopMenuOption {
	label: string
	value: ETopMenuKeys
	route: string
	icon?: React.ReactNode
}

const TopMenuOptions: ITopMenuOption[] = [
	{
		label: '应用管理',
		icon: <AppstoreOutlined />,
		value: ETopMenuKeys.AppManagement,
		route: '/app-management',
	},
	{
		label: '用户管理',
		icon: <UserOutlined />,
		value: ETopMenuKeys.UserManagement,
		route: '/user-management',
	},
]

export default function AdminHeaderTitle() {
	const [activeKey, setActiveKey] = useState<ETopMenuKeys>()
	const { data: session } = useSession()
	const navigate = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		const key = TopMenuOptions.find(item => item.route === pathname)?.value
		if (key) {
			setActiveKey(key)
		}
	}, [pathname])

	const handleLogout = async () => {
		await signOut({ redirect: false })
		navigate.push('/login')
	}

	const menuItems = [
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: '退出登录',
			onClick: handleLogout,
		},
	]

	return (
		<Space>
			<Segmented
				value={activeKey}
				size="large"
				shape="round"
				options={TopMenuOptions}
				onChange={key => {
					const route = TopMenuOptions.find(item => item.value === key)?.route
					if (route) {
						navigate.push(route)
					} else {
						message.error('路径不存在')
					}
				}}
			/>
			{session?.user && (
				<Dropdown
					menu={{ items: menuItems }}
					placement="bottomRight"
				>
					<Button
						type="text"
						icon={<UserOutlined />}
					>
						{session.user.name || session.user.email}
					</Button>
				</Dropdown>
			)}
		</Space>
	)
}
