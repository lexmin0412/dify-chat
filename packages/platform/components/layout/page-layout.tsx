import { HeaderLayout, IHeaderLayoutProps } from '@dify-chat/components'

interface IPageLayoutProps {
	headerProps: IHeaderLayoutProps
	children: React.ReactNode
}

export default function PageLayout(props: IPageLayoutProps) {
	const { headerProps, children } = props
	return (
		<div className="bg-theme-bg relative flex h-screen w-full flex-col overflow-hidden">
			{/* 头部 */}
			<HeaderLayout {...headerProps} />
			<div className="bg-theme-main-bg box-border flex flex-1 items-center overflow-x-hidden overflow-y-auto rounded-t-3xl py-6">
				{children}
			</div>
		</div>
	)
}
