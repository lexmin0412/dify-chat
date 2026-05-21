# web/lib/ 内部架构清理与重构 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 消除 `web/lib/` 中所有旧包残余，完成扁平化、Context→Zustand、components 消亡、全局路径替换。

**Architecture:** 分 7 个阶段：删配置→移文件→合并/创建→提取组件→路径替换→更新依赖→验证。

**Tech Stack:** bash (rm/mv), pnpm, Next.js 16, Zustand, TypeScript 5.9

---

### Task 1: 删除所有旧包配置文件

**Files:**

- Delete: `web/lib/api/package.json`, `web/lib/api/rslib.config.ts`, `web/lib/api/tsconfig.json`, `web/lib/api/tsconfig.prod.json`, `web/lib/api/tsconfig.tsbuildinfo`, `web/lib/api/tsconfig.prod.tsbuildinfo`, `web/lib/api/biome.json`, `web/lib/api/CHANGELOG.md`, `web/lib/api/README.md`, `web/lib/api/.gitignore`, `web/lib/api/tests/tsconfig.json`, `web/lib/api/dist/`, `web/lib/api/node_modules/`
- Delete: `web/lib/core/package.json`, `web/lib/core/rslib.config.ts`, `web/lib/core/tsconfig.json`, `web/lib/core/tsconfig.tsbuildinfo`, `web/lib/core/biome.json`, `web/lib/core/CHANGELOG.md`, `web/lib/core/README.md`, `web/lib/core/.gitignore`, `web/lib/core/tests/tsconfig.json`, `web/lib/core/dist/`, `web/lib/core/node_modules/`
- Delete: `web/lib/helpers/package.json`, `web/lib/helpers/rslib.config.ts`, `web/lib/helpers/tsconfig.json`, `web/lib/helpers/tsconfig.tsbuildinfo`, `web/lib/helpers/biome.json`, `web/lib/helpers/CHANGELOG.md`, `web/lib/helpers/README.md`, `web/lib/helpers/.gitignore`, `web/lib/helpers/tests/tsconfig.json`, `web/lib/helpers/dist/`, `web/lib/helpers/node_modules/`
- Delete: `web/lib/theme/package.json`, `web/lib/theme/rslib.config.ts`, `web/lib/theme/tsconfig.json`, `web/lib/theme/tsconfig.tsbuildinfo`, `web/lib/theme/biome.json`, `web/lib/theme/.prettierrc`, `web/lib/theme/.prettierignore`, `web/lib/theme/eslint.config.mjs`, `web/lib/theme/CHANGELOG.md`, `web/lib/theme/README.md`, `web/lib/theme/.gitignore`, `web/lib/theme/dist/`, `web/lib/theme/node_modules/`

- [ ] **Step 1: Delete config files from api**

```bash
rm -f web/lib/api/package.json web/lib/api/rslib.config.ts web/lib/api/tsconfig.json web/lib/api/tsconfig.prod.json web/lib/api/tsconfig.tsbuildinfo web/lib/api/tsconfig.prod.tsbuildinfo web/lib/api/biome.json web/lib/api/CHANGELOG.md web/lib/api/README.md web/lib/api/.gitignore web/lib/api/tests/tsconfig.json
rm -rf web/lib/api/dist web/lib/api/node_modules
```

- [ ] **Step 2: Delete config files from core**

```bash
rm -f web/lib/core/package.json web/lib/core/rslib.config.ts web/lib/core/tsconfig.json web/lib/core/tsconfig.tsbuildinfo web/lib/core/biome.json web/lib/core/CHANGELOG.md web/lib/core/README.md web/lib/core/.gitignore web/lib/core/tests/tsconfig.json
rm -rf web/lib/core/dist web/lib/core/node_modules
```

- [ ] **Step 3: Delete config files from helpers**

```bash
rm -f web/lib/helpers/package.json web/lib/helpers/rslib.config.ts web/lib/helpers/tsconfig.json web/lib/helpers/tsconfig.tsbuildinfo web/lib/helpers/biome.json web/lib/helpers/CHANGELOG.md web/lib/helpers/README.md web/lib/helpers/.gitignore web/lib/helpers/tests/tsconfig.json
rm -rf web/lib/helpers/dist web/lib/helpers/node_modules
```

