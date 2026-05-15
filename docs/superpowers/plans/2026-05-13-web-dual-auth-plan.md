# web 双端支持 + react-app 迁移 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** web 支持用户端/管理端双路由，完成 react-app 页面迁移，FingerprintJS 授权 + NextAuth 分离

**Architecture:** Route Groups `(user)/` + `(admin)/` 分离路由，middleware 仅拦截 admin，user 端保留 react-app 的 FingerprintJS 授权流程

**Tech Stack:** Next.js 16 App Router, Zustand, FingerprintJS, Ant Design, react-markdown, i18next

---

### Task 1: 添加依赖到 web/package.json

**Files:**

- Modify: `web/package.json`

- [ ] **Step 1: 添加所有新依赖**

```bash
cd /Users/huangmin/code/lexmin/github/dify-chat && node -e "
const pkg = require('./web/package.json');
Object.assign(pkg.dependencies, {
  '@fingerprintjs/fingerprintjs': 'catalog:',
  '@heroicons/react': 'catalog:',
  'echarts-for-react': 'catalog:',
  'dompurify': 'catalog:',
  'react-markdown': 'catalog:',
  'rehype-katex': 'catalog:',
  'rehype-raw': 'catalog:',
  'remark-breaks': 'catalog:',
  'remark-gfm': 'catalog:',
  'remark-math': 'catalog:',
  'react-syntax-highlighter': 'catalog:',
  'katex': 'catalog:',
  'mermaid': 'catalog:',
  'react-photo-view': 'catalog:',
  'lodash-es': 'catalog:',
  'i18next': '^25.7.4',
  'react-i18next': '^16.5.1',
  'i18next-browser-languagedetector': '^8.2.0',
});
require('fs').writeFileSync('./web/package.json', JSON.stringify(pkg, null, '\t') + '\n');
console.log('Deps added');
"
```

- [ ] **Step 2: 安装依赖**

```bash
pnpm install
```

Expected: 安装成功（允许 peer dep 警告）

- [ ] **Step 3: Commit**

```bash
git add web/package.json pnpm-lock.yaml
git commit -m "chore: add user-facing dependencies to web"
```

---

### Task 2: 创建 middleware.ts

**Files:**

- Create: `web/middleware.ts`

- [ ] **Step 1: 创建 middleware**

```ts
// web/middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (pathname.startsWith('/app-management') || pathname.startsWith('/user-management')) {
		const token = await getToken({ req: request })
		if (!token) {
			const loginUrl = new URL('/login', request.url)
			return NextResponse.redirect(loginUrl)
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Commit**

```bash
git add web/middleware.ts
git commit -m "feat: add middleware for admin route protection"
```

---

### Task 3: 创建 use-auth hook

**Files:**

- Create: `web/hooks/use-auth.ts`

- [ ] **Step 1: 创建 hook**

```ts
// web/hooks/use-auth.ts
import { LocalStorageKeys, LocalStorageStore } from '@/lib/helpers'
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

- [ ] **Step 2: Commit**

```bash
git add web/hooks/use-auth.ts
git commit -m "feat: add useAuth hook for client-side fingerprint auth"
```

---

### Task 4: 创建 (user)/ 路由页面

**Files:**

- Create: `web/app/(user)/auth/page.tsx`
- Create: `web/app/(user)/chat/page.tsx`
- Create: `web/app/(user)/chat/[appId]/page.tsx`
- Create: `web/app/(user)/apps/page.tsx`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p web/app/\(user\)/auth web/app/\(user\)/chat web/app/\(user\)/chat/\[appId\] web/app/\(user\)/apps
```

- [ ] **Step 2: 创建 auth/page.tsx**

```tsx
// web/app/(user)/auth/page.tsx
'use client'

import { LocalStorageKeys, LocalStorageStore } from '@/lib/helpers'
import FingerPrintJS from '@fingerprintjs/fingerprintjs'
import { useMount } from 'ahooks'
import { Spin } from 'antd'
import { useRouter } from 'next/navigation'

