# Human Intervention (HITL) 支持 — 设计文档

> Issue: [#443](https://github.com/lexmin0412/dify-chat/issues/443) 日期: 2026-05-22状态: 待实现

---

## 1. 概述

Dify Chatflow / Workflow 应用中的「人工介入」节点允许工作流在运行过程中暂停，向用户展示表单并要求审批或输入。本设计为 dify-chat 新增对 `human_input_required` 流事件的完整支持。

涉及两个 Dify API：

- `GET /form/human_input/{form_token}` — 获取暂停表单内容
- `POST /form/human_input/{form_token}` — 提交表单响应

恢复机制（Chatflow/Workflow 通用）：

- `GET /workflow/{task_id}/events?user={userId}` — 重连 SSE 流

---

## 2. 数据流

```
流式响应 (SSE)
  │  human_input_required 事件 { form_token, ... }
  ▼
x-provider.ts / transformMessage
  │  新增 HUMAN_INPUT_REQUIRED case
  │  → onHumanInputRequired(form_token) 回调
  ▼
useX hook
  │  透传回调到 ChatboxWrapper
  ▼
ChatboxWrapper
  │  store.setHITLState({ active: true, formToken, taskId })
  │  useEffect → GET /form/human_input/{formToken}
  │  → store.setHITLFormData(formData)
  ▼
消息列表
  │  渲染 HumanInterventionForm 组件
  ▼
HumanInterventionForm
  │  用户填写 + 点击操作按钮
  │  → onSubmit(inputs, action)
  ▼
ChatboxWrapper
  │  POST /form/human_input/{formToken}
  │  → 成功 → store.setHITLState({ active: false })
  │  → GET /workflow/{taskId}/events 重连 SSE
  ▼
正常对话恢复
```

---

## 3. 新增/修改文件

### 3.1 类型 & 常量

**`web/lib/api/enums.ts`** — 新增事件类型

```typescript
export enum EventEnum {
	// ... existing ...
	/** 人工介入 — 触发 HITL 表单 */
	HUMAN_INPUT_REQUIRED = 'human_input_required',
}
```

**`web/lib/api/types.ts`** — 新增类型定义

```typescript
// HITL 事件的流载荷
export interface IHumanInputRequiredEvent {
	event: EventEnum.HUMAN_INPUT_REQUIRED
	task_id: string
	message_id: string
	conversation_id: string
	form_token: string
	created_at: number
}

// GET /form/human_input/{token} 响应
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
	default: { type: string; selector: string[]; value: string }
}

export interface IHumanInputAction {
	id: string
	title: string
	button_style: 'primary' | 'default'
}

// POST /form/human_input/{token} 请求体
export interface IHumanInputSubmitBody {
	inputs: Record<string, string>
	action: string // user_actions[].id
	user: string // 终端用户标识
}
```

### 3.2 状态管理

**`web/lib/core/store.ts`** — 新增 HITL 状态

```typescript
interface HITLState {
  active: boolean
  formToken: string | null
  taskId: string | null          // 用于恢复 SSE
  formData: IHumanInputFormData | null
}

// Zustand store 新增字段和方法
hitl: HITLState
setHITLState: (state: Partial<HITLState>) => void
clearHITLState: () => void
```

### 3.3 API 客户端

**`web/lib/dify-client.ts`** — 新增方法

```typescript
// 获取 HITL 表单（通过平台代理）
async getHumanInputForm(formToken: string): Promise<IHumanInputFormData>

// 提交 HITL 表单
async submitHumanInput(formToken: string, body: IHumanInputSubmitBody): Promise<void>
```

### 3.4 流事件处理

**`web/hooks/useX/x-provider.ts`** — 新增事件分支

```typescript
// transformMessage 中新增
case EventEnum.HUMAN_INPUT_REQUIRED:
  this.onHumanInputRequired?.(parsedData)
  return { type: 'event', data: parsedData }
```

### 3.5 UI 组件

**`web/components/chat/hitl-form/index.tsx`** — 新建

```
HumanInterventionForm
├── Props:
│   ├── formData: IHumanInputFormData
│   ├── onSubmit: (inputs, action) => void
│   └── disabled?: boolean
│
├── State:
│   ├── submitting: boolean
│   └── remainingSeconds: number  (倒计时)
│
└── 渲染:
    ├── 标题栏: "🔔 人工介入"
    ├── form_content (markdown 渲染)
    ├── inputs[] → 动态输入项 (text_input / select / paragraph / number)
    ├── 倒计时 (基于 expiration_time)
    ├── user_actions[] → 操作按钮 (primary / default)
    └── 状态: 加载中 / 激活 / 提交中 / 已过期 / 错误
```

**`web/components/chat/chatbox-wrapper.tsx`** — 修改

1. 读取 `store.hitl.active`，HITL 激活时禁用聊天输入框
2. `onHumanInputRequired` 回调：存入 store + 调用 GET 接口获取表单
3. 表单提交处理：POST 提交 → 恢复 SSE
4. 切换会话时清除 HITL 状态

---

## 4. 错误处理

| 场景                  | 处理                             |
| --------------------- | -------------------------------- |
| GET 接口失败          | 表单区显示「加载失败」+ 重试按钮 |
| POST 提交失败         | 按钮恢复可用，显示错误提示       |
| 表单已过期            | 显示「表单已过期」，禁用交互     |
| form_token 无效 (404) | 显示「表单不存在或已被处理」     |
| SSE 重连失败          | 显示错误，保留表单状态允许重试   |

---

## 5. 边界情况

| 场景               | 处理                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 连续多个 HITL 表单 | store 只保留最新，新的覆盖旧的；恢复 SSE 时传 `continue_on_pause=true` |
| 页面刷新           | store 丢失 → 不影响（本期不处理跨 session 恢复）                       |
| 切换会话           | HITL 状态随 conversation 切换清除                                      |
| 历史消息加载       | HITL 表单在消息列表末尾，不受影响                                      |

---

## 6. 不在本期范围

- 跨 session 的 HITL 状态恢复（页面刷新后）
- HITL 表单的国际化
- HITL 任务的集中管理面板
