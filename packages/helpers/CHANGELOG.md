# @dify-chat/helpers

## 0.7.0

### Minor Changes

- 20b4668: ### v0.7.0
  - 新增 i18n 支持
  - 新增标注功能，包括 Platform 的标注管理和用户端的创建标注
  - 使用 emoji-mart 替换 emoji-dictionary 以支持更广泛的 emoji 图标
  - 升级 Prisma 至 v7，
  - 优化 Docker 镜像体积（platform 镜像 10%↓，react-app 镜像 90%↓）
  - 使用 oxlint/oxfmt 替代 eslint/prettier 进行代码 lint/格式化
  - 优化代码块的展示和复制交互
  - difyApi 使用全局状态管理，提升开发体验
  - 修复 Platform 抽屉中的表单分组标识背景色不正确的问题
  - 修复知识库引用 Popover 样式失效的问题

## 0.6.9

### Patch Changes

- d87bc7a: AI回复过程中支持阻止自动滚动

## 0.6.8

### Patch Changes

- 70b38ad: 修复安全漏洞 CVE-2025-55183 和 CVE-2025-55184

## 0.6.7

### Patch Changes

- 4e62081: 修复安全漏洞(CVE-2025-55182)

## 0.6.6

### Patch Changes

- 09188ff: - 修复侧边栏收起时可无限添加新对话的问题
  - 优化移动端和小屏下的响应式布局

## 0.6.5

### Patch Changes

- e74d395: 对话输入参数组件优化: 修复多文件组件跨对话切换时没有清空的问题, 并重构渲染组件和 Dify 接口返回字段的映射逻辑

## 0.6.4

### Patch Changes

- 2291d88: 回复表单时支持隐藏类型的输入字段，以实现隐藏字段提交

## 0.6.3

### Patch Changes

- 4ef0c95: 升级 Next 到 v16

## 0.6.2

### Patch Changes

- c78f1db: 对话消息中的文件卡片和表格样式优化

## 0.6.1

### Patch Changes

- 661dae5: 修复 Docker 部署环境刷新应用详情页时加载 env.js 失败导致页面报错的问题

## 0.6.0

### Minor Changes

- 895900a: 支持 Docker 容器化部署

### Patch Changes

- 6fdb311: 对消息进行点踩时，支持填写原因

## 0.5.5

### Patch Changes

- 0dafb64: - 文本生成应用支持一键复制生成结果
  - Platform 夜间模式下的登录页样式优化
  - 修复消息列表内容较少时从底部而不是顶部开始展示的问题
  - 修复回复过程中没有随内容更新自动滚动到底部的问题

## 0.5.0

## 0.4.0

### Minor Changes

- b9e8b63: 修复 `useIsMobile` 在 Next.js 编译场景下会因 useResponsive 返回 undefined 导致报错的问题
- a415147: 新增 Next.js MVP 版本, 以及文档站点子包

## 0.3.0

## 0.2.0

## 0.1.0

### Minor Changes

- a750bf4: MVP 版本
