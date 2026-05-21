# web/lib/ 内部架构清理与重构 — 设计文档

> 日期：2026-05-13范围：`web/lib/` 目录结构规范化、Context → Zustand 迁移、components 包消亡前置：无（独立于 react-app 迁移）

---

## 目标

将 `web/lib/` 从"独立包堆积场"改造为"Next.js 应用的内部模块目录"。

**清理标志**：

```
web/lib/ 下不再有：
  ❌ package.json
  ❌ rslib.config.ts
  ❌ tsconfig.json（子目录）
  ❌ biome.json / .prettierrc / .gitignore
  ❌ CHANGELOG.md / README.md
  ❌ node_modules / dist

web/package.json 里不再有：
  ❌ "@dify-chat/*": "workspace:^"

web/ 代码中不再有：
  ❌ import ... from '@dify-chat/...'

web/lib/ 下不再有：
  ❌ DifyChatProvider / useDifyChat（死代码）
  ❌ singleApp / multiApp mode 概念
  ❌ lib/components/ 整个目录
```

---

## 最终目标结构

```
web/lib/
├── api/                       # Dify API 客户端
│   ├── index.ts               # 公开导出
│   ├── client.ts              # DifyApi 类 (原 src/api/index.ts)
│   ├── base-request.ts        # XRequest (原 src/base-request.ts)
│   ├── enums.ts               # EventEnum 等 (原 src/enums/index.ts)
│   └── types.ts               # 所有类型 (原 src/types/ 3个文件合并)
│
├── core/                      # 状态管理 (Context → Zustand)
│   ├── index.ts
│   ├── store.ts               # useDifyChatStore — 三合一 Zustand store
│   ├── types.ts               # IDifyAppItem, IConversationItem 等
│   ├── constants.ts           # AppModeLabels, OpeningStatementDisplayMode 等
│   ├── enums.ts               # AppModeEnums, Roles 等
│   ├── repository.ts          # DifyAppStore 抽象类
│   └── utils.ts
│
├── helpers/                   # 工具函数
│   ├── index.ts
│   ├── base-request.ts
│   ├── id.ts
│   ├── gzip.ts
│   ├── localstorage.ts
│   ├── responsive.ts
│   └── vars.ts
│
├── theme/                     # 主题
│   ├── index.ts
│   ├── theme-context.tsx       # ThemeContextProvider (保留 Context)
│   ├── theme-selector.tsx
│   └── constants.ts
│
├── auth.ts                    # NextAuth 配置 (不变)
├── prisma.ts                  # Prisma 单例 (不变)
├── api-utils.ts               # Dify 代理工具 (不变)
├── db/types.ts                # DB 类型转换 (不变)
└── utils.ts                   # 杂项工具 (不变)
```

---

## 关键设计决策

### 1. 扁平化（消除 `src/` 中间层）

`lib/*/src/` 中的源代码文件物理移动到 `lib/*/` 一级。无 barrel export 兜底。

### 2. Context → Zustand

三个 React Context 合并为一个 Zustand store：

- `useAppContext` → `useDifyChatStore(s => s.currentApp)`
- `useConversationsContext` → `useDifyChatStore(s => s.conversations)`
- `DifyChatProvider` / `useDifyChat` → **删除**（死代码，项目中 0 处引用）
- `ConversationsContextProvider` → 不再需要 Provider 包裹

**删除文件**：

- `core/hooks/use-dify-chat.ts` — 完全死代码
- `core/hooks/use-apps.ts` — 并入 store.ts
- `core/hooks/use-conversations.ts` — 并入 store.ts
- `core/hooks/index.ts` — 目录清空

### 3. Zustand Store 设计

```ts
// web/lib/core/store.ts
import { create } from 'zustand'
import type { ICurrentApp, IConversationItem } from './types'

interface DifyChatState {
	currentApp: ICurrentApp | null
	appLoading: boolean
	currentConversationId: string
	conversations: IConversationItem[]
}

interface DifyChatActions {
	setCurrentApp: (app: ICurrentApp | null) => void
	setAppLoading: (loading: boolean) => void
	setCurrentConversationId: (id: string) => void
	setConversations: (list: IConversationItem[]) => void
}

type DifyChatStore = DifyChatState & DifyChatActions

export const useDifyChatStore = create<DifyChatStore>(set => ({
	currentApp: null,
	appLoading: false,
	currentConversationId: '',
	conversations: [],
	setCurrentApp: app => set({ currentApp: app, appLoading: false }),
	setAppLoading: loading => set({ appLoading: loading }),
	setCurrentConversationId: id => set({ currentConversationId: id }),
	setConversations: list => set({ conversations: list }),
}))
```

消费端：

```tsx
import { useDifyChatStore } from '@/lib/core'

// 精确订阅，只有自己关心的 slice 变了才重渲染
const currentApp = useDifyChatStore(s => s.currentApp)
const conversations = useDifyChatStore(s => s.conversations)
const setCurrentApp = useDifyChatStore(s => s.setCurrentApp)
```

