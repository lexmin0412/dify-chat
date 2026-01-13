---
'@dify-chat/api': minor
'@dify-chat/components': minor
'@dify-chat/core': minor
'dify-chat-docs': minor
'@dify-chat/helpers': minor
'dify-chat-platform': minor
'dify-chat-app-react': minor
'@dify-chat/theme': minor
---

### v0.7.0

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