import { Logo } from '@/components/shared'
import { useAuth } from '@/hooks/use-auth'

export default function AuthPage() {
	const { userId } = useAuth()
	const router = useRouter()

	const mockLogin = async () => {
		const fp = await FingerPrintJS.load()
		const result = await fp.get()
		return await new Promise<{ userId: string }>(resolve => {
			setTimeout(() => {
				resolve({ userId: result.visitorId })
			}, 2000)
		})
	}

	const handleLogin = async () => {
		const userInfo = await mockLogin()
		LocalStorageStore.set(LocalStorageKeys.USER_ID, userInfo.userId)
		router.replace('/apps')
	}

	useMount(() => {
		if (!userId) {
			handleLogin()
		} else {
			router.replace('/apps')
		}
	})

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center">
			<div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center">
				<Logo hideGithubIcon />
				<div>授权登录中...</div>
				<div className="mt-6">
					<Spin spinning />
				</div>
			</div>
		</div>
	)
}
```

- [ ] **Step 3: 创建 chat/page.tsx**

```tsx
// web/app/(user)/chat/page.tsx
'use client'

import ChatLayoutWrapper from '@/components/chat/chat-layout-wrapper'

export default function ChatPage() {
	return <ChatLayoutWrapper />
}
```

- [ ] **Step 4: 创建 chat/[appId]/page.tsx**

```tsx
// web/app/(user)/chat/[appId]/page.tsx
'use client'

import ChatLayoutWrapper from '@/components/chat/chat-layout-wrapper'

export default function AppChatPage() {
	return <ChatLayoutWrapper />
}
```

- [ ] **Step 5: 创建 apps/page.tsx（占位，组件迁移后再补充逻辑）**

```tsx
// web/app/(user)/apps/page.tsx
'use client'

import { TagOutlined } from '@ant-design/icons'
import { AppModeLabels } from '@/lib/core'
import { useIsMobile } from '@/lib/helpers'
import { useRequest } from 'ahooks'
import { Col, Empty, message, Row } from 'antd'
import { useRouter } from 'next/navigation'

import { LucideIcon, HeaderLayout as DebugMode } from '@/components/shared'
import appService from '@/services/app'

