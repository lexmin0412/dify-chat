import ReactMarkdown from 'react-markdown'
import ReactEcharts from 'echarts-for-react'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import RehypeRaw from 'rehype-raw'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  atelierHeathDark,
  atelierHeathLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Component, memo, useMemo, useRef, useState } from 'react'
import { flow } from 'lodash-es'
import Flowchart from './blocks/mermaid'
import ThinkBlock from './blocks/think-block'
import SVGRenderer from './blocks/svg-renderer'
import { CopyOutlined } from '@ant-design/icons'
import { copyToClipboard } from '@toolkit-fe/clipboard'
import SVGBtn from './blocks/svg-button'
import { Button, message } from 'antd'
import './index.css'
import MarkdownForm from './blocks/form'
import { IFile } from '@dify-chat/api'
import VideoBlock from './blocks/video'
import ImageBlock from './blocks/image'

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
  if (!language)
    return 'Plain'

  if (language in capitalizationLanguageNameMap)
    return capitalizationLanguageNameMap[language]

  return language.charAt(0).toUpperCase() + language.substring(1)
}

const preprocessLaTeX = (content: string) => {
  if (typeof content !== 'string')
    return content

  const codeBlockRegex = /```[\s\S]*?```/g
  const codeBlocks = content.match(codeBlockRegex) || []
  let processedContent = content.replace(codeBlockRegex, 'CODE_BLOCK_PLACEHOLDER')

  processedContent = flow([
    (str: string) => str.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\((.*?)\\\)/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/(^|[^\\])\$(.+?)\$/g, (_, prefix, equation) => `${prefix}$${equation}$`),
  ])(processedContent)

  codeBlocks.forEach((block) => {
    processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', block)
  })

  return processedContent
}

const preprocessThinkTag = (content: string) => {
  return flow([
    (str: string) => str.replace('<think>\n', '<details data-think=true>\n'),
    (str: string) => str.replace('\n</think>', '\n[ENDTHINKFLAG]</details>'),
  ])(content)
}

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null)

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
      ></span>
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

