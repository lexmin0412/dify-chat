import { IFile } from '@dify-chat/api'
import { useThemeContext } from '@dify-chat/theme'
import { copyToClipboard } from '@toolkit-fe/clipboard'
import { message, Tooltip } from 'antd'
import ReactEcharts from 'echarts-for-react'
import type { Element, Root, Text } from 'hast'
import 'katex/dist/katex.min.css'
import { flow } from 'lodash-es'
import React, { AnchorHTMLAttributes, Component, memo, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import RehypeKatex from 'rehype-katex'
import RehypeRaw from 'rehype-raw'
import RemarkBreaks from 'remark-breaks'
import RemarkGfm from 'remark-gfm'
import RemarkMath from 'remark-math'

import LucideIcon from '../lucide-icon'
import ButtonBlock from './blocks/button'
import MarkdownForm from './blocks/form'
import ImageBlock from './blocks/image'
import Flowchart from './blocks/mermaid'
import SVGBtn from './blocks/svg-button'
import SVGRenderer from './blocks/svg-renderer'
import ThinkBlock from './blocks/think-block'
import VideoBlock from './blocks/video'
import './index.css'

// Available language https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD
const capitalizationLanguageNameMap: Record<string, string> = {
	sql: 'SQL',
	javascript: 'JavaScript',
	java: 'Java',
	typescript: 'TypeScript',
	vbscript: 'VBScript',
	css: 'CSS',
	html: 'HTML',
	xml: 'XML',
	php: 'PHP',
	python: 'Python',
	yaml: 'Yaml',
	mermaid: 'Mermaid',
	markdown: 'MarkDown',
	makefile: 'MakeFile',
	echarts: 'ECharts',
	shell: 'Shell',
	powershell: 'PowerShell',
	json: 'JSON',
	latex: 'Latex',
	svg: 'SVG',
}
const getCorrectCapitalizationLanguageName = (language: string) => {
	if (!language) return 'Plain'

	if (language in capitalizationLanguageNameMap) return capitalizationLanguageNameMap[language]

	return language.charAt(0).toUpperCase() + language.substring(1)
}

const preprocessLaTeX = (content: string) => {
	if (typeof content !== 'string') return content

	const codeBlockRegex = /```[\s\S]*?```/g
	const codeBlocks = content.match(codeBlockRegex) || []
	let processedContent = content.replace(codeBlockRegex, 'CODE_BLOCK_PLACEHOLDER')

	processedContent = flow([
		(str: string) => str.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`),
		(str: string) => str.replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`),
		(str: string) => str.replace(/\\\((.*?)\\\)/g, (_, equation) => `$$${equation}$$`),
		(str: string) =>
			str.replace(/(^|[^\\])\$(.+?)\$/g, (_, prefix, equation) => `${prefix}$${equation}$`),
	])(processedContent)

	codeBlocks.forEach(block => {
		processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', block)
	})

	return processedContent
}

const preprocessThinkTag = (content: string) => {
	return flow([
		(str: string) => str?.replace('<think>\n', '<details data-think=true>\n'),
		(str: string) => str.replace('\n</think>', '\n[ENDTHINKFLAG]</details>'),
	])(content)
}

export function PreCode(props: { children: React.ReactNode }) {
	const ref = useRef<HTMLPreElement>(null)

	return (
		<pre ref={ref}>
			<span className="copy-code-button"></span>
			{props.children}
		</pre>
	)
}

// **Add code block
// Avoid error #185 (Maximum update depth exceeded.
// This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
// React limits the number of nested updates to prevent infinite loops.)
// Reference A: https://reactjs.org/docs/error-decoder.html?invariant=185
// Reference B1: https://react.dev/reference/react/memo
// Reference B2: https://react.dev/reference/react/useMemo
// ****
// The original error that occurred in the streaming response during the conversation:
// Error: Minified React error 185;
// visit https://reactjs.org/docs/error-decoder.html?invariant=185 for the full message
// or use the non-minified dev environment for full errors and additional helpful warnings.

interface ICodeBlockProps {
	inline?: boolean
	className?: string
	children?: React.ReactNode
	[key: string]: unknown
}