- [ ] **Step 4: Delete config files from theme**

```bash
rm -f web/lib/theme/package.json web/lib/theme/rslib.config.ts web/lib/theme/tsconfig.json web/lib/theme/tsconfig.tsbuildinfo web/lib/theme/biome.json web/lib/theme/.prettierrc web/lib/theme/.prettierignore web/lib/theme/eslint.config.mjs web/lib/theme/CHANGELOG.md web/lib/theme/README.md web/lib/theme/.gitignore
rm -rf web/lib/theme/dist web/lib/theme/node_modules
```

- [ ] **Step 5: Commit**

```bash
git add -A web/lib/
git commit -m "chore: delete old package config files from web/lib/"
```

---

### Task 2: 删除死代码（DifyChatContext/mode + SingleApp/MultiApp）

**Files:**

- Delete: `web/lib/core/src/hooks/use-dify-chat.ts`
- Delete: `web/lib/core/src/hooks/use-apps.ts`
- Delete: `web/lib/core/src/hooks/use-conversations.ts`
- Delete: `web/lib/core/src/hooks/index.ts`
- Modify: `web/lib/core/src/constants/index.ts`

- [ ] **Step 1: Delete dead hook files**

```bash
rm -f web/lib/core/src/hooks/use-dify-chat.ts web/lib/core/src/hooks/use-apps.ts web/lib/core/src/hooks/use-conversations.ts web/lib/core/src/hooks/index.ts
```

- [ ] **Step 2: Remove SingleApp/MultiApp from constants/index.ts**

Replace `web/lib/core/src/constants/index.ts` content—remove `RunningModes` constant and `IMessageRole`/`Roles` stay:

```ts
/**
 * 消息角色
 */
export type IMessageRole = 'local' | 'user' | 'ai'

/**
 * 聊天中的角色
 */
export const Roles = {
	/**
	 * 用户
	 */
	USER: 'user',
	/**
	 * AI
	 */
	AI: 'ai',
	/**
	 * 本地，用户已发送但还未收到响应
	 */
	LOCAL: 'local',
} as const
```

- [ ] **Step 3: Commit**

```bash
git add -A web/lib/core/src/
git commit -m "chore: delete dead DifyChatContext hooks and SingleApp/MultiApp mode"
```

---

### Task 3: 扁平化 `web/lib/api/` — 物理移动文件

**Files:**

- Move: `web/lib/api/src/api/index.ts` → `web/lib/api/client.ts`
- Move: `web/lib/api/src/base-request.ts` → `web/lib/api/base-request.ts`
- Move: `web/lib/api/src/enums/index.ts` → `web/lib/api/enums.ts`
- Create: `web/lib/api/types.ts` (合并 event.ts + message.ts + file.ts)
- Create: `web/lib/api/index.ts` (新 barrel)
- Delete: `web/lib/api/src/` 剩余文件
- Delete: `web/lib/api/tests/` (保留 index.test.ts 在原地)

- [ ] **Step 1: Move api source files to root**

```bash
mv web/lib/api/src/api/index.ts web/lib/api/client.ts
mv web/lib/api/src/base-request.ts web/lib/api/base-request.ts
mv web/lib/api/src/enums/index.ts web/lib/api/enums.ts
```

- [ ] **Step 2: Merge 3 type files into web/lib/api/types.ts**

