# Prisma → Drizzle ORM 1.x 迁移设计

> **目标**：将 `web/` 包从 Prisma ORM v7 迁移到 Drizzle ORM 1.x（RC），零数据库结构变更，零数据丢失，零用户感知。

## 关键决策

| 决策 | 选择 |
| --- | --- |
| Drizzle 版本 | `drizzle-orm@1.0.0-rc.x`（锁定具体 rc 版本号，不用 `@rc` 浮标），`drizzle-kit@1.0.0-rc.x` |
| MySQL 驱动 | `mysql2`（原生兼容 MariaDB） |
| Auth 适配器 | **不用**。当前已用 `CredentialsProvider` + JWT strategy，`authorize` 回调自行查库。直接删除 `PrismaAdapter`，无需 `@auth/drizzle-adapter` |
| Schema 组织 | 按表拆分：`db/schema/apps.ts` + `db/schema/users.ts` + `db/schema/index.ts` |
| 迁移方式 | 一步到位：一次性替换所有 Prisma 代码，删除旧文件 |
| 迁移命令 | 仅保留 `generate` + `migrate`，禁止 `push`（防止静默覆盖数据） |
| `_prisma_migrations` 表 | 删除 |
| `tags` 字段存储 | 保持现状，继续用 JSON 字符串 + 手动序列化 |
| 仓库层 | 直接替换实现，不保留 Prisma 副本 |

## 文件变更全景

```
新建：
  web/db/schema/apps.ts               — DifyApp 表定义
  web/db/schema/users.ts              — User 表定义
  web/db/schema/index.ts              — barrel 导出
  web/db/index.ts                      — Drizzle 客户端单例（替代 lib/prisma.ts）
  web/drizzle.config.ts                — drizzle-kit 配置

修改：
  web/lib/auth.ts                      — 删除 PrismaAdapter；authorize 中 prisma. → db.
  web/lib/db/types.ts                  — DifyApp 类型从 Prisma → Drizzle 推断
  web/repository/app.ts                — 委托目标 prisma → drizzle
  web/app/api/health/route.ts          — $queryRaw → db.execute(sql)
  web/app/api/init/route.ts            — user.count/create → drizzle
  web/app/api/init/status/route.ts     — 同上
  web/app/api/users/route.ts           — findMany/create → drizzle
  web/app/api/users/[id]/route.ts      — findUnique/update/delete → drizzle
  web/scripts/create-admin.ts          — prisma.user. → db.
  web/package.json                     — deps + scripts
  package.json                         — 删除失效的 build:pkgs
  AGENTS.md                            — 新增数据库迁移章节

移动（改名）：
  web/prisma/seed.ts → web/db/seed.ts

删除：
  web/prisma/                           — 整个目录（schema/migrations/templates/generated）
  web/prisma.config.ts
  web/lib/prisma.ts
  web/repository/prisma/                — 整个目录
```

## 各层设计

### 1. Schema 层（`web/db/schema/`）

由 `drizzle-kit introspect` 从现有 MySQL 数据库生成初始 schema，确保列名、类型、约束与 Prisma 定义一致。生成后人工检查并整理文件名。

**`db/schema/apps.ts`**：

```
表: dify_apps
  id: varchar(25), primaryKey, default(cuid)
  name: varchar(255), notNull
  mode: varchar(50)
  description: text
  tags: text                         — JSON 字符串，和 Prisma 一致
  is_enabled: int, default(1)
  api_base: varchar(500), notNull
  api_key: varchar(255), notNull
  enable_answer_form: boolean, default(false)
  answer_form_feedback_text: text
  enable_update_input_after_starts: boolean, default(false)
  opening_statement_display_mode: varchar(20)
  enable_annotation: boolean, default(false)
  created_at: timestamp, defaultNow
  updated_at: timestamp, onUpdate
```

**`db/schema/users.ts`**：

