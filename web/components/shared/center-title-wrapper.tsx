/**
 * 头部标题区域容器
 */
export default function CenterTitleWrapper(props: { children: React.ReactNode }) {
	return (
		<div className="text-primary flex h-full flex-[4] items-center justify-center overflow-hidden font-semibold">
			<div className="bg-theme-btn-bg flex items-center overflow-hidden rounded-3xl px-4 py-2 text-sm shadow-md dark:shadow-none">
				{props.children}
			</div>
		</div>
	)
}
