# WorkspaceSelectorModal Component

## 概述

`WorkspaceSelectorModal` 是一个独立可复用的工作空间选择模态框组件，用于在应用中提供工作空间选择功能。该组件从 `AppCard` 组件中抽象出来，实现了与原页面的解耦，支持自定义配置和独立维护。

## 特性

- 🎯 **独立可复用**: 可在任何需要工作空间选择的场景中使用
- 🔧 **高度可配置**: 支持自定义标题、按钮文本、样式等
- 📱 **响应式设计**: 适配不同屏幕尺寸
- 🌙 **暗色模式支持**: 自动适配暗色主题
- ⚡ **异步加载**: 支持自定义工作空间获取函数
- 🎨 **美观界面**: 现代化的UI设计和交互效果
- 🛡️ **类型安全**: 完整的TypeScript类型定义

## Props 接口

```typescript
interface WorkspaceSelectorModalProps {
  /** 模态框是否可见 */
  visible: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
  /** 确认选择的回调函数 */
  onConfirm: (workspace: Workspace) => Promise<void> | void;
  /** 模态框标题，默认为"选择工作空间" */
  title?: string;
  /** 确认按钮文本，默认为"确认添加" */
  confirmText?: string;
  /** 取消按钮文本，默认为"取消" */
  cancelText?: string;
  /** 模态框宽度，默认为600 */
  width?: number;
  /** 是否禁用确认按钮，默认为false */
  confirmLoading?: boolean;
  /** 预选的工作空间ID */
  preselectedWorkspaceId?: string;
  /** 自定义工作空间获取函数 */
  workspaceFetcher?: () => Promise<Workspace[]>;
  /** 自定义空状态文本 */
  emptyText?: string;
  /** 加载状态文本 */
  loadingText?: string;
}
```

## 基本用法

```tsx
import { useState } from 'react';
import { Button } from 'antd';
import WorkspaceSelectorModal from './WorkspaceSelectorModal';
import { Workspace } from '@/types';

const MyComponent = () => {
  const [visible, setVisible] = useState(false);

  const handleConfirm = async (workspace: Workspace) => {
    // 处理工作空间选择逻辑
    console.log('选择的工作空间:', workspace);
    setVisible(false);
  };

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        选择工作空间
      </Button>
      
      <WorkspaceSelectorModal
        visible={visible}
        onClose={() => setVisible(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
```

## 高级用法

### 自定义工作空间获取

```tsx
const customWorkspaceFetcher = async () => {
  const response = await fetch('/api/custom-workspaces');
  return response.json();
};

<WorkspaceSelectorModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleConfirm}
  workspaceFetcher={customWorkspaceFetcher}
  loadingText="正在获取自定义工作空间..."
  emptyText="没有找到可用的工作空间"
/>
```

### 预选工作空间

```tsx
<WorkspaceSelectorModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleConfirm}
  preselectedWorkspaceId="workspace-123"
/>
```

### 自定义样式和文本

```tsx
<WorkspaceSelectorModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="选择目标工作空间"
  confirmText="添加到工作空间"
  cancelText="暂不添加"
  width={800}
  confirmLoading={isAdding}
/>
```

## 状态管理

组件内部管理以下状态：

- `workspaces`: 工作空间列表数据
- `loading`: 加载状态
- `selectedWorkspace`: 当前选中的工作空间

## 错误处理

组件内置了错误处理机制：

1. **工作空间获取失败**: 显示错误消息
2. **确认回调异常**: 重新抛出错误供调用方处理
3. **未选择工作空间**: 显示警告消息

## 样式定制

组件使用 Tailwind CSS 类名，支持以下样式定制：

- 工作空间项的悬停效果
- 选中状态的高亮样式
- 暗色模式的自动适配
- 响应式布局

## 可访问性

- 支持键盘导航
- 语义化的HTML结构
- 适当的ARIA属性
- 高对比度支持

## 性能优化

- 使用 `useEffect` 优化数据获取时机
- 组件销毁时自动清理状态
- 防止不必要的重新渲染

## 迁移指南

如果你之前使用的是内联在 `AppCard` 中的模态框，迁移步骤如下：

### 之前

```tsx
// 在 AppCard 组件中内联的模态框代码
<Modal
  title="选择工作空间"
  open={isModalVisible}
  onCancel={handleCloseModal}
  onOk={handleConfirmAdd}
  // ... 大量的模态框内容代码
>
  {/* 复杂的工作空间列表渲染逻辑 */}
</Modal>
```

### 之后

```tsx
// 使用独立的 WorkspaceSelectorModal
import WorkspaceSelectorModal from './WorkspaceSelectorModal';

<WorkspaceSelectorModal
  visible={isModalVisible}
  onClose={handleCloseModal}
  onConfirm={handleConfirmAdd}
  confirmLoading={addingApp}
/>
```

## 最佳实践

1. **错误处理**: 在 `onConfirm` 回调中添加适当的错误处理
2. **加载状态**: 使用 `confirmLoading` 属性显示操作进度
3. **用户体验**: 提供有意义的标题和按钮文本
4. **数据获取**: 对于复杂场景，使用自定义的 `workspaceFetcher`
5. **状态重置**: 利用组件的自动状态清理功能

## 文件结构

```
src/pages/app-markets/components/
├── WorkspaceSelectorModal.tsx    # 主组件文件
├── AppCard.tsx                   # 使用该组件的示例
└── index.ts                      # 导出文件（可选）
```

## 依赖项

- React 18+
- Ant Design 5+
- Tailwind CSS
- 项目内部的 `Workspace` 类型定义
- 项目内部的 `workspaceService`（可选，用于默认获取函数）

## 类型定义

组件导出了完整的 TypeScript 类型定义：

```typescript
export interface WorkspaceSelectorModalProps {
  // ... 所有props的类型定义
}

export type { Workspace } from '@/types';
```

## 更新日志

### v1.0.0
- 初始版本发布
- 从 AppCard 组件中抽象出来
- 完整的 TypeScript 支持
- 响应式设计和暗色模式支持