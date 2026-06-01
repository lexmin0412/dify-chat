import classNames from 'classnames'
import { PhotoProvider, PhotoView } from 'react-photo-view'

interface IImageProps {
	className?: string
	alt?: string
	src: string
}

/**
 * 图片渲染组件
 */
export default function ImageBlock(props: IImageProps) {
	const { className, src, alt } = props

	const imgClassNames = classNames({
		'w-full h-full max-w-[500px] rounded-lg mt-2 cursor-zoom-in': true,
		[`${className}`]: !!className,
	})

	return (
		<PhotoProvider>
			<PhotoView src={src}>
				<img
					className={imgClassNames}
					alt={alt || '图片加载失败'}
					src={src}
				/>
			</PhotoView>
		</PhotoProvider>
	)
}
