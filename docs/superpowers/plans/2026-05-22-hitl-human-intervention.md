# Human Intervention (HITL) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add support for Dify's Human Intervention (HITL) feature in Chatflow/Workflow apps.

**Architecture:** Extend the existing SSE streaming pipeline with a `human_input_required` event handler, add HITL state to the Zustand store, create a new `HumanInterventionForm` component rendered inline in the chat stream, and implement the GET/POST API calls via the Dify proxy.

**Tech Stack:** React 19, TypeScript 5, Zustand 5, Ant Design 6, @ant-design/x-sdk

**Spec:** `docs/superpowers/specs/2026-05-22-hitl-human-intervention-design.md`

---

## File Map

| File | Action | Purpose |
| --- | --- | --- |
| `web/lib/api/enums.ts` | Modify | Add `HUMAN_INPUT_REQUIRED` event |
| `web/lib/api/types.ts` | Modify | Add HITL event/API types |
| `web/lib/core/store.ts` | Modify | Add `hitl` state + setters |
| `web/lib/dify-client.ts` | Modify | Add `getHumanInputForm()` / `submitHumanInput()` |
| `web/hooks/useX/x-provider.ts` | Modify | Handle `human_input_required` in stream |
| `web/hooks/useX/index.ts` | Modify | Expose `onHumanInputRequired` callback |
| `web/components/chat/chatbox-wrapper.tsx` | Modify | Wire HITL flow: fetch form, submit, SSE recovery, input disable |
| `web/components/chat/hitl-form/index.tsx` | Create | `HumanInterventionForm` component |

---

### Task 1: Event Type & API Types

**Files:**

- Modify: `web/lib/api/enums.ts`
- Modify: `web/lib/api/types.ts`

- [ ] **Step 1: Add `HUMAN_INPUT_REQUIRED` to EventEnum**

In `web/lib/api/enums.ts`, find the `EventEnum` export and add the new member:

```typescript
export enum EventEnum {
	// ... existing members ...
	/** 人工介入 — 工作流暂停，等待用户输入 */
	HUMAN_INPUT_REQUIRED = 'human_input_required',
}
```

- [ ] **Step 2: Add HITL type interfaces**

In `web/lib/api/types.ts`, append the following interfaces before the closing of the file:

```typescript
/**
 * HITL 流事件载荷
 * 由 human_input_required SSE 事件返回
 */
export interface IHumanInputRequiredEvent {
	event: EventEnum.HUMAN_INPUT_REQUIRED
	task_id: string
	message_id: string
	conversation_id: string
	form_token: string
	created_at: number
}

/**
 * GET /form/human_input/{form_token} 响应
 */
export interface IHumanInputFormData {
	form_content: string
	inputs: IHumanInputField[]
	resolved_default_values: Record<string, string>
	user_actions: IHumanInputAction[]
	expiration_time: number
}

export interface IHumanInputField {
	type: 'text_input' | 'select' | 'paragraph' | 'number'
	output_variable_name: string
	default: {
		type: string
		selector: string[]
		value: string
	}
}

export interface IHumanInputAction {
	id: string
	title: string
	button_style: 'primary' | 'default'
}

/**
 * POST /form/human_input/{form_token} 请求体
 */
export interface IHumanInputSubmitBody {
	inputs: Record<string, string>
	action: string
	user: string
}
```

- [ ] **Step 3: Ensure EventEnum is imported in types.ts**

Check that `EventEnum` is already imported at the top of `web/lib/api/types.ts`. If not, add:

```typescript
import { EventEnum } from './enums'
```

- [ ] **Step 4: Commit**

```bash
git add web/lib/api/enums.ts web/lib/api/types.ts
git commit -m "feat: add HITL event types and API interfaces"
```

---

### Task 2: HITL State in Zustand Store

**Files:**

- Modify: `web/lib/core/store.ts`

- [ ] **Step 1: Read the current store to understand existing patterns**

Read `web/lib/core/store.ts` to understand:

- How existing state slices are structured
- How setters are defined (use `set` from zustand)
- How the store is exported

- [ ] **Step 2: Add HITL state interface and initial value**

Add the interface at the top of the file (near other interfaces):

```typescript
export interface IHITLState {
	active: boolean
	formToken: string | null
	taskId: string | null
	formData: IHumanInputFormData | null
}

const initialHITLState: IHITLState = {
	active: false,
	formToken: null,
	taskId: null,
	formData: null,
}
```