初始化无需 Provider：

```tsx
'use client'
// 直接 setState，不需要 Provider 包裹
useDifyChatStore.setState({ ...initialValues })
```

### 4. Theme Context 不做改动

`ThemeContextProvider` / `useThemeContext` 保持 React Context。原因：

- 主题切换频率极低，Context 重渲染成本可忽略
- 需要 Provider 包裹注入 antd `ConfigProvider` 的 `theme.algorithm`
- 改动收益为零，不值得

### 5. components 包消亡

提取三个有用组件到 `web/components/shared/`：

| 原路径                                     | 新路径                                    |
| ------------------------------------------ | ----------------------------------------- |
| `lib/components/src/layout/logo.tsx`       | `web/components/shared/logo.tsx`          |
| `lib/components/src/layout/header.tsx`     | `web/components/shared/header-layout.tsx` |
| `lib/components/src/lucide-icon/index.tsx` | `web/components/shared/lucide-icon.tsx`   |

删除整个 `web/lib/components/` 目录（包含 `.storybook/`、`stories/` 等所有内容）。

### 6. import 路径全局替换

| 旧                      | 新                    |
| ----------------------- | --------------------- |
| `@dify-chat/api`        | `@/lib/api`           |
| `@dify-chat/core`       | `@/lib/core`          |
| `@dify-chat/helpers`    | `@/lib/helpers`       |
| `@dify-chat/theme`      | `@/lib/theme`         |
| `@dify-chat/components` | `@/components/shared` |

受影响的文件：~45 个（web/app/、web/components/、web/repository/、web/lib/ 内交叉引用、react-app 暂时不动）。

---

## 文件操作清单

### 物理移动（lib 内扁平化）

```
api/src/api/index.ts         → api/client.ts
api/src/base-request.ts      → api/base-request.ts
api/src/enums/index.ts       → api/enums.ts
api/src/index.ts             → api/index.ts（重新导出）
api/src/types/*.ts (3 file)  → api/types.ts（合并）
api/tests/index.test.ts      → tests/index.test.ts

core/src/types/index.ts      → core/types.ts
core/src/constants/*.ts (2)  → core/constants.ts（合并）
core/src/enums/index.ts      → core/enums.ts
core/src/repository/app/index.ts → core/repository.ts
core/src/utils/index.ts      → core/utils.ts
core/src/index.ts            → core/index.ts
core/tests/index.test.ts     → tests/index.test.ts

helpers/src/*.ts (7 files)   → helpers/*.ts（提到一级）
helpers/tests/id.test.ts     → tests/id.test.ts

theme/src/hooks/index.tsx    → theme/theme-context.tsx
theme/src/components/theme-selector.tsx → theme/theme-selector.tsx
theme/src/constants/index.ts → theme/constants.ts
theme/src/index.ts           → theme/index.ts
```

### 新增文件

```
web/lib/core/store.ts  # Zustand store
```

### 提取文件

```
lib/components/src/layout/logo.tsx            → components/shared/logo.tsx
lib/components/src/layout/header.tsx          → components/shared/header-layout.tsx
lib/components/src/lucide-icon/index.tsx      → components/shared/lucide-icon.tsx
```

### 删除（配置文件 + 死代码）

```
每 lib/*/ 下删除: package.json, rslib.config.ts, tsconfig.json, tsconfig.prod.json,
  tsconfig.tsbuildinfo, tsconfig.prod.tsbuildinfo, biome.json, CHANGELOG.md, README.md,
  .gitignore, node_modules/, dist/, tests/tsconfig.json
theme/ 额外删除: .prettierrc, .prettierignore, eslint.config.mjs

core/ 额外删除:
  src/hooks/use-dify-chat.ts（死代码）
  src/hooks/use-apps.ts（并入 store）
  src/hooks/use-conversations.ts（并入 store）
  src/hooks/index.ts（目录清空）
  src/constants/index.ts 中 SingleApp/MultiApp 枚举

删除整个目录:
  web/lib/components/
  web/lib/api/src/
  web/lib/core/src/
  web/lib/helpers/src/
  web/lib/theme/src/
```

### 修改文件

```
web/package.json           # 移除 5 个 workspace 依赖
web/app/**/*.tsx           # ~30 个文件 import 路径变更
web/components/**/*.tsx    # import 路径变更
web/lib/api/src/api/index.ts  # 内部 import 路径调整
web/lib/core/src/constants/index.ts  # 移除死代码
```

---

## 验证标准

```
□ web/lib/ 下无 package.json / tsconfig.json / rslib.config.ts
□ web/lib/ 下无 node_modules / dist
□ web/package.json 中无 @dify-chat/* workspace 依赖
□ grep '@dify-chat/' web/ 返回 0 结果
□ grep 'DifyChatProvider\|useDifyChat\|singleApp\|multiApp' web/lib/ 返回 0 结果
□ next build 通过
```
