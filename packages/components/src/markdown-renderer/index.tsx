import { Typography } from "antd"
import MarkdownIt from 'markdown-it';

interface IMarkdownRendererProps {
  /**
   * 原始 Markdown 文本
   */
  markdownText: string
}

const md = MarkdownIt({ html: true, breaks: true });

/**
 * Markdown 渲染组件
 */
export const MarkdownRenderer = (props: IMarkdownRendererProps) => {
  const { markdownText } = props

  return (
    <Typography>
      <div dangerouslySetInnerHTML={{ __html: md.render(markdownText) }} />
    </Typography>
  )
};