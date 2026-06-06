import { AntdRegistry } from '@ant-design/nextjs-registry'
import type { Metadata } from 'next'

import AuthSessionProvider from '@/components/auth/session-provider'
import PageLayoutWrapper from '@/components/layout/page-layout-wrapper'

import './globals.css'

export const metadata: Metadata = {
	title: 'Dify App Hub',
	description: '更贴近业务的 Dify Web APP',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body className="antialiased">
				<AuthSessionProvider>
					<AntdRegistry>
						<PageLayoutWrapper>{children}</PageLayoutWrapper>
					</AntdRegistry>
				</AuthSessionProvider>
			</body>
		</html>
	)
}