```ts
// web/lib/api/types.ts
// 合并自 src/types/file.ts, src/types/event.ts, src/types/message.ts

import { EventEnum } from './enums'
import type { IMessageRole } from '@/lib/core'

/**
 * Dify 支持的文件类型
 */
export type IFileType = 'document' | 'image' | 'audio' | 'video' | 'custom'

export interface IFileBase {
	type: IFileType
}

export interface IFileRemote extends IFileBase {
	transfer_method: 'remote_url'
	url?: string
}

export interface IFileLocal extends IFileBase {
	transfer_method: 'local_file'
	upload_file_id?: string
}

export type IFile = IFileRemote | IFileLocal

// ── 以下来自 src/types/event.ts ──
export type IUsage = {
	prompt_tokens: number
	prompt_unit_price: string
	prompt_price_unit: string
	prompt_price: string
	completion_tokens: number
	completion_unit_price: string
	completion_price_unit: string
	completion_price: string
	total_tokens: number
	total_price: string
	currency: string
	latency: number
}

export interface IRetrieverResource {
	id: string
	message_id: string
	position: number
	dataset_id: string
	dataset_name: string
	document_id: string
	document_name: string
	data_source_type: string
	segment_id: string
	score: number
	hit_count: number
	word_count: number
	segment_position: number
	index_node_hash: string
	content: string
	created_at: number
}

export type IMessageEvent = {
	event: EventEnum.MESSAGE
	task_id: string
	message_id: string
	conversation_id: string
	answer: string
	created_at: number
}

export type IAgentMessageEvent = {
	event: EventEnum.AGENT_MESSAGE
	task_id: string
	message_id: string
	conversation_id: string
	answer: string
	created_at: number
}

export type IAgentThoughtEvent = {
	event: EventEnum.AGENT_THOUGHT
	id: string
	task_id: string
	message_id: string
	position: number
	thought: string
	observation: string
	tool: string
	tool_input: string
	created_at: number
	message_files: string[]
	file_id: string
	conversation_id: string
}

export type IAgentThought = Omit<IAgentThoughtEvent, 'event'>

export type IMessageFileEvent = {
	event: EventEnum.MESSAGE_FILE
	id: string
	type: IFileType
	belongs_to: 'user' | 'assistant'
	url: string
	conversation_id: string
}

export type IMessageEndEvent = {
	event: EventEnum.MESSAGE_END
	task_id: string
	message_id: string
	conversation_id: string
	metadata: Record<string, unknown>
	usage: IUsage
	retriever_resources: IRetrieverResource[]
}

export type ITTSMessageEvent = {
	event: EventEnum.TTS_MESSAGE
	task_id: string
	message_id: string
	audio: string
	created_at: number
}

export type ITTSMessageEndEvent = {
	event: EventEnum.TTS_MESSAGE_END
	task_id: string
	message_id: string
	audio: ''
	created_at: number
}

export type IMessageReplaceEvent = {
	event: EventEnum.MESSAGE_REPLACE
	task_id: string
	message_id: string
	conversation_id: string
	answer: string
	created_at: number
}

export type IErrorEvent = {
	event: EventEnum.ERROR
	task_id: string
	message_id: string
	status: number
	code: string
	message: string
}

export type IPingEvent = {
	event: EventEnum.PING
}

export type IWorkflowStartedEvent = {
	event: EventEnum.WORKFLOW_STARTED
}

export type IWorkflowFinishedEvent = {
	event: EventEnum.WORKFLOW_FINISHED
}

export type IWorkflowNodeStarted = {
	event: EventEnum.WORKFLOW_NODE_STARTED
}

export type IWorkflowNodeFinished = {
	event: EventEnum.WORKFLOW_NODE_FINISHED
}

export type IChunkChatCompletionResponse =
	| IMessageEvent
	| IAgentMessageEvent
	| IAgentThoughtEvent
	| IMessageFileEvent
	| IMessageEndEvent
	| ITTSMessageEvent
	| ITTSMessageEndEvent
	| IMessageReplaceEvent
	| IErrorEvent
	| IPingEvent
	| IWorkflowStartedEvent
	| IWorkflowFinishedEvent
	| IWorkflowNodeStarted
	| IWorkflowNodeFinished

// ── 以下来自 src/types/message.ts ──
export interface IWorkflowNode {
	id: string
	title: string
	status: 'init' | 'running' | 'success' | 'error'
	type: 'question-classifier'
	inputs: string
	process_data: string
	outputs: unknown
	elapsed_time: number
	execution_metadata: {
		total_tokens: number
		total_price: number
		currency: string
	}
}

export interface IMessageFileItem {
	id: string
	filename: string
	type: string
	url: string
	mime_type: string
	size: number
	transfer_method: string
	belongs_to: string
	upload_file_id?: string
}

export interface IAgentMessage {
	workflows?: {
		status?: 'running' | 'finished'
		nodes?: IWorkflowNode[]
	}
	files?: IMessageFileItem[]
	content: string
	agentThoughts?: IAgentThought[]
	retrieverResources?: IRetrieverResource[]
}

export type IRating = 'like' | 'dislike' | null

export interface IMessageItem4Render extends IAgentMessage {
	id: string
	status: 'local' | 'loading' | 'success' | 'error'
	error?: string
	role: IMessageRole
	isHistory?: boolean
	feedback?: {
		rating: IRating
	}
	created_at: string
}
```

