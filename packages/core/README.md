# `@dify-chat/core`

![version](https://img.shields.io/npm/v/@dify-chat/core) ![NPM Last Update](https://img.shields.io/npm/last-update/@dify-chat/core) ![NPM Downloads](https://img.shields.io/npm/dm/@dify-chat/core)

`@dify-chat/core` 是 [Dify Chat](https://github.com/lexmin0412/dify-chat) 项目中的核心包，它提供了应用、对话等全局上下文的注入和获取功能。

下面将介绍如何在你的应用中集成和使用它。

## 安装

通过 npm/yarn/pnpm 安装：

```bash
# npm
npm install @dify-chat/core
# yarn
yarn add @dify-chat/core
# pnpm
pnpm add @dify-chat/core
```

## 使用方法

### 全局上下文

#### DifyChatContext

`DifyChatContext` 是全局配置上下文，提供了应用配置的全局注入和获取功能。

**DifyChatProvider - 单应用模式**

```tsx
import { DifyChatProvider } from '@dify-chat/core'

const App = () => {
  return (
    <DifyChatProvider
      value={{
        // 应用模式 singleApp-单应用模式 multiApp-多应用模式
        mode: 'singleApp',
        // 当前用户ID，自行传入
        user: 'user123',
        appConfig: {
          // Dify 应用请求配置
          requestConfig: {
            apiBase: 'https://api.dify.ai/v1',
            apiKey: 'YOUR_API_KEY',
          },
          // AI 回复的表单配置
          answerForm: {
            // 是否启用表单渲染
            enabled: true,
            // 用户提交表单发送的消息文本
            feedbackText: '我提交了一个表单',
          },
          inputParams: {
            // 开始对话后，是否支持更新对话参数
            enableUpdateAfterCvstStarts: true,
          },
          extConfig: {
            conversation: {
              // 开场白展示模式
              openingStatement: {
                // 默认值：default-对话开始后不展示 always-固定展示
                displayMode: 'default',
              },
            },
          },
        },
      }}
    >
      <YourChatComponent />
    </DifyChatProvider>
  )
}
```

**DifyChatProvider - 多应用模式**

```tsx
import { DifyChatProvider, DifyAppStore } from '@dify-chat/core';

// 实现自定义的应用存储类
class MyDifyAppStore extends DifyAppStore {
  async getApps() {
    // 实现获取应用列表的逻辑
    return [...];
  }

  async getApp(id) {
    // 实现获取单个应用的逻辑
    return {...};
  }

  async addApp(app) {
    // 实现添加应用的逻辑
  }

  async updateApp(app) {
    // 实现更新应用的逻辑
  }

  async deleteApp(id) {
    // 实现删除应用的逻辑
  }
}

const App = () => {
  const appService = new MyDifyAppStore();

  return (
    <DifyChatProvider
      value={{
        mode: 'multiApp',
        user: 'user123',
        appService,
        enableSetting: true,
      }}
    >
      <YourChatComponent />
    </DifyChatProvider>
  );
};
```

**`useDifyChat` hook**

在你的子组件中使用 `useDifyChat` 钩子获取全局上下文：

```tsx
import { useDifyChat } from '@dify-chat/core'

const YourChatComponent = () => {
  const { user, mode } = useDifyChat()

  console.log(`当前用户：${user}`, `当前模式：${mode}`)
}
```

#### AppContext

`AppContext` 是应用上下文，提供了当前应用配置的获取和更新功能。

**AppContextProvider**

在应用切换功能的最上层组件中使用 `AppContextProvider` 提供应用上下文：

```tsx
import { AppContextProvider, ICurrentApp } from '@dify-chat/core';
import { createDifyApiInstance } from '@dify-chat/api';

const YourChatComponent = () => {

  const { user } = useDifyChat();
  const [appList, setAppList] = useState<ICurrentApp[]>([])

  // 实现获取应用列表的逻辑
  const getAppList = async () => {
    setAppList([...])
  }

  const [appLoading, setAppLoading] = useState(true)
  const [ currentApp, setCurrentApp ] = useState<ICurrentApp[]>([]);
  const [currentAppId, setCurrentAppId] = useState('')
  const [difyApi] = useState(() => createDifyApiInstance({
    user,
    apiBase: '',
    apiKey: '',
  }))

  // 定义获取应用参数的函数
  const getAppInfo = async() => {
    // 先更新 difyApi 的参数
    difyApi.updateOptions({
      user,
      apiBase: newApp.requestConfig.apiBase,
      apiKey: newApp.requestConfig.apiKey,
    })
    setAppLoading(true)
    // 根据新的 currentAppId 获取新的应用信息
    const appConfig = appList.find(item => item.id === currentAppId)
    const difyAppInfo = await difyApi.getAppInfo()
		const appParameters = await getAppParameters(difyApi)
    setAppLoading(false)
    setCurrentApp({
			config: {
				id: Math.random().toString(),
				info: difyAppInfo,
        requestConfig: appConfig.requestConfig,
        answerForm: appConfig.answerForm,
			},
			parameters: appParameters,
		})
  }

  // 初始化时获取应用列表
  useEffect(()=>{
    getAppList()
  }, [])

  // 监听 currentAppId 变化，更新当前应用配置
  useEffect(() => {
    updateAppInfo()
  }, [currentAppId])

  return (
    <AppContextProvider
			value={{
				appLoading,
				currentAppId,
				setCurrentAppId,
				currentApp: currentApp,
				setCurrentApp,
			}}
		>
      Your Chat Inner Component
      <Button onClick={()=>setCurrentAppId('new-app-id')}>切换应用</Button>
    </>
  )
}
```

**useAppContext hook**

在你的子组件中使用 `useAppContext` 钩子获取应用上下文：

```tsx
import { useAppContext } from '@dify-chat/core'

const YourInnerComponent = () => {
  const { currentApp, currentAppId } = useAppContext()
  console.log(`当前应用ID：${currentAppId}`, `当前应用：${currentApp}`)
}
```

#### 对话上下文

`ConversationContext` 是对话上下文，提供了对话相关的功能，包括获取/更新对话列表、获取/更新当前对话 ID、获取当前对话信息等。

**ConversationContextProvider**

在具备对话切换功能的最上层组件中使用 `ConversationContextProvider` 提供对话上下文：

```tsx
import { ConversationsContextProvider } from '@dify-chat/core';

const YourChatComponent = () => {
  const { user } = useDifyChat();
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState('')

  // 实现获取对话列表的逻辑
  const getConversationList = async () => {
    setConversations([...])
  }

  useEffect(()=>{
    getConversationList()
  }, [])

  return (
    <ConversationsContextProvider value={{
      conversations,
      setConversations,
      currentConversationId,
      setCurrentConversationId,
    }}>
      <YourInnerComponent />
    </ConversationContextProvider>
  )
}
```

**`useConversationsContext` hook**

在你的子组件中使用 `useConversationsContext` 钩子获取对话上下文：

```tsx
import { useConversationsContext } from '@dify-chat/core'

const YourInnerComponent = () => {
  const { conversations, currentConversationId } = useConversationsContext()
  console.log(`当前对话ID：${currentConversationId}`, `对话列表：${conversations}`)
}
```