Import `IHumanInputFormData` from `@/lib/api/types` at the top of the file.

- [ ] **Step 3: Add `hitl` field and setters to the store**

Inside the `create()` call, add the `hitl` state field to the returned object:

```typescript
hitl: initialHITLState,

setHITLState: (partial: Partial<IHITLState>) =>
  set(state => ({ hitl: { ...state.hitl, ...partial } })),

clearHITLState: () =>
  set({ hitl: initialHITLState }),
```

- [ ] **Step 4: Commit**

```bash
git add web/lib/core/store.ts
git commit -m "feat: add HITL state to Zustand store"
```

---

### Task 3: API Client Methods

**Files:**

- Modify: `web/lib/dify-client.ts`

- [ ] **Step 1: Add `getHumanInputForm` method**

Inside the `DifyApi` class, add:

```typescript
/**
 * 获取暂停中的人工介入表单
 */
async getHumanInputForm(appId: string, formToken: string): Promise<IHumanInputFormData> {
  return this.baseRequest.get(
    `${PLATFORM_API_BASE}/${appId}/form/human_input/${formToken}`
  )
}
```

- [ ] **Step 2: Add `submitHumanInput` method**

```typescript
/**
 * 提交人工介入表单
 */
async submitHumanInput(
  appId: string,
  formToken: string,
  body: IHumanInputSubmitBody
): Promise<void> {
  return this.baseRequest.post(
    `${PLATFORM_API_BASE}/${appId}/form/human_input/${formToken}`,
    body
  )
}
```

- [ ] **Step 3: Ensure types are imported**

Verify the top of the file imports:

```typescript
import type { IHumanInputFormData, IHumanInputSubmitBody } from '@/lib/api/types'
```

- [ ] **Step 4: Commit**

```bash
git add web/lib/dify-client.ts
git commit -m "feat: add DifyApi methods for HITL form get/submit"
```

---

### Task 4: Stream Event Handler

**Files:**

- Modify: `web/hooks/useX/x-provider.ts`
- Modify: `web/hooks/useX/index.ts`

- [ ] **Step 1: Add `onHumanInputRequired` callback to CustomProvider**

In `web/hooks/useX/x-provider.ts`:

Add the callback property to the `CustomProviderOptions` interface (find it near the top of the file):

```typescript
onHumanInputRequired?: (data: IHumanInputRequiredEvent) => void
```

Import `IHumanInputRequiredEvent` from `@/lib/api/types`.

- [ ] **Step 2: Add case in `transformMessage`**

Find the `transformMessage` method's switch/case block. Add a new case before the `default` case:

```typescript
case EventEnum.HUMAN_INPUT_REQUIRED:
  this.onHumanInputRequired?.(parsedData as IHumanInputRequiredEvent)
  return { type: 'event' as const, data: parsedData }
```

Ensure `EventEnum` is imported (it should already be).

- [ ] **Step 3: Expose `onHumanInputRequired` in `useX` hook**

In `web/hooks/useX/index.ts`, find the provider instantiation (where `onConversationIdChange`, etc. are passed). Add:

```typescript
onHumanInputRequired: (data) => {
  props.onHumanInputRequired?.(data)
},
```

Add `onHumanInputRequired` to the props interface at the top of the file:

```typescript
export interface IUseXProps {
	// ... existing ...
	onHumanInputRequired?: (data: IHumanInputRequiredEvent) => void
}
```

- [ ] **Step 4: Commit**

```bash
git add web/hooks/useX/x-provider.ts web/hooks/useX/index.ts
git commit -m "feat: handle human_input_required event in SSE stream"
```

---

### Task 5: HumanInterventionForm Component

**Files:**

- Create: `web/components/chat/hitl-form/index.tsx`

- [ ] **Step 1: Create the component file**

Create `web/components/chat/hitl-form/index.tsx`:

```typescript
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button, Input, Spin, message as antdMessage } from 'antd'
import type { IHumanInputFormData, IHumanInputAction } from '@/lib/api/types'

interface HumanInterventionFormProps {
  formData: IHumanInputFormData
  disabled?: boolean
  onSubmit: (inputs: Record<string, string>, action: string) => Promise<void>
}

export default function HumanInterventionForm({
  formData,
  disabled = false,
  onSubmit,
}: HumanInterventionFormProps) {
  const { form_content, inputs, resolved_default_values, user_actions, expiration_time } = formData

  // 表单输入值
  const [values, setValues] = useState<Record<string, string>>(resolved_default_values)
  // 提交状态
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 倒计时
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, expiration_time - Math.floor(Date.now() / 1000))
  )

  // 倒计时定时器
  useEffect(() => {
    if (remainingSeconds <= 0) return
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [remainingSeconds])

  const expired = remainingSeconds <= 0

  const handleSubmit = useCallback(async (action: IHumanInputAction) => {
    if (expired || disabled || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values, action.id)
    } catch (e) {
      setError((e as Error).message || '提交失败，请重试')
      setSubmitting(false)
    }
  }, [expired, disabled, submitting, values, onSubmit])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="hitl-form-card rounded-lg border border-orange-200 bg-orange-50 p-4">
      {/* 标题 */}
      <div className="mb-3 flex items-center gap-2 text-orange-700">
        <span className="text-lg">🔔</span>
        <span className="font-medium">人工介入</span>
      </div>

      {/* 表单内容 */}
      <div className="mb-3 text-sm">{form_content}</div>

      {/* 输入项 */}
      <div className="mb-3 flex flex-col gap-2">
        {inputs.map(field => (
          <div key={field.output_variable_name}>
            <Input
              placeholder={field.output_variable_name}
              value={values[field.output_variable_name] || ''}
              onChange={e =>
                setValues(prev => ({ ...prev, [field.output_variable_name]: e.target.value }))
              }
              disabled={expired || disabled || submitting}
            />
          </div>
        ))}
      </div>

      {/* 倒计时 */}
      <div className="mb-3 text-xs text-gray-400">
        ⏱ 剩余 {formatTime(remainingSeconds)}
      </div>

      {/* 错误提示 */}
      {error && <div className="mb-2 text-sm text-red-500">{error}</div>}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {user_actions.map(action => (
          <Button
            key={action.id}
            type={action.button_style === 'primary' ? 'primary' : 'default'}
            loading={submitting}
            disabled={expired || disabled || submitting}
            onClick={() => handleSubmit(action)}
          >
            {action.title}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/components/chat/hitl-form/index.tsx
git commit -m "feat: add HumanInterventionForm component"
```

---

### Task 6: Wire HITL into ChatboxWrapper

**Files:**

- Modify: `web/components/chat/chatbox-wrapper.tsx`

- [ ] **Step 1: Read current ChatboxWrapper to understand the flow**

Read `web/components/chat/chatbox-wrapper.tsx` to understand:

- How the `useX` hook is called and what props it receives
- How `useDifyChatStore` is used
- How `currentAppId` is accessed
- How `isRequesting` / abort states are managed
- How the chat input disable logic works

- [ ] **Step 2: Import new types and read HITL state from store**

At the top of the file, add the import:

```typescript
import type { IHumanInputRequiredEvent } from '@/lib/api/types'
```

Inside the component, after existing `useDifyChatStore()` calls, add:

```typescript
const hitl = useDifyChatStore(s => s.hitl)
const setHITLState = useDifyChatStore(s => s.setHITLState)
const clearHITLState = useDifyChatStore(s => s.clearHITLState)
```

- [ ] **Step 3: Add `onHumanInputRequired` callback to `useX`**

Find the `useX` call (typically: `const { abort, isRequesting, onRequest, messages, setMessages } = useX({...})`). Add the callback inside the props object:

```typescript
onHumanInputRequired: (data: IHumanInputRequiredEvent) => {
  setHITLState({
    active: true,
    formToken: data.form_token,
    taskId: data.task_id,
  })
},
```

- [ ] **Step 4: Add useEffect to fetch HITL form data**

After the existing `useEffect` blocks, add:

```typescript
// 获取 HITL 表单内容
useEffect(() => {
	if (!hitl.active || !hitl.formToken || !currentAppId) return
	const fetchForm = async () => {
		try {
			const formData = await difyApi?.getHumanInputForm(currentAppId, hitl.formToken!)
			if (formData) {
				setHITLState({ formData })
			}
		} catch (e) {
			console.error('Failed to fetch HITL form:', e)
		}
	}
	fetchForm()
}, [hitl.active, hitl.formToken, currentAppId])
```

> Note: `difyApi` is the DifyApi instance from the `useX` hook or store. Check how it's accessed in the component. If `difyApi` is not directly available, use `DifyApi` from `@/lib/dify-client` with the current app's config.

- [ ] **Step 5: Handle form submission**

Add a `handleHITLSubmit` function:

```typescript
const handleHITLSubmit = useCallback(
	async (inputs: Record<string, string>, action: string) => {
		if (!currentAppId || !hitl.formToken || !userId) return
		try {
			await difyApi?.submitHumanInput(currentAppId, hitl.formToken, {
				inputs,
				action,
				user: userId,
			})
			setHITLState({ active: false })
			// 注意：提交成功后的 SSE 恢复由后续任务处理
		} catch (e) {
			throw e // 让 HumanInterventionForm 处理错误展示
		}
	},
	[currentAppId, hitl.formToken, userId, difyApi],
)
```

> Note: `userId` needs to be obtained from the user store or auth context.

- [ ] **Step 6: Disable chat input when HITL is active**

Find where the chat input disabled state is controlled (typically in the `Chatbox` or `MessageSender` component). Pass `hitl.active` to disable the input:

```typescript
// In the JSX where Chatbox/MessageSender is rendered:
inputDisabled={hitl.active || isRequesting}
```

- [ ] **Step 7: Clear HITL state on conversation switch**

Find the `useEffect` that watches `currentConversationId` (around line 294-306). Inside the else branch (clearing branch), add:

```typescript
clearHITLState()
```

This ensures HITL state is reset when the user switches conversations.

- [ ] **Step 8: Commit**

```bash
git add web/components/chat/chatbox-wrapper.tsx
git commit -m "feat: wire HITL form into ChatboxWrapper"
```

---

### Task 7: SSE Recovery After HITL Submission

**Files:**

- Modify: `web/components/chat/chatbox-wrapper.tsx`

- [ ] **Step 1: Read the current SSE handling to understand reconnection**

Read the `useX` hook (`web/hooks/useX/index.ts`) and the provider (`web/hooks/useX/x-provider.ts`) to understand how the SSE stream is initialized and if there's existing reconnection logic.

- [ ] **Step 2: Add recovery call after successful HITL submission**

In the `handleHITLSubmit` function from Task 5, after a successful submit, trigger SSE recovery. Add a call to the existing streaming mechanism to restart with the `task_id`:

```typescript
// After successful submit and setHITLState({ active: false }):
// Reconnect SSE to continue the workflow
if (hitl.taskId) {
	// Trigger a new streaming request with the task_id
	// This depends on how the existing streaming is initialized
	// For Chatflow: pass task_id as part of the next chat message context
	// For Workflow: use the workflow events endpoint
}
```

> **⚠️ Design Decision Required**: The exact mechanism for SSE recovery depends on how the existing streaming infrastructure works. Options:
>
> - A) Pass `task_id` in the next `sendMessage` call as additional context
> - B) Directly call `GET /workflow/{taskId}/events` from the client
> - C) Add a platform proxy route for workflow event streaming
>
> This step should be finalized after reading the existing SSE initialization code in the `useX` hook and provider.

- [ ] **Step 3: Commit**

```bash
git add web/components/chat/chatbox-wrapper.tsx
git commit -m "feat: add SSE recovery after HITL form submission"
```

---

### Task 8: Verification & Integration Test

**Files:**

- Create: (manual test, no automated test file)

- [ ] **Step 1: Manual verification checklist**

1. 使用 Chatflow/Workflow 应用，在 Dify 后台配置一个人工介入节点
2. 在 dify-chat 中与该应用对话
3. 验证：当工作流到达人工介入节点时，聊天输入框被禁用 ✅
4. 验证：HITL 表单在消息流中正确渲染（标题、内容、输入框、按钮）✅
5. 验证：倒计时正常倒数 ✅
6. 验证：点击按钮后表单提交，按钮显示 loading ✅
7. 验证：提交成功后工作流恢复，继续返回后续消息 ✅
8. 验证：切换会话后 HITL 状态被清除 ✅
9. 验证：表单过期后按钮被禁用 ✅

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: HITL manual verification checklist"
```

---

## Implementation Order

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8
  (types)  (store)  (api)   (stream)  (ui)     (wiring) (recovery) (verify)
```

Tasks 1-4 are independent of each other and could be parallelized. Tasks 5-7 depend on 1-4.

## Key Decisions

1. **Form rendering**: Uses Ant Design `Button` for actions and `Input` for text fields. `form_content` is rendered as plain text (could be upgraded to markdown later).
2. **SSE recovery** (Task 7): Needs further investigation of the existing streaming infrastructure. Marked as a design-decision-required step.
3. **User ID**: The `user` field for POST submission needs to come from the auth/user store — verify which store provides the current end user identifier.