const CodeBlock: any = memo(({ inline, className, children, ...props }: any) => {
  const theme = 'light'
  const [isSVG, setIsSVG] = useState(true)
  const match = /language-(\w+)/.exec(className || '')
  const language = match?.[1]
  const languageShowName = getCorrectCapitalizationLanguageName(language || '')
  const chartData = useMemo(() => {
    if (language === 'echarts') {
      try {
        return JSON.parse(String(children).replace(/\n$/, ''))
      }
      catch (error) { }
    }
    return JSON.parse('{"title":{"text":"ECharts error - Wrong JSON format."}}')
  }, [language, children])

  const renderCodeContent = useMemo(() => {
    const content = String(children).replace(/\n$/, '')
    if (language === 'mermaid' && isSVG) {
      return <Flowchart PrimitiveCode={content} />
    }
    else if (language === 'echarts') {
      return (
        <div style={{ minHeight: '350px', minWidth: '100%', overflowX: 'scroll' }}>
          <ErrorBoundary>
            <ReactEcharts option={chartData} style={{ minWidth: '700px' }} />
          </ErrorBoundary>
        </div>
      )
    }
    else if (language === 'svg' && isSVG) {
      return (
        <ErrorBoundary>
          <SVGRenderer content={content} />
        </ErrorBoundary>
      )
    }
    else {
      return (
        <SyntaxHighlighter
          {...props}
          style={theme === 'light' ? atelierHeathLight : atelierHeathDark}
          customStyle={{
            paddingLeft: 12,
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            backgroundColor: 'var(--color-components-input-bg-normal)',
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
    return <code {...props} className={className}>{children}</code>

  return (
    <div className='relative'>
      <div className='flex h-8 items-center justify-between rounded-t-[10px] border-b border-divider-subtle bg-components-input-bg-normal p-1 pl-3'>
        <div className='text-gray-700'>{languageShowName}</div>
        <div className='flex items-center gap-1'>
          {(['mermaid', 'svg']).includes(language!) && <SVGBtn isSVG={isSVG} setIsSVG={setIsSVG} />}
          <Button>
            <CopyOutlined onClick={async()=>{
							await copyToClipboard(String(children).replace(/\n$/, ''))
							message.success('复制成功')
						}} />
          </Button>
        </div>
      </div>
      {renderCodeContent}
    </div>
  )
})
CodeBlock.displayName = 'CodeBlock'

const ScriptBlock = memo(({ node }: any) => {
  const scriptContent = node.children[0]?.value || ''
  return `<script>${scriptContent}</script>`
})
ScriptBlock.displayName = 'ScriptBlock'

const Paragraph = (paragraph: any) => {
  const { node }: any = paragraph
  const children_node = node.children
  if (children_node && children_node[0] && 'tagName' in children_node[0] && children_node[0].tagName === 'img') {
    return (
      <>
        {/* <ImageGallery srcs={[children_node[0].properties.src]} /> */}
        {
          Array.isArray(paragraph.children) ? <p>{paragraph.children.slice(1)}</p> : null
        }
      </>
    )
  }
  return <p>{paragraph.children}</p>
}

const Link = ({ node, ...props }: any) => {
	return <a {...props} target="_blank" className="cursor-pointer underline !decoration-primary-700 decoration-dashed">{node.children[0] ? node.children[0]?.value : 'Download'}</a>
}

export function MarkdownRenderer(props: {
	markdownText: string; className?: string; customDisallowedElements?: string[]
	onSubmit?: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
}) {
	const { onSubmit } = props

	/**
	 * 最终用于渲染的 markdown 文本
	 */
	const text4Render = useMemo(() => {
		let result = props.markdownText
		// 正则匹配所有 markdown 图片转为 img 标签，保留 src/alt 属性
		// 这种处理是为了解决 markdownText 以一个 md 图片开始（如: `![alt](url)`）时，图片无法展示的问题
		result = result.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (match, alt, src) => {
			return `<img src="${src}" alt="${alt}" />`
		})
		result = flow([
			preprocessThinkTag,
			preprocessLaTeX,
		])(result)
		// 如果是以图片标签开头，则加一个 p
		return result
	}, [props.markdownText])

  return (
    <div className='text-default'>
      <ReactMarkdown
				// urlTransform={(value: string) => defaultUrlTransform(value)}
        remarkPlugins={[
          RemarkGfm,
          [RemarkMath, { singleDollarTextMath: false }],
          RemarkBreaks,
        ]}
        rehypePlugins={[
          RehypeKatex,
          RehypeRaw as any,
          // The Rehype plug-in is used to remove the ref attribute of an element
          () => {
            return (tree) => {
              const iterate = (node: any) => {
                if (node.type === 'element' && node.properties?.ref)
                  delete node.properties.ref

                if (node.type === 'element' && !/^[a-z][a-z0-9]*$/i.test(node.tagName)) {
                  node.type = 'text'
                  node.value = `<${node.tagName}`
                }

                if (node.children)
                  node.children.forEach(iterate)
              }
              tree.children.forEach(iterate)
            }
          },
        ]}
        disallowedElements={['iframe', 'head', 'html', 'meta', 'link', 'style', 'body', ...(props.customDisallowedElements || [])]}
        components={{
          code: CodeBlock,
          a: Link,
          p: Paragraph,
          form: (props) => <MarkdownForm {...props} onSend={(values: string)=>{
						onSubmit?.(values)
					}} />,
          script: ScriptBlock as any,
          details: ThinkBlock,
					// @ts-expect-error TODO: 类型待优化
					img: ImageBlock,
					// @ts-expect-error TODO: 类型待优化
					video: VideoBlock,
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
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ hasError: true })
    console.error(error, errorInfo)
  }

  render() {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    if (this.state.hasError)
      return <div>Oops! An error occurred. This could be due to an ECharts runtime error or invalid SVG content. <br />(see the browser console for more information)</div>
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return this.props.children
  }
}
