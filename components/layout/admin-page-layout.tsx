import Image from 'next/image'
import { ReactNode } from 'react'

import LogoIcon from '@/assets/images/logo.png'

import AdminHeaderTitle from './admin-header-title'
import PageLayout from './page-layout'

interface IAdminPageLayoutProps {
	children: ReactNode
}

/**
 * 控制台的页面布局组件
 */
export default function AdminPageLayout(props: IAdminPageLayoutProps) {
	const { children } = props

	return (
		<PageLayout
			headerProps={{
				logoText: 'Dify App Hub Platform',
				renderLogo: () => (
					<Image
						src={LogoIcon}
						width={32}
						height={32}
						alt="Dify App Hub Platform"
					/>
				),
				isTitleWrapped: true,
				title: <AdminHeaderTitle />,
			}}
		>
			{children}
		</PageLayout>
	)
}
