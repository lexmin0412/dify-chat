# AGENTS Guidelines for This Repository

## 仓库概览

Dify Chat 是一个基于 pnpm workspace 构建的 Monorepo 项目，当前包含以下部分：

- **web/** — 平台主应用 (dify-chat-platform)，基于 Next.js 16 App Router 模式。集成了 Dify API 代理、应用配置管理、用户认证、数据库交互等功能。前身是独立的 platform + react-app 两个子包，现已合并。
- **packages/docs/** — 文档站点 (dify-chat-docs)，基于 Rspress 构建。

> 以下软件包已从本地 workspace 中移出，转而作为 npm 包 (`@dify-chat/*`) 发布和维护：
>
> - `@dify-chat/api` — Dify API 的 Node.js 客户端库
> - `@dify-chat/core` — 核心抽象逻辑
> - `@dify-chat/helpers` — 辅助工具函数
> - `@dify-chat/theme` — 主题相关组件/样式
> - `@dify-chat/components` — **已废弃**，不再维护
>
> 这些 npm 包在 `web/` 中作为外部依赖引入。如需修改这些包的代码，请前往对应 npm 包的源仓库操作。

## 项目结构

```
web/                        # 主应用 (dify-chat-platform)
├── app/                    # Next.js App Router 页面与 API 路由
│   ├── (user)/             # 用户端页面 (apps, auth, chat)
│   ├── api/                # API 路由 (代理 Dify API)
│   ├── app-management/     # 应用管理页面
│   ├── user-management/    # 用户管理页面
│   ├── login/              # 登录页面
│   └── init/               # 初始化/设置页面
├── components/             # UI 组件 (auth, chat, layout, shared, ui)
├── lib/
│   ├── api/                # Dify API 客户端封装
│   ├── core/               # 核心业务逻辑 (store, repository, types)
│   ├── helpers/            # 工具函数 (base-request, gzip, id, localstorage)
│   └── theme/              # 主题系统
├── db/                     # 数据库层 (Drizzle ORM schema, migrations)
├── hooks/                  # 自定义 React hooks
├── services/               # 服务层
├── repository/             # 数据仓库层
├── types/                  # TypeScript 类型定义
└── config/                 # 应用配置

packages/docs/              # Rspress 文档站点 (dify-chat-docs)
├── docs/                   # 文档源文件 (多版本: Latest, v0.6.x, v0.5.x, v0.4.x)
└── rspress.config.ts       # Rspress 配置
```

## 依赖管理

- 依赖版本直接在各自 `package.json` 中定义
- 根目录 `pnpm-workspace.yaml` 管理 workspace 成员和 overrides
- 安装/更新依赖：在项目根目录运行 `pnpm install`
- `web/` 的依赖通过 npm registry 安装；`packages/docs/` 的依赖同理

## 样式处理

`web/` 主应用使用 Tailwind CSS v4，配置在：

- `web/postcss.config.mjs` — PostCSS 集成
- `web/tailwindcss` (devDependency) — v4，直接在 `package.json` 中定义版本

## 开发调试

在进行代码变更之后，**你不需要**尝试启动开发服务器来验证修改是否生效，因为此应用所有的页面都有登录校验，在你变更代码之后我会自行验证。

### 调试准则：两轮无效则取证

排查 bug 时，如果基于代码推理的修复在 **两轮** 内仍不生效，立即停止继续猜测，转而收集真实数据。**先判断问题属于哪一类，再选择对应的取证手段：**

**A. 数据/状态问题**（数据丢了、没更新、传错了）：

1. **localStorage / Zustand 持久化数据** — `localStorage.getItem()` 或 `useXxxStore.getState()`，查看运行时状态，对比"应该是"vs"实际是"
2. **网络请求** — `list_network_requests` + `get_network_request`，确认 API 实际返回了什么、事件流的顺序和内容
3. **控制台日志** — `list_console_messages`，查找报错或异常日志

**B. UI/渲染问题**（数据对但显示不对）：

1. **DOM 快照** — Chrome MCP `take_snapshot`，确认组件树和可见文本
2. **DOM 样式检查** — `evaluate_script` 读取 `getComputedStyle()`，验证具体 CSS 值
3. **截图对比** — `take_screenshot`，肉眼确认视觉差异

**原则**：代码告诉你"理论上应该怎样"，浏览器告诉你"实际上怎样"。两者矛盾时，信浏览器。修复之后，**必须用浏览器真实数据验证效果**，不得仅凭代码推理宣告完成。API 问题和 UI 问题要分开验证——数据对了不代表显示对了，反之亦然。

## 数据库迁移

本项目使用 Drizzle ORM + drizzle-kit 管理数据库迁移。

**变更流程**：

1. 修改 `web/db/schema/*.ts` 中的表定义
2. 运行 `pnpm --filter dify-chat-platform db:generate` 生成迁移 SQL
3. Review 生成的 `web/db/migrations/` 中的 SQL 文件
4. 确认无误后运行 `pnpm --filter dify-chat-platform db:migrate` 执行

**🚫 禁止 `drizzle-kit push`**：该命令会直接修改数据库结构而不生成可 review 的 SQL 文件，可能导致数据丢失。

**迁移文件**：存放在 `web/db/migrations/` 目录，应纳入 git 版本控制。

## 项目成熟度追踪

本项目使用 OpenSSF 标准进行项目成熟度评估：

- **自动化扫描**：`.github/workflows/scorecard.yml` 每周自动运行 OpenSSF Scorecard，结果推送到 GitHub Security 面板和 [公开 API](https://api.scorecard.dev/projects/github.com/lexmin0412/dify-chat)。
- **人工自评**：`.cii-assessment.md` 基于 CII Best Practices（通过级）35 项标准，记录每项的证据和差距。

### 代码变更前必须重新评估

在用户明确要求提交代码之前，**必须**做以下操作：

1. 审视本次代码变更，判断哪些项的状态发生了变化
2. 更新 `.cii-assessment.md` 对应项的状态（✅/⚠️/❌）
3. 更新文件底部的「变更记录」表格，记录本次变更内容
4. **单独提交** `.cii-assessment.md` 的变更，不要与业务代码改动混在同一个 commit 中

例如：本次添加了 `CONTRIBUTING.md`，则应更新 #2（改为 ✅ 并填写证据链接）、#13（改为 ✅），并在变更记录中加一行，然后单独 `git commit -m "docs: update CII assessment"` 。
