# web 双端支持 — 管理端/用户端路由与权限分割设计文档

> 日期：2026-05-13 范围：web/app/ 路由重构、用户端页面迁移（react-app → web）、Auth 分离、middleware 新增前置：web/lib/ 已清理完成

---

## 目标

将 web 改造为**管理端 + 用户端双端 Next.js 应用**，完成 react-app 用户端页面迁移，实现 admin/user 路由分离和独立的权限校验。

---

## 一、路由结构

```
app/
├── layout.tsx                          ← RootLayout（不变，AntdRegistry + AuthSessionProvider）
├── page.tsx                            ← 首页 → redirect /apps 或 /app-management
│
├── (user)/                             ← Route Group，URL 不受影响
│   ├── layout.tsx                      ← 用户端 layout（ConfigProvider + ThemeContext + useAuth 守卫）
│   ├── auth/page.tsx                   ← /auth — FingerprintJS 授权页
│   ├── chat/page.tsx                   ← /chat — 默认对话
│   ├── chat/[appId]/page.tsx           ← /chat/{appId} — 指定应用
│   └── apps/page.tsx                   ← /apps — 应用列表
│
├── (admin)/                            ← Route Group，现有管理端保留
│   ├── layout.tsx                      ← AdminLayout + NextAuth AuthGuard
│   ├── login/page.tsx
│   ├── app-management/page.tsx
│   └── user-management/page.tsx
│
├── api/
│   ├── auth/[...nextauth]/route.ts     ← NextAuth handler
│   ├── client/dify/[appId]/...         ← Dify API 代理路由（15 个端点）
│   ├── client/apps/...                 ← 应用列表 API
│   ├── health/route.ts
│   ├── init/...
│   └── users/...
│
└── middleware.ts                        ← 新增：仅拦截 admin 路由
```

### URL 访问对照

| 用户访问 URL      | 路由                              | 说明                    |
| ----------------- | --------------------------------- | ----------------------- |
| `/`               | `page.tsx`                        | 根据 auth 状态 redirect |
| `/auth`           | `(user)/auth/page.tsx`            | FingerprintJS 授权      |
| `/apps`           | `(user)/apps/page.tsx`            | 应用列表                |
| `/chat`           | `(user)/chat/page.tsx`            | 对话                    |
| `/chat/{appId}`   | `(user)/chat/[appId]/page.tsx`    | 指定应用对话            |
| `/login`          | `(admin)/login/page.tsx`          | 管理员登录              |
| `/app-management` | `(admin)/app-management/page.tsx` | 应用管理                |

---

## 二、Auth 分离

### Middleware — 仅拦截 admin 路由

```ts
// web/middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (pathname.startsWith('/app-management') || pathname.startsWith('/user-management')) {
		const token = await getToken({ req: request })
		if (!token) {
			return NextResponse.redirect(new URL('/login', request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next|favicon.ico).*)'],
}
```

### 用户端 Auth — FingerprintJS + localStorage

```
用户访问 /apps
  → (user)/layout.tsx 中 useAuth() 检测 localStorage 无 userId
  → redirect('/auth')

/auth 页面:
  → FingerprintJS.load() + fp.get()
  → localStorage.set('USER_ID', visitorId)
  → redirect 回原始目标路由
```

```ts
// web/hooks/use-auth.ts
import { LocalStorageStore, LocalStorageKeys } from '@/lib/helpers'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
	const router = useRouter()
	const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)

	return {
		isAuthorized: !!userId,
		goAuthorize: () => router.push('/auth'),
		userId,
	}
}
```

### 管理端 Auth — 现有 NextAuth 不变

`(admin)/layout.tsx` 中的 `AuthGuard` 组件保持现有逻辑。

---

## 三、Layout 设计

### Root Layout

```tsx
// app/layout.tsx — 微调（兼容 user + admin）
<html>
	<body>
		<AuthSessionProvider>
			{' '}
			// admin 用，user 端忽略
			<AntdRegistry>
				<PageLayoutWrapper>{children}</PageLayoutWrapper>
			</AntdRegistry>
		</AuthSessionProvider>
	</body>
</html>
```

### User Layout

```tsx
// app/(user)/layout.tsx
'use client'

import { ThemeContextProvider, useThemeContext } from '@/lib/theme'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import '@/libs/i18n'

export default function UserLayout({ children }) {
	const { isAuthorized } = useAuth()
	const pathname = usePathname()
	const router = useRouter()

	useEffect(() => {
		if (!isAuthorized && pathname !== '/auth') {
			router.replace('/auth')
		}
	}, [isAuthorized, pathname])

	const { i18n } = useTranslation()
	const { isDark } = useThemeContext()

	return (
		<ConfigProvider
			locale={i18n.language === 'en' ? enUS : zhCN}
			theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
		>
			{children}
		</ConfigProvider>
	)
}
```

### Admin Layout — 不变

