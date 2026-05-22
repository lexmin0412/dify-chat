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

## 数据库迁移

本项目使用 Drizzle ORM + drizzle-kit 管理数据库迁移。

**变更流程**：

1. 修改 `web/db/schema/*.ts` 中的表定义
2. 运行 `pnpm --filter dify-chat-platform db:generate` 生成迁移 SQL
3. Review 生成的 `web/db/migrations/` 中的 SQL 文件
4. 确认无误后运行 `pnpm --filter dify-chat-platform db:migrate` 执行

**🚫 禁止 `drizzle-kit push`**：该命令会直接修改数据库结构而不生成可 review 的 SQL 文件，可能导致数据丢失。

**迁移文件**：存放在 `web/db/migrations/` 目录，应纳入 git 版本控制。
