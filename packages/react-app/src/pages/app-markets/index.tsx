import { TagOutlined } from '@ant-design/icons'
import { useIsMobile } from '@dify-chat/helpers'
import { useRequest } from 'ahooks'
import { Button, Col, Empty, Input, Row, Select, Tag, Space, Divider, Spin, Alert, message } from 'antd'
import { useState } from 'react'
import { useHistory } from 'pure-react-router'

import { DebugMode, Header, LucideIcon } from '@/components'
import appService from '@/services/app'

// Mock数据
const mockApps = [
  {
    id: '1',
    info: {
      name: '智能问答助手',
      mode: 'chat',
      description: '一个基于AI的智能问答助手，可以回答各种问题。',
      tags: ['问答', '智能', 'AI'],
      creator: 'Dify团队',
      usageCount: 1234,
      conversationCount: 5678
    }
  },
  {
    id: '2',
    info: {
      name: '代码生成器',
      mode: 'chat',
      description: '根据需求自动生成代码，提高开发效率。',
      tags: ['代码', '开发', '工具'],
      creator: '开发者社区',
      usageCount: 890,
      conversationCount: 13456
    }
  },
  {
    id: '3',
    info: {
      name: '文案助手',
      mode: 'chat',
      description: '帮助你撰写各种文案，包括广告、邮件等。',
      tags: ['文案', '写作', '营销'],
      creator: '营销团队',
      usageCount: 678,
      conversationCount: 2345
    }
  },
  {
    id: '4',
    info: {
      name: '数据分析工具',
      mode: 'workflow',
      description: '帮助你分析数据，生成图表和报告。',
      tags: ['数据', '分析', '图表'],
      creator: '数据团队',
      usageCount: 456,
      conversationCount: 1234
    }
  },
  {
    id: '5',
    info: {
      name: '语言翻译器',
      mode: 'chat',
      description: '支持多种语言的翻译工具。',
      tags: ['翻译', '语言', '工具'],
      creator: '国际化团队',
      usageCount: 234,
      conversationCount: 890
    }
  },
  {
    id: '6',
    info: {
      name: '创意生成器',
      mode: 'chat',
      description: '帮助你生成各种创意和想法。',
      tags: ['创意', '想法', '灵感'],
      creator: '设计团队',
      usageCount: 123,
      conversationCount: 456
    }
  }
]

// 所有标签
// const allTags = Array.from(new Set(mockApps.flatMap(app => app.info.tags)))

// 标签分类
const tagCategories = {
  功能: ['问答', '代码', '文案', '数据', '翻译', '创意'],
  类型: ['智能', '开发', '工具', '写作', '营销', '分析', '图表', '语言', '灵感'],
  技术: ['AI']
}