- [ ] **Step 3: Create new web/lib/api/index.ts**

```ts
// web/lib/api/index.ts
export { UnauthorizedError } from './base-request'
export * from './client'
export * from './enums'
export * from './types'
```

- [ ] **Step 4: Delete old src/ directory leftovers**

```bash
rm -rf web/lib/api/src
```

- [ ] **Step 5: Verify structure**

```bash
ls web/lib/api/
# Expected: base-request.ts  client.ts  enums.ts  index.ts  types.ts  tests/
```

- [ ] **Step 6: Commit**

```bash
git add -A web/lib/api/
git commit -m "chore: flatten web/lib/api/ directory structure"
```

---

### Task 4: 扁平化 `web/lib/core/` — 物理移动文件 + 创建 store.ts

**Files:**

- Move: `web/lib/core/src/constants/index.ts` → `web/lib/core/constants.ts`
- Move: `web/lib/core/src/constants/app.ts` → merge into `web/lib/core/constants.ts`
- Move: `web/lib/core/src/enums/index.ts` → `web/lib/core/enums.ts`
- Move: `web/lib/core/src/types/index.ts` → `web/lib/core/types.ts`
- Move: `web/lib/core/src/repository/app/index.ts` → `web/lib/core/repository.ts`
- Move: `web/lib/core/src/utils/index.ts` → `web/lib/core/utils.ts`
- Create: `web/lib/core/store.ts`
- Create: `web/lib/core/index.ts` (新 barrel)
- Delete: `web/lib/core/src/`

- [ ] **Step 1: Move core source files to root**

```bash
mv web/lib/core/src/enums/index.ts web/lib/core/enums.ts
mv web/lib/core/src/types/index.ts web/lib/core/types.ts
mv web/lib/core/src/repository/app/index.ts web/lib/core/repository.ts
mv web/lib/core/src/utils/index.ts web/lib/core/utils.ts
```

- [ ] **Step 2: Merge constants into web/lib/core/constants.ts**

当前的 `constants/index.ts` 已无 `SingleApp/MultiApp`（Task 2 中删除），`constants/app.ts` 内容不变。合并为一个文件：

```ts
// web/lib/core/constants.ts
// 合并自 src/constants/index.ts + src/constants/app.ts

export * from './app' // ← 删除这行，直接在同一文件定义

/**
 * 消息角色
 */
export type IMessageRole = 'local' | 'user' | 'ai'

/**
 * 聊天中的角色
 */
export const Roles = {
	USER: 'user',
	AI: 'ai',
	LOCAL: 'local',
} as const

// ── 以下来自 src/constants/app.ts ──
/**
 * 应用类型
 */
export enum AppModeEnums {
	TEXT_GENERATOR = 'completion',
	CHATBOT = 'chat',
	WORKFLOW = 'workflow',
	CHATFLOW = 'advanced-chat',
	AGENT = 'agent-chat',
}

export const AppModeLabels = {
	[AppModeEnums.TEXT_GENERATOR]: 'Text Generator',
	[AppModeEnums.CHATBOT]: 'Chatbot',
	[AppModeEnums.WORKFLOW]: 'Workflow',
	[AppModeEnums.CHATFLOW]: 'Chatflow',
	[AppModeEnums.AGENT]: 'Agent',
}

export const AppModeNames = {
	[AppModeEnums.TEXT_GENERATOR]: '文本生成',
	[AppModeEnums.CHATBOT]: '聊天助手',
	[AppModeEnums.WORKFLOW]: '工作流',
	[AppModeEnums.CHATFLOW]: '支持工作流编排的聊天助手',
	[AppModeEnums.AGENT]: '具备推理和自主调用能力的聊天助手',
}

const getAppModelFullName = (mode: AppModeEnums) => {
	return `${AppModeLabels[mode]}（${AppModeNames[mode]}）`
}

export const AppModeOptions = [
	AppModeEnums.CHATBOT,
	AppModeEnums.WORKFLOW,
	AppModeEnums.CHATFLOW,
	AppModeEnums.AGENT,
	AppModeEnums.TEXT_GENERATOR,
].map(mode => {
	return {
		label: getAppModelFullName(mode),
		value: mode,
	}
})

export const OpeningStatementDisplayMode = {
	Default: 'default',
	Always: 'always',
}

export const OpeningStatementDisplayModeOptions = [
	{
		label: '默认（开始对话前展示）',
		value: OpeningStatementDisplayMode.Default,
	},
	{
		label: '总是展示',
		value: OpeningStatementDisplayMode.Always,
	},
]
```

