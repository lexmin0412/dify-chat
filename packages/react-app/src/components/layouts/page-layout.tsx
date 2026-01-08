import { HeaderLayout, IHeaderLayoutProps } from '@/components'

interface IPageLayoutProps {
	headerProps: IHeaderLayoutProps
	children: React.ReactNode
}

export default function PageLayout(props: IPageLayoutProps) {
	const { headerProps, children } = props
	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden bg-theme-bg">
			{/* 头部 */}
			<HeaderLayout {...headerProps} />
			<div className="box-border flex flex-1 items-center overflow-y-auto overflow-x-hidden rounded-t-3xl bg-theme-main-bg py-6">
				{children}
			</div>
		</div>
	)
}