export default function AppMarketsPage() {
  const history = useHistory()
  const isMobile = useIsMobile()
  const { Option } = Select
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'comprehensive' | 'usageCount' | 'conversationCount'>('comprehensive')

  // 使用mock数据，添加加载状态、错误处理、超时和重试功能
  const { data: list, loading, error, run, retry } = useRequest(() => {
    // 模拟API请求延迟
    return new Promise((resolve, reject) => {
      // 添加随机失败概率（10%）用于测试错误处理
      const isFailed = Math.random() < 0.1;
      
      setTimeout(() => {
        if (isFailed) {
          reject(new Error('获取应用市场数据失败，请稍后重试'));
        } else {
          resolve(mockApps);
        }
      }, 800); // 延长延迟时间以便更好地展示加载状态
    })
  }, {
    timeout: 5000, // 设置5秒超时
    retryCount: 1, // 自动重试1次
    onError: (err) => {
      console.error('应用市场数据获取失败:', err);
      // 只在最终失败时显示错误消息，避免重复提示
      // if (err.name !== 'RetryError') {
      //   message.error('获取应用市场数据失败，请稍后重试');
      // }
    },
    onSuccess: () => {
      console.log('应用市场数据获取成功');
    }
  });

  // 手动重试函数
  const handleRetry = () => {
    console.log('用户手动触发数据重试');
    retry();
  }

  // 搜索处理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 标签选择处理
  const handleTagSelect = (value: string[]) => {
    setSelectedTags(value)
  }

  // 筛选应用列表
  const filteredApps = (Array.isArray(list) ? list : []).filter(app => {
    // 标签筛选
    const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => app.info.tags?.includes(tag))
    
    // 搜索筛选
    const searchMatch = !searchTerm || 
      app.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.info.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.info.creator.toLowerCase().includes(searchTerm.toLowerCase())
      
    return tagMatch && searchMatch
  })

  // 排序应用列表
  const sortedApps = filteredApps?.sort((a, b) => {
    // 确保应用信息存在
    if (!a.info || !b.info) return 0

    switch (sortBy) {
      case 'usageCount':
        // 最多使用：按使用人数从高到低排序
        return b.info.usageCount - a.info.usageCount
      case 'conversationCount':
        // 最多对话：按对话次数从高到低排序
        return b.info.conversationCount - a.info.conversationCount
      case 'comprehensive':
      default:
        // 综合排序：使用加权算法，使用人数权重0.6，对话次数权重0.4
        const scoreA = a.info.usageCount * 0.6 + a.info.conversationCount * 0.4
        const scoreB = b.info.usageCount * 0.6 + b.info.conversationCount * 0.4
        return scoreB - scoreA
    }
  })

  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
			<Header />
      <div className="flex-1 bg-theme-main-bg rounded-t-3xl py-6 overflow-y-auto box-border overflow-x-hidden">
        {/* 筛选区域 */}
        <div className="px-3 md:px-6 mb-6">
          <div className="mb-4">
            {/* <h3 className="text-sm font-semibold mb-2">筛选条件</h3> */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              {/* 排序按钮 */}
              <div className="flex gap-2">
                <Button
                  type={sortBy === 'comprehensive' ? 'primary' : 'default'}
                  onClick={() => setSortBy('comprehensive')}
                  size="middle"
                >
                  综合排序
                </Button>
                <Button
                  type={sortBy === 'usageCount' ? 'primary' : 'default'}
                  onClick={() => setSortBy('usageCount')}
                  size="middle"
                >
                  最多使用
                </Button>
                <Button
                  type={sortBy === 'conversationCount' ? 'primary' : 'default'}
                  onClick={() => setSortBy('conversationCount')}
                  size="middle"
                >
                  最多对话
                </Button>
              </div>
              
              {/* 标签和搜索 */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* 标签下拉筛选 */}
                <Select
                  mode="multiple"
                  placeholder="全部标签"
                  style={{ width: 200 }}
                  value={selectedTags}
                  onChange={handleTagSelect}
                >
                  {Object.entries(tagCategories).map(([category, tags]) => (
                    <>
                      <Option key={`${category}-disabled`} disabled>{category}</Option>
                      {tags.map(tag => (
                        <Option key={tag} value={tag}>
                          {tag}
                        </Option>
                      ))}
                    </>
                  ))}
                </Select>
                
                {/* 搜索框 */}
                <Input
                  placeholder="搜索应用、作者或描述"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ width: 300 }}
                  prefix={<TagOutlined />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 应用列表 */}
        {/* 加载状态 */}
        {loading && (
          <div className="w-full h-full box-border flex flex-col items-center justify-center px-3 py-10">
            <Spin size="large" tip="获取数据中..." className="text-blue-500" />
            <p className="ml-2 text-theme-text">加载应用列表中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="w-full h-full box-border flex flex-col items-center justify-center px-3 py-10">
            <Alert
              message="获取数据失败"
              description={
                <div className="text-center">
                  <p className="mb-4">{error.message}</p>
                  <Button type="primary" onClick={handleRetry}>
                    重新获取
                  </Button>
                </div>
              }
              type="error"
              showIcon
              className="max-w-md w-full"
            />
          </div>
        )}

        {/* 无错误且无加载时，显示数据 */}
        {!loading && !error && (
          <>            
            {sortedApps?.length ? (
              <Row
                gutter={[16, 16]}
                className="px-3 md:px-6"
              >
                {sortedApps.map(item => {
                  if (!item.info) {
                    return (
                      <Col
                        key={item.id}
                        span={isMobile ? 24 : 6}
                      >
                        <div
                          key={item.id}
                          className={`relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary`}
                        >
                          应用信息缺失，请检查
                        </div>
                      </Col>
                    )
                  }
                  const hasTags = item.info.tags?.length
                  return (
                    <Col
                      key={item.id}
                      span={isMobile ? 24 : 6}
                    >
                      <div
                        key={item.id}
                        className={`relative p-4 bg-[#1e1e1e] border border-[#333] rounded-lg cursor-pointer hover:border-blue-500 transition-all duration-200`}
                      >
                        <div
                          // onClick={() => {
                          //   history.push(`/app/${item.id}`)
                          // }}
                        >
                          <div className="flex items-center overflow-hidden mb-3">
                            <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
                              <LucideIcon
                                name="bot"
                                className="text-xl text-blue-400"
                              />
                            </div>
                            <div className="flex-1 overflow-hidden ml-3">
                              <div className="truncate font-semibold text-white text-base pr-4">{item.info.name}</div>
                              <div className="text-xs mt-1 text-gray-400">
                                {item.info.creator}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 leading-5 whitespace-normal line-clamp-2 mb-4">
                            {item.info.description || '暂无描述'}
                          </div>
                        </div>
                        {/* 应用元数据 */}
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <div className="flex items-center mr-4">
                            <LucideIcon name="users" size={12} className="mr-1" />
                            <span>{item.info.usageCount}</span>
                          </div>
                          <div className="flex items-center mr-4">
                            <LucideIcon name="message-square" size={12} className="mr-1" />
                            <span>{item.info.conversationCount}</span>
                          </div>
                        </div>
                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2 mt-2 mb-4">
                          <TagOutlined className="mr-2" />
                          {hasTags ? (
                            item.info.tags.map(tag => (
                              <Tag key={tag} size="small" className="bg-gray-700/50 text-gray-300 border-0 px-2 py-0.5 rounded-full">
                                #{tag}
                              </Tag>
                            ))
                          ) : null}
                        </div>
                        {/* 使用按钮 */}
                        <div className="mt-2">
                          <Button type="primary" size="middle" block style={{ height: '30px' }}
                            onClick={() => {
                              history.push(`/app/${item.id}`)
                            }}>
                            添加到工作空间
                          </Button>
                        </div>
                      </div>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <div className="w-full h-full box-border flex flex-col items-center justify-center px-3 py-10">
                <Empty description="暂无应用" />
              </div>
            )}
          </>
        )}
      </div>
      <DebugMode />
    </div>
  )
}