```bash
rm web/lib/core/src/constants/index.ts web/lib/core/src/constants/app.ts
rmdir web/lib/core/src/constants
```

- [ ] **Step 3: 修复 repository.ts 内部相对路径**

文件移动到 `web/lib/core/repository.ts` 后，原来的 `import { AppModeEnums } from '../../constants'` 和 `import { EIsEnabled } from '../../enums'` 需要改为：

```diff
- import { AppModeEnums } from '../../constants'
- import { EIsEnabled } from '../../enums'
+ import { AppModeEnums } from './constants'
+ import { EIsEnabled } from './enums'
```

- [ ] **Step 4: 修复 utils.ts 内部路径**

```diff
- import { BaseRequest } from '@dify-chat/helpers'
+ import { BaseRequest } from '@/lib/helpers'
- import { IDifyAppRequestConfig } from '../repository'
+ import { IDifyAppRequestConfig } from './repository'
```

- [ ] **Step 5: Create web/lib/core/store.ts**

```ts
import { create } from 'zustand'

export interface ICurrentApp {
	config: import('./repository').IDifyAppItem
	parameters: import('./types').IDifyAppParameters
}

export interface IConversationItem {
	id: string
	name: string
	inputs: Record<string, unknown>
	introduction: string
	created_at: string
	updated_at: string
}

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

> **注意**: `ICurrentApp` 和 `IConversationItem` 类型可能需要从 react-app 迁移过来，当前 web 的 core 中没有这些定义。如果不影响 web 内的编译（react-app 迁移前），可以用 `unknown` 占位。

- [ ] **Step 6: Create new web/lib/core/index.ts**

```ts
export { useDifyChatStore } from './store'
export type { ICurrentApp, IConversationItem, DifyChatState, DifyChatActions } from './store'
export * from './constants'
export * from './enums'
export * from './repository'
export * from './types'
export * from './utils'
```

- [ ] **Step 7: Delete old src/ directory**

```bash
rm -rf web/lib/core/src web/lib/core/hooks
```

- [ ] **Step 8: Verify structure**

```bash
ls web/lib/core/
# Expected: constants.ts  enums.ts  index.ts  repository.ts  store.ts  types.ts  utils.ts  tests/
```

- [ ] **Step 9: Commit**

```bash
git add -A web/lib/core/
git commit -m "chore: flatten web/lib/core/ and replace Context with Zustand store"
```

---

### Task 5: 扁平化 `web/lib/helpers/` — 物理移动文件

**Files:**

- Move: `web/lib/helpers/src/*.ts` → `web/lib/helpers/*.ts`
- Delete: `web/lib/helpers/src/`

- [ ] **Step 1: Move all helpers source files to root**

```bash
mv web/lib/helpers/src/base-request.ts web/lib/helpers/base-request.ts
mv web/lib/helpers/src/gzip.ts web/lib/helpers/gzip.ts
mv web/lib/helpers/src/id.ts web/lib/helpers/id.ts
mv web/lib/helpers/src/localstorage.ts web/lib/helpers/localstorage.ts
mv web/lib/helpers/src/responsive/index.ts web/lib/helpers/responsive.ts
mv web/lib/helpers/src/vars.ts web/lib/helpers/vars.ts
mv web/lib/helpers/src/index.ts web/lib/helpers/index.ts
```

- [ ] **Step 2: Delete old src/ directory**

```bash
rm -rf web/lib/helpers/src
```

- [ ] **Step 3: Verify structure**

```bash
ls web/lib/helpers/
# Expected: base-request.ts  gzip.ts  id.ts  index.ts  localstorage.ts  responsive.ts  vars.ts  tests/
```

- [ ] **Step 4: Commit**

```bash
git add -A web/lib/helpers/
git commit -m "chore: flatten web/lib/helpers/ directory structure"
```

---

### Task 6: 扁平化 `web/lib/theme/` — 物理移动文件

**Files:**

- Move: `web/lib/theme/src/hooks/index.tsx` → `web/lib/theme/theme-context.tsx`
- Move: `web/lib/theme/src/components/theme-selector.tsx` → `web/lib/theme/theme-selector.tsx`
- Move: `web/lib/theme/src/constants/index.ts` → `web/lib/theme/constants.ts`
- Create: `web/lib/theme/index.ts` (新 barrel)
- Delete: `web/lib/theme/src/`

- [ ] **Step 1: Move theme source files to root**

```bash
mv web/lib/theme/src/hooks/index.tsx web/lib/theme/theme-context.tsx
mv web/lib/theme/src/components/theme-selector.tsx web/lib/theme/theme-selector.tsx
mv web/lib/theme/src/constants/index.ts web/lib/theme/constants.ts
```

- [ ] **Step 2: Create new web/lib/theme/index.ts**

```ts
// web/lib/theme/index.ts
export * from './theme-context'
export * from './theme-selector'
export * from './constants'
```

- [ ] **Step 3: Delete old src/ directory**

```bash
rm -rf web/lib/theme/src
```

- [ ] **Step 4: Verify structure**

```bash
ls web/lib/theme/
# Expected: index.ts  theme-context.tsx  theme-selector.tsx  constants.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A web/lib/theme/
git commit -m "chore: flatten web/lib/theme/ directory structure"
```

---

### Task 7: 提取 components 包中有用组件 + 删除 lib/components/

**Files:**

- Copy: `web/lib/components/src/layout/logo.tsx` → `web/components/shared/logo.tsx`
- Copy: `web/lib/components/src/layout/header.tsx` → `web/components/shared/header-layout.tsx`
- Copy: `web/lib/components/src/lucide-icon/index.tsx` → `web/components/shared/lucide-icon.tsx`
- Delete: `web/lib/components/`

- [ ] **Step 1: Create shared directory and copy components**

```bash
mkdir -p web/components/shared
cp web/lib/components/src/layout/logo.tsx web/components/shared/logo.tsx
cp web/lib/components/src/layout/header.tsx web/components/shared/header-layout.tsx
cp web/lib/components/src/lucide-icon/index.tsx web/components/shared/lucide-icon.tsx
```

- [ ] **Step 2: Delete the entire lib/components/ directory**

```bash
rm -rf web/lib/components
```

- [ ] **Step 3: Verify**

```bash
ls web/components/shared/
# Expected: header-layout.tsx  logo.tsx  lucide-icon.tsx
ls web/lib/components/ 2>&1
# Expected: No such file or directory
```

- [ ] **Step 4: Commit**

```bash
git add -A web/components/shared/ web/lib/components/
git commit -m "chore: extract shared components, delete deprecated lib/components/"
```

---

### Task 8: 全局替换 import 路径

**Scope:** `@dify-chat/xxx` → `@/lib/xxx` 和 `@dify-chat/components` → `@/components/shared`

**Files 预估 ~30-35 个（web/app/ web/components/ web/repository/ lib/ 内交叉引用）**

- [ ] **Step 1: Replace @dify-chat/api → @/lib/api**

```bash
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|from '@dify-chat/api'|from '@/lib/api'|g" {} +
```

- [ ] **Step 2: Replace @dify-chat/core → @/lib/core**

```bash
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|from '@dify-chat/core'|from '@/lib/core'|g" {} +
```

- [ ] **Step 3: Replace @dify-chat/helpers → @/lib/helpers**

```bash
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|from '@dify-chat/helpers'|from '@/lib/helpers'|g" {} +
```

- [ ] **Step 4: Replace @dify-chat/theme → @/lib/theme**

```bash
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|from '@dify-chat/theme'|from '@/lib/theme'|g" {} +
```

- [ ] **Step 5: Replace @dify-chat/components → @/components/shared**

```bash
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|from '@dify-chat/components'|from '@/components/shared'|g" {} +
```

- [ ] **Step 6: Handle multi-line imports (curly braces)**

Some files import multiple symbols across lines. Run a second pass for the multi-line patterns:

```bash
# Handle: import { x, y } from '@dify-chat/core'
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|} from '@dify-chat/core'|} from '@/lib/core'|g" {} +
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|} from '@dify-chat/helpers'|} from '@/lib/helpers'|g" {} +
find web -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' "s|} from '@dify-chat/theme'|} from '@/lib/theme'|g" {} +
```

- [ ] **Step 7: Verify no @dify-chat references remain in web/**

```bash
grep -r "@dify-chat/" web/app web/components web/lib web/repository --include='*.ts' --include='*.tsx' || echo "No matches — clean"
```

Expected: No matches (grep returns exit code 1 = no matches = "No matches — clean")

- [ ] **Step 8: Commit**

```bash
git add -A web/
git commit -m "chore: replace @dify-chat/* imports with @/lib/* paths"
```

---

### Task 9: 更新 web/package.json 移除 workspace 依赖

**Files:**

- Modify: `web/package.json`

- [ ] **Step 1: Remove @dify-chat workspace dependencies**

```bash
cd web && node -e "
const pkg = require('./package.json');
delete pkg.dependencies['@dify-chat/api'];
delete pkg.dependencies['@dify-chat/components'];
delete pkg.dependencies['@dify-chat/core'];
delete pkg.dependencies['@dify-chat/helpers'];
delete pkg.dependencies['@dify-chat/theme'];
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, '\t') + '\n');
"
```

- [ ] **Step 2: Run pnpm install to update lockfile**

```bash
pnpm install
```

- [ ] **Step 3: Verify package.json no longer has workspace deps**

```bash
grep '@dify-chat/' web/package.json || echo "Clean"
```

- [ ] **Step 4: Commit**

```bash
git add web/package.json pnpm-lock.yaml
git commit -m "chore: remove @dify-chat/* workspace dependencies from web"
```

---

### Task 10: 验证构建

- [ ] **Step 1: Run type check**

```bash
cd web && npx tsc --noEmit
```

Fix any type errors reported. Common fixes:

- `ICurrentApp` / `IConversationItem` 类型未定义 → 从 react-app 复制或暂时用 `unknown` 占位
- core/utils.ts 中 `import { IDifyAppRequestConfig } from '../repository'` 路径错误 → 应为 `'./repository'`

- [ ] **Step 2: Run next build**

```bash
cd web && pnpm build
```

Expected: build 成功，exit code 0

- [ ] **Step 3: Commit final fixes (if any)**

```bash
git add -A web/
git commit -m "fix: resolve type errors after lib restructure"
```

---

## 最终验证

执行以下检查确保清理完成：

```bash
# 1. web/lib/ 下无 package.json / tsconfig / rslib 等
find web/lib -name 'package.json' -o -name 'rslib.config.ts' -o -name 'tsconfig.json' | wc -l | xargs test 0 -eq

# 2. web/lib/ 下无 node_modules / dist
test ! -d web/lib/*/node_modules && test ! -d web/lib/*/dist && echo "Clean"

# 3. web/package.json 中无 @dify-chat workspace 依赖
grep '@dify-chat/' web/package.json; test $? -eq 1 && echo "Clean"

# 4. web/ 代码中无 @dify-chat import
grep -r "from '@dify-chat/" web/app web/components web/lib --include='*.ts' --include='*.tsx'; test $? -eq 1 && echo "Clean"

# 5. 死代码已删除
grep -r 'DifyChatProvider\|useDifyChat\|singleApp\|multiApp' web/lib --include='*.ts' --include='*.tsx'; test $? -eq 1 && echo "Clean"

# 6. next build 通过
cd web && pnpm build
```