const CodeBlock = memo(({ inline, className, children, ...props }: ICodeBlockProps) => {
	const { isLight } = useThemeContext()
	const [isSVG, setIsSVG] = useState(true)
	const match = /language-(\w+)/.exec(className || '')
	const language = match?.[1]
	const languageShowName = getCorrectCapitalizationLanguageName(language || '')
	const chartData = useMemo(() => {
		if (language === 'echarts') {
			try {
				return JSON.parse(String(children).replace(/\n$/, ''))
			} catch (error) {
				console.error('ECharts error - Wrong JSON format.', error)
			}
		}
		return JSON.parse('{"title":{"text":"ECharts error - Wrong JSON format."}}')
	}, [language, children])

	const renderCodeContent = useMemo(() => {
		const content = String(children).replace(/\n$/, '')
		if (language === 'mermaid' && isSVG) {
			return <Flowchart PrimitiveCode={content} />
		} else if (language === 'echarts') {
			return (
				<div
					style={{
						minHeight: '350px',
						minWidth: '100%',
						overflowX: 'scroll',
					}}
				>
					<ErrorBoundary>
						<ReactEcharts
							option={chartData}
							style={{ minWidth: '700px' }}
						/>
					</ErrorBoundary>
				</div>
			)
		} else if (language === 'svg' && isSVG) {
			return (
				<ErrorBoundary>
					<SVGRenderer content={content} />
				</ErrorBoundary>
			)
		} else {
			return (
				<SyntaxHighlighter
					{...props}
					style={isLight ? atomOneLight : atomOneDark}
					customStyle={{
						paddingLeft: 12,
						borderBottomLeftRadius: '10px',
						borderBottomRightRadius: '10px',
					}}
					language={match?.[1]}
					showLineNumbers
					PreTag="div"
				>
					{content}
				</SyntaxHighlighter>
			)
		}
	}, [language, match, props, children, chartData, isSVG])

	if (inline || !match)
		return (
			<code
				{...props}
				className={className}
			>
				{children}
			</code>
		)

	return (
		<div className="relative rounded-lg border border-solid border-gray-200 dark:border-gray-600">
			<div className="border-divider-subtle bg-components-input-bg-normal flex h-8 items-center justify-between rounded-t-[10px] border-b p-1 pl-3">
				<div className="text-gray-700">{languageShowName}</div>
				<div className="flex items-center gap-1">
					{['mermaid', 'svg'].includes(language!) && (
						<SVGBtn
							isSVG={isSVG}
							setIsSVG={setIsSVG}
						/>
					)}
					<Tooltip title="复制代码">
						<div className="inline-flex items-center rounded p-1 hover:bg-gray-100">
							<LucideIcon
								className="cursor-pointer"
								name="copy"
								onClick={async () => {
									await copyToClipboard(String(children).replace(/\n$/, ''))
									message.success('复制成功')
								}}
							/>
						</div>
					</Tooltip>
				</div>
			</div>
			{renderCodeContent}
		</div>
	)
})
CodeBlock.displayName = 'CodeBlock'

interface IScriptBlockProps {
	node: HTMLScriptElement
}

const ScriptBlock = memo((props: IScriptBlockProps) => {
	const { node } = props
	const firstChild = node.children[0]
	// @ts-expect-error FIXME: 类型错误待解决
	const scriptContent = firstChild?.value || ''
	return `<script>${scriptContent}</script>`
})
ScriptBlock.displayName = 'ScriptBlock'

interface IParagraphProps {
	node?: HTMLParagraphElement
	children?: React.ReactNode
}

const Paragraph = (paragraph: IParagraphProps) => {
	const { node } = paragraph
	const children_node = node?.children
	if (
		children_node &&
		children_node[0] &&
		'tagName' in children_node[0] &&
		children_node[0].tagName === 'img'
	) {
		return (
			<>
				{/* <ImageGallery srcs={[children_node[0].properties.src]} /> */}
				{Array.isArray(paragraph.children) ? <p>{paragraph.children.slice(1)}</p> : null}
			</>
		)
	}
	return <p>{paragraph.children}</p>
}

interface ILinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	node: HTMLAnchorElement
	href?: string
	target?: string
}

const Link = ({ node, ...props }: ILinkProps) => {
	const firstChild = node.children[0]
	return (
		<a
			{...props}
			target="_blank"
			className="!decoration-primary-700 cursor-pointer px-1 underline decoration-dashed"
		>
			{/* @ts-expect-error FIXME: 类型错误待解决 */}
			{firstChild ? firstChild?.value : 'Download'}
		</a>
	)
}

