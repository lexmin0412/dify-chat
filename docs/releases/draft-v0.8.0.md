# v0.8.0

> 发布时间：2026-06-06

v0.8.0 是一次大版本升级，核心变化：合并多子包为单一 Next.js 应用，从 Prisma 迁移至 Drizzle ORM，新增 HITL 人工干预支持。项目已正式更名为 **Dify App Hub**。

如果你是 Docker 用户，镜像名更新为 `lexmin0412/dify-app-hub:latest`。

---

## 💥 破坏性变更

### 项目重命名 & 结构变化

- **项目重命名**：`dify-chat` → `dify-app-hub`，Docker 镜像同步变更
- **子包合并**：`packages/react-app`（SPA）和 `packages/platform`（Next.js）已合并为根目录单一 Next.js 应用，所有代码直接位于项目根目录
- **npm 包废弃**：`@dify-chat/api`、`@dify-chat/core`、`@dify-chat/components` 等不再独立发布，代码已合并到主应用内

### 数据库 & 状态管理

- **ORM 迁移**：Prisma → Drizzle ORM 1.x，启动时不再需要安装 Prisma CLI。旧数据库会自动迁移，无需手动操作
- **状态管理重构**：React Context → Zustand，消除跨组件更新警告和冗余渲染

### 移除的功能

- **调试模式**：移除 debug-mode 组件及 `PUBLIC_DEBUG_MODE` 配置

---

## 从 v0.7.x 升级

> ⚠️ 升级前请**备份数据库**。本次涉及 ORM 迁移和 Schema 变更，请确保数据安全后再操作。

完整迁移指引详见：[从 v0.7.x 迁移到 v0.8.0](https://lexmin0412.github.io/dify-app-hub-docs/guide/migrate/from_v0.7.0.html)

### Docker 用户

```bash
docker pull lexmin0412/dify-app-hub:v0.8.0
# 更新 docker-compose.yml 中的镜像名为 lexmin0412/dify-app-hub:v0.8.0
# 重新启动后数据库迁移自动执行
docker compose up -d
```

### 源码用户

```bash
git checkout main && git pull
# 项目结构已变，直接安装依赖即可
pnpm install
# 执行数据库迁移
pnpm --filter dify-app-hub db:migrate
# 构建并启动
pnpm build:app && pnpm start
```

---

## 🌟 新功能

- **人工干预（HITL）**：工作流运行到人工干预节点时自动暂停，在聊天界面中展示表单等待用户填写后继续执行。Close #443
- **宽屏模式**：新增一键切换按钮，充分利用大屏幕空间。Close #381
- **思考时间持久化**：思考耗时通过 IndexedDB 持久化，刷新页面后不再丢失。Close #353
- **初始化邮箱预填**：初始化设置的邮箱自动带入登录页。Close #442
- **Workflow 数据持久化**：使用 IndexedDB 存储工作流节点数据，刷新后保留
- **多架构 Docker 镜像**：同时构建 linux/amd64 + linux/arm64 镜像

---

## ❤️ 体验优化

- 欢迎卡片适配宽屏布局，移除 AI 消息宽度限制
- Workflow 日志复制按钮 hover 显示，移至卡片右下角减少遮挡
- 升级 `@ant-design/x` 到 v2，流式渲染更流畅

---

## 🐛 问题修复

- 修复图片标签格式错误导致图片无法展示。Close #316
- 修复录音功能：Dify 拒绝 audio/webm 格式及虚拟麦克风选中导致无声音。Close #366
- 修复切换会话时历史未正确清除。Close #379
- 修复 localStorage 不可用时应用白屏（自动降级到内存存储）
- 修复 `<think>` 块在多块场景下识别不全及嵌套格式（`<details>`）兼容
- 修复 `updated_at` 列缺默认值导致插入失败
- 修复反馈 API 路由非 JSON 响应异常
- 修复 HITL 重连时节点状态丢失
- 修复深色模式仅部分元素生效
- 修复 useAuth 初始化时 user 为 null 导致的闪烁
- 修复 Dify API 代理未透传上游错误状态码
- 修复 SSR 下 localStorage 报错
- 修复用户端页面空白及 API 路径错误
- 修复 emoji 简码未转为原生符号

---

## 🧱 开发体验 & 依赖升级

- 消除全部 TypeScript 类型错误
- 扁平化 `lib/`，清除死代码和冗余 barrel 导出
- 重构 Dockerfile，抽取公共基础镜像层加速构建
- 统一 Tailwind CSS v4，清理 v3 残留配置
- 移除 ESLint/Prettier/Biome 等残留 lint 配置
- 移除 `@changesets/cli`（不再发布 npm 包，Release Notes 改为手动维护）
- 引入 OpenSSF Scorecard + CodeQL 自动化扫描，补充 CONTRIBUTING.md、SECURITY.md、CODE_OF_CONDUCT
- 依赖升级：Ant Design 6.0.0 → 6.4.3，React 19.2.3 → 19.2.6 等

---

**Full Changelog**: https://github.com/lexmin0412/dify-app-hub/compare/v0.7.1...v0.8.0