export default function AppListPage() {
	const router = useRouter()
	const isMobile = useIsMobile()

	const { data: list } = useRequest(() => appService.getApps(), {
		onError: error => {
			message.error(`获取应用列表失败: ${error}`)
			console.error(error)
		},
	})

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden">
			<div className="flex items-center px-3 py-2">
				<LucideIcon
					name="layout-grid"
					size={16}
					className="mr-1"
				/>
				应用列表
			</div>
			<div className="box-border flex-1 overflow-x-hidden overflow-y-auto rounded-t-3xl py-6">
				{list?.length ? (
					<Row
						gutter={[16, 16]}
						className="px-3 md:px-6"
					>
						{list.map(item => {
							if (!item.info) {
								return (
									<Col
										key={item.id}
										span={isMobile ? 24 : 6}
									>
										<div className="hover:border-primary cursor-pointer rounded-2xl border p-3">
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
										className="hover:border-primary hover:text-primary cursor-pointer rounded-2xl border p-3"
										onClick={() => router.push(`/chat/${item.id}`)}
									>
										<div className="flex items-center overflow-hidden">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-[#ffead5]">
												<LucideIcon
													name="bot"
													className="text-xl"
												/>
											</div>
											<div className="ml-3 flex-1 overflow-hidden">
												<div className="truncate font-semibold">{item.info.name}</div>
												<div className="text-xs opacity-60">
													{item.info.mode ? AppModeLabels[item.info.mode] : 'unknown'}
												</div>
											</div>
										</div>
										<div className="mt-3 line-clamp-2 text-sm opacity-60">
											{item.info.description || '该应用暂无描述'}
										</div>
										<div className="mt-3 flex items-center truncate text-xs opacity-60">
											{hasTags && (
												<>
													<TagOutlined className="mr-2" />
													{item.info.tags.join('、')}
												</>
											)}
										</div>
									</div>
								</Col>
							)
						})}
					</Row>
				) : (
					<div className="flex h-full items-center justify-center">
						<Empty description="暂无应用数据，请联系管理员配置" />
					</div>
				)}
			</div>
		</div>
	)
}
```

- [ ] **Step 5: Commit**

```bash
git add web/app/\(user\)/
git commit -m "feat: create user-facing routes (auth, chat, apps)"
```

---

### Task 5: 创建 (user)/layout.tsx

**Files:**

- Create: `web/app/(user)/layout.tsx`

- [ ] **Step 1: 创建 layout**

```tsx
// web/app/(user)/layout.tsx
'use client'

import { ThemeContextProvider, useThemeContext } from '@/lib/theme'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/use-auth'
import { initResponsiveConfig } from '@/lib/helpers'

initResponsiveConfig()

function UserLayoutInner({ children }: { children: React.ReactNode }) {
	const { isAuthorized } = useAuth()
	const pathname = usePathname()
	const router = useRouter()
	const { i18n } = useTranslation()
	const { isDark } = useThemeContext()

	useEffect(() => {
		if (!isAuthorized && pathname !== '/auth') {
			router.replace('/auth')
		}
	}, [isAuthorized, pathname, router])

	return (
		<ConfigProvider
			locale={i18n.language === 'en' ? enUS : zhCN}
			theme={{
				algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
			}}
		>
			{children}
		</ConfigProvider>
	)
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
	return (
		<ThemeContextProvider>
			<UserLayoutInner>{children}</UserLayoutInner>
		</ThemeContextProvider>
	)
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/\(user\)/layout.tsx
git commit -m "feat: add user layout with ConfigProvider and auth guard"
```

---

### Task 6: 批量迁移 react-app 组件到 web/components/chat/

**Files:**

- Copy: `packages/react-app/src/components/chatbox/*` → `web/components/chat/chatbox/`
- Copy: `packages/react-app/src/components/message-sender/*` → `web/components/chat/message-sender/`
- Copy: `packages/react-app/src/components/conversation-list/*` → `web/components/chat/conversation-list/`
- Copy: `packages/react-app/src/components/markdown-renderer/*` → `web/components/chat/markdown-renderer/`
- Copy: `packages/react-app/src/layout/chat-layout-wrapper.tsx` → `web/components/chat/`
- Copy: `packages/react-app/src/layout/chat-layout.tsx` → `web/components/chat/`
- Copy: `packages/react-app/src/layout/workflow-layout.tsx` → `web/components/chat/`
- Copy: `packages/react-app/src/layout/common-layout.tsx` → `web/components/chat/`
- Copy: `packages/react-app/src/layout/main-layout.tsx` → `web/components/chat/`
- Copy: `packages/react-app/src/components/debug-mode/*` → `web/components/chat/debug-mode/`
- Copy: `packages/react-app/src/components/i18n-switcher/*` → `web/components/chat/i18n-switcher/`
- Copy: `packages/react-app/src/components/form/params-config-editor.tsx` → `web/components/chat/`

- [ ] **Step 1: 批量复制组件**

```bash
mkdir -p web/components/chat
cp -r packages/react-app/src/components/chatbox web/components/chat/chatbox
cp -r packages/react-app/src/components/message-sender web/components/chat/message-sender
cp -r packages/react-app/src/components/conversation-list web/components/chat/conversation-list
cp -r packages/react-app/src/components/markdown-renderer web/components/chat/markdown-renderer
cp packages/react-app/src/layout/chat-layout-wrapper.tsx web/components/chat/chat-layout-wrapper.tsx
cp packages/react-app/src/layout/chat-layout.tsx web/components/chat/chat-layout.tsx
cp packages/react-app/src/layout/workflow-layout.tsx web/components/chat/workflow-layout.tsx
cp packages/react-app/src/layout/common-layout.tsx web/components/chat/common-layout.tsx
cp packages/react-app/src/layout/main-layout.tsx web/components/chat/main-layout.tsx
cp -r packages/react-app/src/components/debug-mode web/components/chat/debug-mode
cp -r packages/react-app/src/components/i18n-switcher web/components/chat/i18n-switcher
cp packages/react-app/src/components/form/params-config-editor.tsx web/components/chat/params-config-editor.tsx
echo "Copied"
```

- [ ] **Step 2: 全局替换 import 路径（react-app 内部路径）**

```bash
cd web/components/chat
find . -type f -name '*.tsx' -o -name '*.ts' | while read f; do
  sed -i '' "s|from '@/components/|from '@/components/chat/|g" "$f"
  sed -i '' "s|from '@/layout/|from '@/components/chat/|g" "$f"
  sed -i '' "s|from '@/hooks/|from '@/hooks/|g" "$f"
  sed -i '' "s|from '@/utils/|from '@/lib/|g" "$f"
  sed -i '' "s|from '@/services/|from '@/services/|g" "$f"
  sed -i '' "s|from '@/config'|from '@/config'|g" "$f"
  sed -i '' "s|from '@/config/|from '@/config/|g" "$f"
  sed -i '' "s|from '@/store'|from '@/lib/core'|g" "$f"
  sed -i '' "s|from '@/store/|from '@/lib/core'|g" "$f"
  sed -i '' "s|from '@/libs/|from '@/libs/|g" "$f"
  sed -i '' "s|from '@/theme/|from '@/components/chat/|g" "$f"
  sed -i '' "s|from '@/constants/|from '@/constants/|g" "$f"
  sed -i '' "s|from '@/enums/|from '@/enums/|g" "$f"
  sed -i '' "s|from '@/types/|from '@/types/|g" "$f"
  sed -i '' "s|from '@/assets/|from '@/assets/|g" "$f"
  sed -i '' "s|from './chatbox|from '@/components/chat/chatbox|g" "$f"
  sed -i '' "s|from './message-sender|from '@/components/chat/message-sender|g" "$f"
  sed -i '' "s|from './conversation-list|from '@/components/chat/conversation-list|g" "$f"
  sed -i '' "s|from './markdown-renderer|from '@/components/chat/markdown-renderer|g" "$f"
done
echo "Import paths replaced"
```

- [ ] **Step 3: Commit**

```bash
git add web/components/chat/
git commit -m "feat: migrate react-app chat components to web"
```

---

### Task 7: 迁移 services + hooks

**Files:**

- Copy: `packages/react-app/src/services/app.ts` → `web/services/app.ts`
- Copy: `packages/react-app/src/hooks/useX/*` → `web/hooks/useX/`
- Modify: `web/services/app.ts` — 适配 baseURL

- [ ] **Step 1: 复制服务文件**

```bash
cp packages/react-app/src/services/app.ts web/services/app.ts
cp packages/react-app/src/hooks/useX/x-provider.ts web/hooks/useX/x-provider.ts
cp packages/react-app/src/hooks/useX/workflow-data-storage.ts web/hooks/useX/workflow-data-storage.ts
cp packages/react-app/src/hooks/useX/index.ts web/hooks/useX/index.ts
```

- [ ] **Step 2: 修改 web/services/app.ts baseURL**

```diff
- import config from '@/config'
- const baseRequest = new BaseRequest({ baseURL: config.PUBLIC_APP_API_BASE as string })
+ const baseRequest = new BaseRequest({ baseURL: '/api/client' })
```

同时删除 debug mode 相关逻辑（web 不需要 debug mode 开发开关）。

- [ ] **Step 3: Commit**

```bash
git add web/services/ web/hooks/useX/
git commit -m "feat: migrate services and useX hooks to web"
```

---

### Task 8: 迁移 Dify API 客户端 + i18n

**Files:**

- Copy: `packages/react-app/src/utils/dify-api.ts` → `web/lib/dify-client.ts`
- Copy: `packages/react-app/src/libs/i18n.ts` → `web/libs/i18n.ts`
- Modify: `web/lib/dify-client.ts` — 适配 baseURL

- [ ] **Step 1: 复制 dify-client**

```bash
cp packages/react-app/src/utils/dify-api.ts web/lib/dify-client.ts
cp packages/react-app/src/libs/i18n.ts web/libs/i18n.ts
## Start of Next.js-specific code block
```

- [ ] **Step 2: 修改 web/lib/dify-client.ts 的 baseURL**

```diff
- const baseRequest = new BaseRequest({ baseURL: config.PUBLIC_DIFY_PROXY_API_BASE as string })
+ const baseRequest = new BaseRequest({ baseURL: '/api/client/dify' })
```

- [ ] **Step 3: Commit**

```bash
git add web/lib/dify-client.ts web/libs/i18n.ts
git commit -m "feat: migrate dify client and i18n to web"
```

---

### Task 9: 添加 globalParams 到 store

**Files:**

- Modify: `web/lib/core/store.ts`

- [ ] **Step 1: 追加 globalParams 到 store**

在 `DifyChatState` interface 中追加，在 `DifyChatActions` 中追加，在 `create` 中追加初始化和实现：

```ts
// web/lib/core/store.ts — 在 DifyChatState 内追加:
  globalParams: Record<string, string>
// 在 DifyChatActions 内追加:
  setGlobalParams: (params: Record<string, string>) => void
// 在 create() 的初始值中追加:
  globalParams: {},
  setGlobalParams: (params) => set(state => ({
    globalParams: { ...state.globalParams, ...params }
  })),
```

- [ ] **Step 2: Commit**

```bash
git add web/lib/core/store.ts
git commit -m "feat: add globalParams to DifyChatStore"
```

---

### Task 10: 合并 CSS 到 globals.css

**Files:**

- Copy: `packages/react-app/src/App.css` → 合并到 `web/app/globals.css`
- Copy: `packages/react-app/src/components/markdown-renderer/index.css` → 合并到 `web/app/globals.css`

- [ ] **Step 1: 追加 CSS**

```bash
echo "\n/* === User-facing styles (from react-app) === */" >> web/app/globals.css
cat packages/react-app/src/App.css >> web/app/globals.css
cat packages/react-app/src/components/markdown-renderer/index.css >> web/app/globals.css
```

- [ ] **Step 2: Commit**

```bash
git add web/app/globals.css
git commit -m "feat: merge react-app styles into globals.css"
```

---

### Task 11: 更新根 page.tsx

**Files:**

- Modify: `web/app/page.tsx`

根页面改为：有 NextAuth session → 跳转管理端，否则 → 跳转用户端 /apps。

```tsx
// web/app/page.tsx
'use client'

import { Spin } from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === 'authenticated' && session) {
			router.replace('/app-management')
		} else if (status === 'unauthenticated') {
			router.replace('/apps')
		}
	}, [session, status, router])

	if (status === 'loading') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spin spinning />
			</div>
		)
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Spin spinning />
		</div>
	)
}
```

- [ ] **Step 1: Commit**

```bash
git add web/app/page.tsx
git commit -m "feat: update root page to redirect admin/user appropriately"
```

---

### Task 12: 验证构建

- [ ] **Step 1: 运行 next build**

```bash
cd web && pnpm build
```

修复所有编译/类型错误。常见修复点：

- Tailwind v3→v4 类名（`bg-theme-bg` → 用 inline CSS 替代或定义 `@theme`）
- `IConversationItem` 类型冲突（react-app 和 web 的 core 各有定义 → 统一用 web/lib/core 的）
- `@dify-chat/*` 残留 import（组件迁移后需全局 grep 确认清零）
- `pure-react-router` 残留 import（`useHistory` → `useRouter`）

- [ ] **Step 2: 构建通过后 commit**

```bash
git add -A
git commit -m "fix: resolve build errors after react-app migration"
```

---

## 最终验证

```bash
# 1. middleware 生效
# 访问 /app-management → 无 session → redirect /login

# 2. 用户端 auth 流程
# 访问 /apps → 无 userId → redirect /auth
# /auth → FingerprintJS 完成 → userId 写入 localStorage → redirect /apps

# 3. build 通过
cd web && pnpm build
```
