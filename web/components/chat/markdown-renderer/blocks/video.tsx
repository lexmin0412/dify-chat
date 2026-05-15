import classNames from 'classnames'

/**
 * 视频渲染组件
 */
export const VideoBlock = (
	props: HTMLVideoElement & {
		children?: React.ReactNode
	},
) => {
	const { className, children, ...videoProps } = props

	const videoClassNames = classNames({
		'w-full h-full max-w-[500px] rounded-lg mt-2': true,
		[`${className}`]: !!className,
	})

	return (
		// @ts-expect-error TODO: 类型待优化
		<video
			{...videoProps}
			className={videoClassNames}
			controls
		>
			{children}
		</video>
	)
}

export default VideoBlock
