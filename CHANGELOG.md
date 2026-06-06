# dify-app-hub

## 0.8.0

### Major Changes

- **项目重命名**：`dify-chat` → `dify-app-hub`，Docker 镜像同步变更
- **子包合并**：合并 `packages/react-app`（SPA）和 `packages/platform`（Next.js）为根目录单一 Next.js 应用
- **npm 包废弃**：`@dify-chat/api`、`@dify-chat/core`、`@dify-chat/components` 等不再独立发布，代码已合并到主应用内
- **ORM 迁移**：Prisma → Drizzle ORM 1.x
- **状态管理重构**：React Context → Zustand
- **移除调试模式**：移除 debug-mode 组件及相关配置

### Minor Changes

- 新增人工干预（HITL）支持 Workflow 暂停等待人工输入。Close #443
- 新增宽屏模式切换按钮。Close #381
- 思考时间跨会话持久化。Close #353
- 初始化邮箱自动带入登录页。Close #442
- 使用 IndexedDB 存储 Workflow 数据
- Docker 构建支持多架构（linux/amd64 + linux/arm64）

### Patch Changes

- 修复图片标签格式错误导致图片无法展示。Close #316
- 修复录音功能：Dify 拒绝 audio/webm 格式及虚拟麦克风选中导致无声音。Close #366
- 修复切换会话时历史未正确清除。Close #379
- 修复 localStorage 不可用时应用白屏
- 修复 `<think>` 块在多块场景下识别不全
- 修复 `updated_at` 列缺默认值导致插入失败
- 修复反馈 API 路由非 JSON 响应异常
- 修复 HITL 重连时节点状态丢失
- 修复深色模式仅部分元素生效
- 修复 useAuth 初始化时 user 为 null 导致的闪烁
- 修复 Dify API 代理未透传上游错误状态码
- 修复 SSR 下 localStorage 报错
- 修复用户端页面空白及 API 路径错误
- 修复 emoji 简码未转为原生符号

## 0.7.1

### Patch Changes

- 4a60cf1: 移除 dotenv, 精简 prisma 初始化迁移流程
- Updated dependencies [4a60cf1]
  - @dify-chat/api@0.7.1
  - @dify-chat/components@0.7.1
  - @dify-chat/core@0.7.1
  - @dify-chat/helpers@0.7.1
  - @dify-chat/theme@0.7.1

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

### Patch Changes

- Updated dependencies [20b4668]
  - @dify-chat/api@0.7.0
  - @dify-chat/components@0.7.0
  - @dify-chat/core@0.7.0
  - @dify-chat/helpers@0.7.0
  - @dify-chat/theme@0.7.0

## 0.6.9

### Patch Changes

- d87bc7a: AI回复过程中支持阻止自动滚动
- Updated dependencies [d87bc7a]
  - @dify-chat/api@0.6.9
  - @dify-chat/components@0.6.9
  - @dify-chat/core@0.6.9
  - @dify-chat/helpers@0.6.9
  - @dify-chat/theme@0.6.9

## 0.6.8

### Patch Changes

- 70b38ad: 修复安全漏洞 CVE-2025-55183 和 CVE-2025-55184
- Updated dependencies [70b38ad]
  - @dify-chat/api@0.6.8
  - @dify-chat/components@0.6.8
  - @dify-chat/core@0.6.8
  - @dify-chat/helpers@0.6.8
  - @dify-chat/theme@0.6.8

## 0.6.7

### Patch Changes

- 4e62081: 修复安全漏洞(CVE-2025-55182)
- Updated dependencies [4e62081]
  - @dify-chat/api@0.6.7
  - @dify-chat/components@0.6.7
  - @dify-chat/core@0.6.7
  - @dify-chat/helpers@0.6.7
  - @dify-chat/theme@0.6.7

## 0.6.6

### Patch Changes