```
表: users
  id: varchar(25), primaryKey, default(cuid)
  name: varchar(255)
  email: varchar(255), unique, notNull
  password: varchar(255), notNull
  created_at: timestamp, defaultNow
  updated_at: timestamp, onUpdate
```

**`db/schema/index.ts`**：

```ts
export * from './apps'
export * from './users'
```

两表之间**不定义关系**，与 Prisma 行为一致。

### 2. 客户端层（`web/db/index.ts`）

替代 `web/lib/prisma.ts`，逻辑对应：

```
Prisma 单例模式              → Drizzle 等价
─────────────────────────────────────────
parse DATABASE_URL           → 同逻辑
PrismaMariaDb adapter        → mysql2 createPool
PrismaClient({ adapter })    → drizzle(pool, { schema })
globalThis 单例（开发）       → 同上
Next.js build 安全            → 同样的 throwing proxy 模式
log: ['query']               → drizzle logger: true
getPrisma() → getDb()        → 同名函数签名
```

### 3. 类型转换层（`web/lib/db/types.ts`）

改变前：

```ts
import { DifyApp } from '@/prisma/generated/client'
```

改变后：

```ts
import { difyApps } from '@/db/schema'
type DifyApp = typeof difyApps.$inferSelect
type DifyAppInsert = typeof difyApps.$inferInsert
```

`dbAppToAppItem`、`appItemToDbApp`、`appItemToDbAppUpdate` 三个函数逻辑不变，只改类型来源。

### 4. 仓库层（`web/repository/app.ts`）

当前委托到 `./prisma/app`。改为直接写入或委托到 `../db/repository`。5 个函数签名不变：

| 函数 | Drizzle 查询 |
| --- | --- |
| `getAppList()` | `db.select().from(difyApps).orderBy(desc(difyApps.createdAt))` |
| `getAppItem(id)` | `db.select().from(difyApps).where(eq(difyApps.id, id)).limit(1)` |
| `addApp(app)` | `db.insert(difyApps).values(...)` + `db.select()` 查回完整行 |
| `updateApp(app)` | `db.update(difyApps).set(...).where(eq(difyApps.id, id))` + `db.select()` 查回完整行 |
| `deleteApp(id)` | `db.delete(difyApps).where(eq(difyApps.id, id))` |

`addApp`/`updateApp` 使用 `.returning()` 返回完整行，替代 `.create()` / `.update()` 的返回值行为。

### 5. Auth 层（`web/lib/auth.ts`）

两处修改：

1. 删除 `import { PrismaAdapter } from '@auth/prisma-adapter'`
2. 删除 `adapter: PrismaAdapter(getPrisma() as any),`
3. `authorize` 回调中 `prisma.user.findUnique` → `db.select().from(users).where(eq(users.email, email)).limit(1)`

`CredentialsProvider` + `strategy: 'jwt'` 本身不需要 adapter，删除后功能不受影响。

### 6. API 路由层

| 路由 | Prisma 操作 | Drizzle 等价 |
| --- | --- | --- |
| `health` GET | `$queryRaw\`SELECT 1\`` | `db.execute(sql\`SELECT 1\`)` |
| `init/status` GET | `user.count()` | `db.select({ count: count() }).from(users)` |
| `init` POST | `user.count()` + `user.create()` | 同上 + `db.insert(users).values(...)` |
| `users` GET | `user.findMany({ select })` | `db.select({...}).from(users).orderBy(...)` |
| `users` POST | `user.findUnique` + `user.create({ select })` | `eq` + `insert` |
| `users/[id]` PUT | `user.findUnique` + `user.update({ select })` | `eq` + `update` |
| `users/[id]` DELETE | `user.findUnique` + `user.delete()` | `eq` + `delete` |

所有 API 出入参不变。

### 7. 脚本层

**`web/db/seed.ts`**（从 `web/prisma/seed.ts` 改名迁移）：

```
prisma.difyApp.create → db.insert(difyApps).values()
prisma.$disconnect()  → await db.$client.end()
```