现有 `(admin)/layout.tsx` 保持 `AuthGuard + AdminPageLayout`。

---

## 四、状态管理 — useDifyChatStore（Zustand）

react-app 原有的 `AppContext` + `ConversationContext` + `DifyChatContext` 全部替换为 `useDifyChatStore`。

### 消费端改动

```diff
- const { currentApp, appLoading } = useAppContext()
+ const currentApp = useDifyChatStore(s => s.currentApp)
+ const appLoading = useDifyChatStore(s => s.appLoading)

- const { conversations, setCurrentConversationId } = useConversationsContext()
+ const conversations = useDifyChatStore(s => s.conversations)
+ const setCurrentConversationId = useDifyChatStore(s => s.setCurrentConversationId)
```

### Store 追加 globalParams

```ts
// web/lib/core/store.ts — 追加到现有 DifyChatStore
interface DifyChatState {
	// 现有
	currentApp: ICurrentApp | null
	appLoading: boolean
	currentConversationId: string
	conversations: IConversationItem[]

	// 新增
	globalParams: Record<string, string>
	setGlobalParams: (params: Record<string, string>) => void
}
```

---

## 五、组件迁移范围

### 从 react-app 搬入 web

| 源路径 | 目标路径 | 说明 |
| --- | --- | --- |
| `pages/auth/index.tsx` | `app/(user)/auth/page.tsx` | FingerprintJS 授权页 |
| `pages/chat/index.tsx` | `app/(user)/chat/page.tsx` | Chat 入口 |
| `pages/apps/index.tsx` | `app/(user)/apps/page.tsx` | 应用列表页 |
| `components/chatbox/*` (14文件) | `components/chat/chatbox/` | 核心聊天 UI |
| `components/message-sender/*` (2) | `components/chat/message-sender/` | 消息输入 |
| `components/conversation-list/` (1) | `components/chat/conversation-list/` | 对话列表 |
| `components/markdown-renderer/` (9) | `components/chat/markdown-renderer/` | Markdown 渲染 |
| `layout/chat-layout-wrapper.tsx` | `components/chat/chat-layout-wrapper.tsx` | 聊天编排 |
| `layout/chat-layout.tsx` | `components/chat/chat-layout.tsx` | Chat 布局 |
| `layout/workflow-layout.tsx` | `components/chat/workflow-layout.tsx` | Workflow 布局 |
| `hooks/use-auth.ts` | `hooks/use-auth.ts` | Auth hook |
| `hooks/useX/*` (3) | `hooks/useX/` | Workflow data storage |
| `services/app.ts` | `services/app.ts` | AppService |
| `utils/dify-api.ts` | `lib/dify-client.ts` | Dify API 客户端 |
| `libs/i18n.ts` | `libs/i18n.ts` | i18n 初始化 |
| `App.css` + `index.css` | → 合并进 `globals.css` | 样式 |

### Dify API 客户端适配

```
旧: fetch(PUBLIC_DIFY_PROXY_API_BASE + '/appId/chat-messages', { headers: { 'x-user-id': userId } })
新: fetch('/api/client/dify/appId/chat-messages', { headers: { 'x-user-id': userId } })
```

### 不迁移的

```
App.tsx — BrowserRouter 逻辑 → Next.js 文件系统路由替代
index.tsx — ReactDOM.createRoot → 不再需要
layout/index.tsx — useHistory → useRouter 替代
config/runtime-config.ts — process.env.PUBLIC_* → 硬编码或 Next.js env
.env / .env.template — 不再需要
rsbuild.config.ts — 不再需要
```

---

## 六、依赖变更

### 新增到 web/package.json

```
dependencies:
  @fingerprintjs/fingerprintjs: catalog:
  echarts-for-react: catalog:
  dompurify: catalog:
  react-markdown: catalog:
  rehype-katex: catalog:
  rehype-raw: catalog:
  remark-breaks: catalog:
  remark-gfm: catalog:
  remark-math: catalog:
  react-syntax-highlighter: catalog:
  katex: catalog:
  mermaid: catalog:
  react-photo-view: catalog:
  lodash-es: catalog:
  @heroicons/react: catalog:
  i18next: ^25.7.4
  react-i18next: ^16.5.1
  i18next-browser-languagedetector: ^8.2.0
```

### 删除

```
packages/react-app/ 整个包 → 后续手动删除
web/package.json 中已无 @dify-chat/* workspace 依赖
pnpm-workspace.yaml 移除 packages/react-app
```

---

## 七、验证标准

```
□ middleware.ts 拦截 /app-management 和 /user-management（无 session → redirect /login）
□ 用户端 /apps /chat /auth 不被 middleware 拦截
□ 无 userId 访问 /apps → redirect /auth
□ /auth 完成 FingerprintJS 授权 → localStorage 写入 userId → redirect 回原路由
□ 有 userId 访问 /apps → 直接渲染应用列表
□ /login 管理员登录 → 跳转 /app-management
□ next build 通过
```
