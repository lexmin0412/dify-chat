### 🌟 新功能

- 新增人工干预（HITL）支持 Workflow 暂停等待人工输入
- 新增宽屏模式切换按钮 Close #381
- 思考时间跨会话持久化 Close #353
- 初始化邮箱自动带入登录页 Close #442
- 使用 IndexedDB 存储 Workflow 数据

### 💥 破坏性变更

- 数据库 ORM 从 Prisma 迁移至 Drizzle ORM 1.x
- 删除 `packages/react-app` 子包及 `@dify-chat/*` 所有 npm 包
- 状态管理从 React Context 迁移至 Zustand
- 移除调试模式（debug-mode 组件及相关配置）

### 🐛 问题修复

- 修复图片标签格式错误导致图片无法展示 Close #316
- 修复 localStorage 不可用时应用白屏
- 修复 `<think>` 块在多块场景下识别不全
- 修复切换会话时历史未正确清除
- 修复 `updated_at` 列缺默认值导致插入失败
- 修复反馈 API 路由非 JSON 响应异常
- 修复 HITL 重连时节点状态丢失
- 修复深色模式仅部分元素生效
- 修复 useAuth 初始化时 user 为 null 导致闪烁
- 修复 Dify API 代理未透传上游错误状态码
- 修复 SSR 下 localStorage 报错
- 修复用户端页面空白及 API 路径错误
- 修复 emoji 简码未转为原生符号

### ❤️ 用户体验优化

- Workflow 复制按钮 hover 显示，移至右下角
- 欢迎卡片适配宽屏，移除 AI 消息宽度限制
- 升级 `@ant-design/x` 到 v2，优化流式渲染

### 🧱 开发体验优化&基础依赖升级

- 数据库 ORM 从 Prisma 迁移至 Drizzle 1.x
- 扁平化 `web/lib/`，清除死代码
- 重构 Dockerfile 抽取公共基础镜像
- 消除全部 TypeScript 类型错误
- 移除 ESLint/Prettier 等残留配置

**Full Changelog**: https://github.com/lexmin0412/dify-chat/compare/v0.7.1...v0.8.0