**`web/scripts/create-admin.ts`**：

```
prisma.user.findUnique → db.select().from(users).where(eq(users.email, email))
prisma.user.create     → db.insert(users).values(...)
prisma.$disconnect()   → await db.$client.end()
```

### 8. `web/package.json` 变更

**移除依赖**：

```
@prisma/client, prisma, @prisma/adapter-mariadb, @auth/prisma-adapter
```

**新增依赖**：

```
drizzle-orm@1.0.0-rc.x, drizzle-kit@1.0.0-rc.x (devDep), mysql2
```

**scripts 变更**：

```
- db:generate, db:push, db:migrate, db:studio, db:seed, db:init, db:switch*
- postinstall (不再需要 prisma generate)
+ db:generate    → drizzle-kit generate    # 生成 SQL 迁移文件（可 review）
+ db:migrate     → drizzle-kit migrate     # 执行迁移
+ db:studio      → drizzle-kit studio      # 可视化
+ db:seed        → tsx db/seed.ts
```

**⚠️ 不提供 `db:push` 命令**。`drizzle-kit push` 会直接修改数据库结构，可能静默删除数据。所有 schema 变更必须走 `generate → review → migrate` 流程。

### 9. 根 `package.json` 变更

删除 `build:pkgs` 脚本（`pnpm --filter @dify-chat/* build`）。`packages/*` 目录已空，该脚本无作用。

### 10. AGENTS.md 新增章节

在文件末尾追加「数据库迁移」章节：

```markdown
## 数据库迁移

本项目使用 Drizzle ORM + drizzle-kit 管理数据库迁移。

**变更流程**：

1. 修改 `web/db/schema/*.ts` 中的表定义
2. 运行 `pnpm --filter dify-chat-platform db:generate` 生成迁移 SQL
3. Review 生成的 `web/db/migrations/` 中的 SQL 文件
4. 确认无误后运行 `pnpm --filter dify-chat-platform db:migrate` 执行

**🚫 禁止 `drizzle-kit push`**：该命令会直接修改数据库结构而不生成可 review 的 SQL 文件。如果 schema 与数据库不一致，可能静默 drop 列或表，导致数据丢失。

**迁移文件**：存放在 `web/db/migrations/` 目录，应纳入 git 版本控制。
```

## 执行顺序

1. 安装 `drizzle-orm@1.0.0-rc.x` `drizzle-kit@1.0.0-rc.x` `mysql2`，创建 `drizzle.config.ts`
2. `drizzle-kit introspect --init` 从现有 DB 生成 schema
3. 整理生成的 schema 文件为 `db/schema/apps.ts` + `db/schema/users.ts` + `db/schema/index.ts`
4. 创建 `web/db/index.ts`（Drizzle 客户端单例）
5. 更新 `web/lib/db/types.ts`（类型来源）
6. 重写 `web/repository/app.ts`
7. 修改 `web/lib/auth.ts`（删除 adapter）
8. 修改 5 个 API 路由
9. 移动并改写 `seed.ts`、`create-admin.ts`
10. 更新 `web/package.json` deps + scripts
11. 更新根 `package.json`
12. 更新 `AGENTS.md`
13. 删除 Prisma 旧文件
14. `pnpm install`

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| `drizzle-kit introspect` 生成的列类型不匹配 | 生成后逐列对比 `schema.prisma`，必要时手动调整 |
| Drizzle 1.x RC 不稳定 | 锁定具体 rc 版本号（非 `@rc` 标签），CI 验证通过后再升级 |
| Auth JWT 中缺少用户信息 | `authorize` 回调已在 `token` 中正确设置 `id`，不依赖 adapter |
| `tags` JSON 序列化行为变化 | 保持 `text` 列 + 手动 `JSON.parse/stringify`，和 Prisma 行为完全一致 |
| Insert/Update 返回值结构不同 | 在 repo 层通过额外 `select` 补全，确保对外接口不变 |