export function MarkdownRenderer(props: {
	markdownText: string
	className?: string
	customDisallowedElements?: string[]
	onSubmit?: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
}) {
	const { markdownText = '', onSubmit } = props

	/**
	 * 最终用于渲染的 markdown 文本
	 */
	const text4Render = useMemo(() => {
		let result = markdownText || ''
		// 正则匹配所有 markdown 图片转为 img 标签，保留 src/alt 属性
		// 这种处理是为了解决 markdownText 以一个 md 图片开始（如: `![alt](url)`）时，图片无法展示的问题
		result = result?.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (match, alt, src) => {
			return `<img src="${src}" alt="${alt}" />`
		})
		result = flow([preprocessThinkTag, preprocessLaTeX])(result)
		// 如果是以图片标签开头，则加一个 p
		return result
	}, [markdownText])

	return (
		<div className="dc-react-markdown-container text-theme-text">
			<ReactMarkdown
				// urlTransform={(value: string) => defaultUrlTransform(value)}
				remarkPlugins={[RemarkGfm, [RemarkMath, { singleDollarTextMath: false }], RemarkBreaks]}
				rehypePlugins={[
					RehypeKatex,
					RehypeRaw,
					// The Rehype plug-in is used to remove the ref attribute of an element
					() => {
						return (tree: Root) => {
							const iterate = (node: Root | Element | Text) => {
								if (node.type === 'element') {
									const elementNode: Element = node
									if (elementNode.properties?.ref) {
										delete elementNode.properties.ref
									}
									if (!/^[a-z][a-z0-9]*$/i.test(elementNode.tagName)) {
										const textNode: Text = {
											type: 'text',
											value: `<${elementNode.tagName}`,
										}
										Object.assign(node, textNode)
									}
								}

								if ('children' in node) {
									const parentNode = node as Root | Element
									// @ts-expect-error FIXME: 类型错误待解决
									parentNode.children.forEach(iterate)
								}
							}
							// @ts-expect-error FIXME: 类型错误待解决
							tree.children.forEach(iterate)
						}
					},
				]}
				disallowedElements={[
					'iframe',
					'head',
					'html',
					'meta',
					'link',
					'style',
					'body',
					...(props.customDisallowedElements || []),
				]}
				components={{
					// @ts-expect-error FIXME: 类型错误待解决
					code: CodeBlock,
					// @ts-expect-error FIXME: 类型错误待解决
					a: Link,
					// @ts-expect-error FIXME: 类型错误待解决
					p: Paragraph,
					form: props => (
						<MarkdownForm
							{...props}
							onSend={(values: string) => {
								onSubmit?.(values)
							}}
						/>
					),
					// @ts-expect-error FIXME: 类型错误待解决
					script: ScriptBlock,
					details: ThinkBlock,
					// @ts-expect-error FIXME: 类型错误待解决
					img: ImageBlock,
					// @ts-expect-error FIXME: 类型错误待解决
					video: VideoBlock,
					button: props => {
						return (
							<ButtonBlock
								{...props}
								onSend={(values: string) => {
									onSubmit?.(values)
								}}
							/>
						)
					},
				}}
			>
				{text4Render}
			</ReactMarkdown>
		</div>
	)
}

// **Add an ECharts runtime error handler
// Avoid error #7832 (Crash when ECharts accesses undefined objects)
// This can happen when a component attempts to access an undefined object that references an unregistered map, causing the program to crash.

class ErrorBoundary extends Component {
	constructor(props: ErrorBoundary['props']) {
		super(props)
		this.state = { hasError: false }
	}

	componentDidCatch(error: Error | null, errorInfo: object) {
		this.setState({ hasError: true })
		console.error(error, errorInfo)
	}

	render() {
		// @ts-expect-error FIXME: 类型错误待解决
		if (this.state.hasError)
			return (
				<div>
					Oops! An error occurred. This could be due to an ECharts runtime error or invalid SVG
					content. <br />
					(see the browser console for more information)
				</div>
			)
		// @ts-expect-error FIXME: 类型错误待解决
		return this.props.children
	}
}
