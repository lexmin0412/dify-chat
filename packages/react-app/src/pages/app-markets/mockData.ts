import { App, TagCategory } from './types';
import { AppModeEnums } from '@dify-chat/core';

/**
 * 模拟应用列表数据
 */
export const mockApps: App[] = [
  {
    id: '1',
    info: {
      name: '智能问答助手',
      mode: AppModeEnums.CHATBOT,
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
      mode: AppModeEnums.CHATBOT,
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
      mode: AppModeEnums.CHATBOT,
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
      mode: AppModeEnums.WORKFLOW,
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
      mode: AppModeEnums.CHATBOT,
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
      mode: AppModeEnums.CHATBOT,
      description: '帮助你生成各种创意和想法。',
      tags: ['创意', '想法', '灵感'],
      creator: '设计团队',
      usageCount: 123,
      conversationCount: 456
    }
  }
];

/**
 * 标签分类数据
 */
export const tagCategories: TagCategory = {
  功能: ['问答', '代码', '文案', '数据', '翻译', '创意'],
  类型: ['智能', '开发', '工具', '写作', '营销', '分析', '图表', '语言', '灵感'],
  技术: ['AI']
};