- 09188ff: - 修复侧边栏收起时可无限添加新对话的问题
  - 优化移动端和小屏下的响应式布局
- Updated dependencies [09188ff]
  - @dify-chat/api@0.6.6
  - @dify-chat/components@0.6.6
  - @dify-chat/core@0.6.6
  - @dify-chat/helpers@0.6.6
  - @dify-chat/theme@0.6.6

## 0.6.5

### Patch Changes

- e74d395: 对话输入参数组件优化: 修复多文件组件跨对话切换时没有清空的问题, 并重构渲染组件和 Dify 接口返回字段的映射逻辑
- Updated dependencies [e74d395]
  - @dify-chat/api@0.6.5
  - @dify-chat/components@0.6.5
  - @dify-chat/core@0.6.5
  - @dify-chat/helpers@0.6.5
  - @dify-chat/theme@0.6.5

## 0.6.4

### Patch Changes

- 2291d88: 回复表单时支持隐藏类型的输入字段，以实现隐藏字段提交
- Updated dependencies [2291d88]
  - @dify-chat/api@0.6.4
  - @dify-chat/components@0.6.4
  - @dify-chat/core@0.6.4
  - @dify-chat/helpers@0.6.4
  - @dify-chat/theme@0.6.4

## 0.6.3

### Patch Changes

- 4ef0c95: 升级 Next 到 v16
- Updated dependencies [4ef0c95]
  - @dify-chat/api@0.6.3
  - @dify-chat/components@0.6.3
  - @dify-chat/core@0.6.3
  - @dify-chat/helpers@0.6.3
  - @dify-chat/theme@0.6.3

## 0.6.2

### Patch Changes

- c78f1db: 对话消息中的文件卡片和表格样式优化
- Updated dependencies [c78f1db]
  - @dify-chat/api@0.6.2
  - @dify-chat/components@0.6.2
  - @dify-chat/core@0.6.2
  - @dify-chat/helpers@0.6.2
  - @dify-chat/theme@0.6.2

## 0.6.1

### Patch Changes

- 661dae5: 修复 Docker 部署环境刷新应用详情页时加载 env.js 失败导致页面报错的问题
- Updated dependencies [661dae5]
  - @dify-chat/api@0.6.1
  - @dify-chat/components@0.6.1
  - @dify-chat/core@0.6.1
  - @dify-chat/helpers@0.6.1
  - @dify-chat/theme@0.6.1

## 0.6.0

### Minor Changes

- 895900a: 支持 Docker 容器化部署

### Patch Changes

- 6fdb311: 对消息进行点踩时，支持填写原因
- Updated dependencies [895900a]
- Updated dependencies [6fdb311]
  - @dify-chat/api@0.6.0
  - @dify-chat/components@0.6.0
  - @dify-chat/core@0.6.0
  - @dify-chat/helpers@0.6.0
  - @dify-chat/theme@0.6.0

## 0.5.5

### Patch Changes

- 0dafb64: - 文本生成应用支持一键复制生成结果
  - Platform 夜间模式下的登录页样式优化
  - 修复消息列表内容较少时从底部而不是顶部开始展示的问题
  - 修复回复过程中没有随内容更新自动滚动到底部的问题
- Updated dependencies [0dafb64]
  - @dify-chat/api@0.5.5
  - @dify-chat/components@0.5.5
  - @dify-chat/core@0.5.5
  - @dify-chat/helpers@0.5.5
  - @dify-chat/theme@0.5.5

## 0.5.0

### Minor Changes

- b157251: 新增 Platform 应用

### Patch Changes

- Updated dependencies [c000dd6]
- Updated dependencies [dd66d67]
- Updated dependencies [2cd396f]
- Updated dependencies [98ae25e]
  - @dify-chat/components@0.5.0
  - @dify-chat/api@0.5.0
  - @dify-chat/core@0.5.0
  - @dify-chat/helpers@0.5.0
  - @dify-chat/theme@0.5.0
