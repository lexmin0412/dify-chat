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

#### AppContext

`AppContext` 是应用上下文，提供了当前应用配置的获取和更新功能。

**AppContextProvider**

在应用切换功能的最上层组件中使用 `AppContextProvider` 提供应用上下文：

```tsx
import { AppContextProvider, ICurrentApp } from '@dify-chat/core';
import { createDifyApiInstance } from '@dify-chat/api';
import { generateUuidV4 } from '@dify-chat/helpers'

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
				id: generateUuidV4(),
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
  const listConversations = async () => {
    setConversations([...])
  }

  useEffect(()=>{
    listConversations()
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
