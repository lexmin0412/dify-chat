# Prisma → Drizzle ORM 1.x 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `web/` 包从 Prisma ORM v7 迁移到 Drizzle ORM 1.x（RC），零数据丢失，零用户感知

**Architecture:** 用 `drizzle-kit introspect` 从现有 MySQL 生成 Drizzle schema → 创建客户端单例 → 逐层替换 Prisma 调用 → 删除旧文件。14 个任务，按依赖顺序执行

**Tech Stack:** Drizzle ORM 1.0.0-rc.x, drizzle-kit 1.0.0-rc.x, mysql2, Next.js 16, TypeScript 5.9

---

### 文件变更总览

```
新建:
  web/drizzle.config.ts
  web/db/schema/apps.ts       (由 introspect 生成后整理)
  web/db/schema/users.ts      (由 introspect 生成后整理)
  web/db/schema/index.ts
  web/db/index.ts

修改:
  web/lib/db/types.ts
  web/lib/auth.ts
  web/repository/app.ts
  web/app/api/health/route.ts
  web/app/api/init/route.ts
  web/app/api/init/status/route.ts
  web/app/api/users/route.ts
  web/app/api/users/[id]/route.ts
  web/scripts/create-admin.ts
  web/package.json
  package.json
  AGENTS.md

移动:
  web/prisma/seed.ts → web/db/seed.ts

删除:
  web/prisma/ (整个目录)
  web/prisma.config.ts
  web/lib/prisma.ts
  web/repository/prisma/ (整个目录)
```

---

### Task 1: 安装依赖 + 创建 drizzle.config.ts

**Files:**

- Modify: `web/package.json`
- Create: `web/drizzle.config.ts`

- [ ] **Step 1: 安装 Drizzle ORM 1.x RC 依赖**

```bash
cd web && pnpm add drizzle-orm@1.0.0-rc.3 mysql2 && pnpm add -D drizzle-kit@1.0.0-rc.3
```

Expected: 三个包安装成功，`web/package.json` 的 `dependencies` 和 `devDependencies` 中分别出现新条目

- [ ] **Step 2: 创建 drizzle.config.ts**

```ts
// web/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'mysql',
	schema: './db/schema/index.ts',
	out: './db/migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
```

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/pnpm-lock.yaml web/drizzle.config.ts
git commit -m "chore: install Drizzle ORM 1.x RC deps, add drizzle.config.ts"
```

---

### Task 2: Introspect 生成 Schema

**Files:**

- Create: `web/db/schema/` (由 introspect 生成)
- Create: `web/db/migrations/` (由 `--init` 生成)

- [ ] **Step 1: 确保 DATABASE_URL 可访问**

```bash
cd web && grep DATABASE_URL .env
```

Expected: 显示 MySQL 连接字符串

- [ ] **Step 2: 创建临时 .env（drizzle-kit 需要）**

如果 `web/.env` 不存在，创建它：

```bash
cd web && test -f .env || echo 'DATABASE_URL=mysql://root:password@localhost:3306/dify-chat' > .env
```

- [ ] **Step 3: 运行 introspect**

```bash
cd web && npx drizzle-kit introspect
```

Expected: 在 `web/db/schema/` 生成 `0000_*.sql` 和 `schema.ts`，在 `web/db/` 生成 `relations.ts`

- [ ] **Step 4: Commit 原始生成结果**

```bash
git add web/db/
git commit -m "chore: drizzle-kit introspect 原始生成 schema"
```

---

### Task 3: 整理 Schema 文件

**Files:**

- Create: `web/db/schema/apps.ts`
- Create: `web/db/schema/users.ts`
- Create: `web/db/schema/index.ts`
- Delete: `web/db/relations.ts`（两表无关系，不需要）
- Modify: `web/db/schema.ts`（如果 introspect 生成了，拆分为 apps/users）

- [ ] **Step 1: 检查 introspect 生成的 schema 文件结构**

```bash
ls -la web/db/schema/
cat web/db/schema.ts 2>/dev/null || echo "no schema.ts"
```

- [ ] **Step 2: 创建 `web/db/schema/apps.ts`**

根据 schema.prisma 的 `DifyApp` 模型和 introspect 生成的实际列定义，手动整理为：

```ts
// web/db/schema/apps.ts
import { mysqlTable, varchar, int, boolean, text, timestamp } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const difyApps = mysqlTable('dify_apps', {
	id: varchar('id', { length: 25 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	mode: varchar('mode', { length: 50 }),
	description: text('description'),
	tags: text('tags'),
	isEnabled: int('is_enabled').default(1),
	apiBase: varchar('api_base', { length: 500 }).notNull(),
	apiKey: varchar('api_key', { length: 255 }).notNull(),
	enableAnswerForm: boolean('enable_answer_form').default(false),
	answerFormFeedbackText: text('answer_form_feedback_text'),
	enableUpdateInputAfterStarts: boolean('enable_update_input_after_starts').default(false),
	openingStatementDisplayMode: varchar('opening_statement_display_mode', { length: 20 }),
	enableAnnotation: boolean('enable_annotation').default(false),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})
```

**注意**：列名和类型必须与 introspect 生成的一致。如果 introspect 生成的类型不同（如 `varchar` 的 length 不同），以 introspect 为准。

- [ ] **Step 3: 创建 `web/db/schema/users.ts`**

```ts
// web/db/schema/users.ts
import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const users = mysqlTable('users', {
	id: varchar('id', { length: 25 }).primaryKey(),
	name: varchar('name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})
```

- [ ] **Step 4: 创建 `web/db/schema/index.ts`**

```ts
// web/db/schema/index.ts
export { difyApps } from './apps'
export { users } from './users'
```

- [ ] **Step 5: 删除不需要的文件**

```bash
rm -f web/db/relations.ts
# 如果 introspect 生成了 schema.ts（非 split 模式），也删除
rm -f web/db/schema.ts web/db/schema/schema.ts
```

- [ ] **Step 6: Commit**

```bash
git add web/db/
git commit -m "chore: 整理 Drizzle schema 为 apps.ts + users.ts，删除无用的 relations"
```

---

### Task 4: 创建 Drizzle 客户端单例

**Files:**

- Create: `web/db/index.ts`

- [ ] **Step 1: 创建 `web/db/index.ts`**

基于 `web/lib/prisma.ts` 的逻辑移植到 Drizzle：

```ts
// web/db/index.ts
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { isNextBuild } from '@/lib/is-next-build'
import * as schema from './schema'

// biome-ignore lint/suspicious/noExplicitAny: proxy pattern
const createThrowingProxy = (): MySql2Database<typeof schema> =>
	new Proxy(() => undefined, {
		get(_target, prop) {
			if (prop === 'then') return undefined
			return createThrowingProxy()
		},
		apply() {
			throw new Error('DATABASE_URL 环境变量缺失, 请检查')
		},
	}) as unknown as MySql2Database<typeof schema>

type CreateDbResult = MySql2Database<typeof schema> & { $client: mysql.Pool }

const createDb = (): CreateDbResult => {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		throw new Error('DATABASE_URL 环境变量缺失, 请检查')
	}

	let dbUrl: URL
	try {
		dbUrl = new URL(databaseUrl)
	} catch {
		throw new Error('DATABASE_URL 环境变量格式错误, 请检查')
	}

	if (!dbUrl.hostname || !dbUrl.username || !dbUrl.password || !dbUrl.pathname) {
		throw new Error('DATABASE_URL 环境变量格式错误, 请检查')
	}

	const pool = mysql.createPool({
		host: dbUrl.hostname,
		port: Number(dbUrl.port),
		user: dbUrl.username,
		password: dbUrl.password,
		database: dbUrl.pathname.slice(1),
	})

	return drizzle(pool, {
		schema,
		logger: true,
	}) as CreateDbResult
}

const globalForDb = globalThis as unknown as {
	db: CreateDbResult | undefined
}

let dbInstance: CreateDbResult | undefined

export const getDb = (): CreateDbResult => {
	if (!process.env.DATABASE_URL && isNextBuild()) {
		if (!dbInstance) dbInstance = createThrowingProxy() as CreateDbResult
		return dbInstance
	}

	if (process.env.NODE_ENV !== 'production') {
		if (!globalForDb.db) globalForDb.db = createDb()
		return globalForDb.db
	}

	if (!dbInstance) dbInstance = createDb()
	return dbInstance
}
```

- [ ] **Step 2: Commit**

```bash
git add web/db/index.ts
git commit -m "feat: 创建 Drizzle 客户端单例 db/index.ts"
```

---

### Task 5: 更新类型转换层

**Files:**

- Modify: `web/lib/db/types.ts`

- [ ] **Step 1: 替换类型导入，修改函数返回类型**

```ts
// web/lib/db/types.ts
import { difyApps } from '@/db/schema'
import { AppModeEnums, IDifyAppItem } from '@/types'

type DifyAppRow = typeof difyApps.$inferSelect
type DifyAppInsert = typeof difyApps.$inferInsert

/**
 * 将数据库模型转换为应用类型
 */
export function dbAppToAppItem(dbApp: DifyAppRow): IDifyAppItem {
	return {
		id: dbApp.id,
		info: {
			name: dbApp.name,
			mode: (dbApp.mode as AppModeEnums) || undefined,
			description: dbApp.description || '',
			tags: dbApp.tags ? JSON.parse(dbApp.tags) : [],
		},
		isEnabled: (dbApp.isEnabled || 1) as 1 | 2,
		requestConfig: {
			apiBase: dbApp.apiBase,
			apiKey: dbApp.apiKey,
		},
		answerForm: dbApp.enableAnswerForm
			? {
					enabled: dbApp.enableAnswerForm,
					feedbackText: (dbApp.answerFormFeedbackText as string) || '',
				}
			: undefined,
		inputParams: {
			enableUpdateAfterCvstStarts: dbApp.enableUpdateInputAfterStarts,
		},
		extConfig: {
			conversation: {
				openingStatement: {
					displayMode: dbApp.openingStatementDisplayMode as 'default' | 'always' | undefined,
				},
			},
			annotation: {
				enabled: dbApp.enableAnnotation || false,
			},
		},
	}
}

/**
 * 将应用类型转换为数据库模型数据
 */
export function appItemToDbApp(appItem: Omit<IDifyAppItem, 'id'>): Omit<DifyAppInsert, 'id'> {
	return {
		name: appItem.info.name,
		mode: appItem.info.mode || null,
		description: appItem.info.description || null,
		tags: appItem.info.tags.length > 0 ? JSON.stringify(appItem.info.tags) : null,
		isEnabled: appItem.isEnabled,
		apiBase: appItem.requestConfig.apiBase,
		apiKey: appItem.requestConfig.apiKey,
		enableAnswerForm: appItem.answerForm?.enabled || false,
		answerFormFeedbackText: appItem.answerForm?.feedbackText || null,
		enableUpdateInputAfterStarts: appItem.inputParams?.enableUpdateAfterCvstStarts || false,
		openingStatementDisplayMode:
			appItem.extConfig?.conversation?.openingStatement?.displayMode || null,
		enableAnnotation: appItem.extConfig?.annotation?.enabled || false,
	}
}

/**
 * 将应用类型转换为数据库更新数据
 */
export function appItemToDbAppUpdate(appItem: IDifyAppItem): DifyAppInsert {
	return {
		...appItemToDbApp(appItem),
		id: appItem.id,
	} as DifyAppInsert
}
```

- [ ] **Step 2: Commit**

```bash
git add web/lib/db/types.ts
git commit -m "feat: 替换类型转换层 Prisma DifyApp → Drizzle 推断类型"
```

---

### Task 6: 重写仓库层

**Files:**

- Modify: `web/repository/app.ts`

- [ ] **Step 1: 将 Prisma CRUD 替换为 Drizzle CRUD**

```ts
// web/repository/app.ts
'use server'

import { eq, desc } from 'drizzle-orm'
import { getDb } from '@/db'
import { difyApps } from '@/db/schema'
import { appItemToDbApp, appItemToDbAppUpdate, dbAppToAppItem } from '@/lib/db/types'
import { IDifyAppItem } from '@/types'
import { generateUuidV4 } from '@/lib/helpers'

export const getAppList = async (): Promise<IDifyAppItem[]> => {
	try {
		const db = getDb()
		const rows = await db.select().from(difyApps).orderBy(desc(difyApps.createdAt))
		return rows.map(dbAppToAppItem)
	} catch (error) {
		console.error('Error fetching app list:', error)
		throw new Error('Failed to fetch app list')
	}
}

export const getAppItem = async (id: string): Promise<IDifyAppItem | null> => {
	try {
		const db = getDb()
		const rows = await db.select().from(difyApps).where(eq(difyApps.id, id)).limit(1)
		const row = rows[0]
		return row ? dbAppToAppItem(row) : null
	} catch (error) {
		console.error('Error fetching app item:', error)
		throw new Error('Failed to fetch app item')
	}
}

export const addApp = async (app: Omit<IDifyAppItem, 'id'>): Promise<IDifyAppItem> => {
	try {
		const db = getDb()
		const newId = generateUuidV4()
		const dbAppData = appItemToDbApp(app)
		await db.insert(difyApps).values({ ...dbAppData, id: newId })
		// 查回完整行以保持和 Prisma 返回值一致
		const rows = await db.select().from(difyApps).where(eq(difyApps.id, newId)).limit(1)
		return dbAppToAppItem(rows[0])
	} catch (error) {
		console.error('Error adding app:', error)
		throw new Error('Failed to add app')
	}
}

export const updateApp = async (app: IDifyAppItem): Promise<IDifyAppItem> => {
	try {
		const db = getDb()
		const dbAppData = appItemToDbAppUpdate(app)
		await db.update(difyApps).set(dbAppData).where(eq(difyApps.id, app.id))
		// 查回完整行
		const rows = await db.select().from(difyApps).where(eq(difyApps.id, app.id)).limit(1)
		return dbAppToAppItem(rows[0])
	} catch (error) {
		console.error('Error updating app:', error)
		throw new Error('Failed to update app')
	}
}

export const deleteApp = async (id: string): Promise<void> => {
	try {
		const db = getDb()
		await db.delete(difyApps).where(eq(difyApps.id, id))
	} catch (error) {
		console.error('Error deleting app:', error)
		throw new Error('Failed to delete app')
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add web/repository/app.ts
git commit -m "feat: 仓库层 Prisma → Drizzle CRUD"
```

---

### Task 7: 修改 Auth 层

**Files:**

- Modify: `web/lib/auth.ts`

- [ ] **Step 1: 删除 PrismaAdapter，替换 authorize 中的 Prisma 调用**

```ts
// web/lib/auth.ts
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db'
import { users } from '@/db/schema'

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: '邮箱', type: 'email' },
				password: { label: '密码', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const db = getDb()
				const rows = await db
					.select()
					.from(users)
					.where(eq(users.email, credentials.email))
					.limit(1)

				const user = rows[0]
				if (!user) {
					return null
				}

				const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

				if (!isPasswordValid) {
					return null
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				}
			},
		}),
	],
	session: {
		strategy: 'jwt' as const,
	},
	pages: {
		signIn: '/login',
	},
	callbacks: {
		async jwt({ token, user }: any) {
			if (user) {
				token.id = user.id
			}
			return token
		},
		session({ session, token }: any) {
			if (token && session.user) {
				session.user.id = token.id as string
			}
			return session
		},
	},
}
```

- [ ] **Step 2: Commit**

```bash
git add web/lib/auth.ts
git commit -m "feat: Auth 层删除 PrismaAdapter，Prisma → Drizzle"
```

---

### Task 8: 修改 Health API

**Files:**

- Modify: `web/app/api/health/route.ts`

- [ ] **Step 1: 替换 Prisma raw query**

```ts
// web/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'

import { getDb } from '@/db'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const db = getDb()
		await db.execute(sql`SELECT 1`)

		return NextResponse.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: 'connected',
		})
	} catch (error) {
		return NextResponse.json(
			{
				status: 'error',
				timestamp: new Date().toISOString(),
				database: 'disconnected',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/api/health/route.ts
git commit -m "feat: Health API Prisma → Drizzle"
```

---

### Task 9: 修改 Init API

**Files:**

- Modify: `web/app/api/init/route.ts`
- Modify: `web/app/api/init/status/route.ts`

- [ ] **Step 1: 修改 `web/app/api/init/status/route.ts`**

```ts
// web/app/api/init/status/route.ts
import { NextResponse } from 'next/server'
import { count } from 'drizzle-orm'

import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const db = getDb()
		const result = await db.select({ count: count() }).from(users)
		const userCount = result[0]?.count ?? 0

		return NextResponse.json({
			initialized: userCount > 0,
		})
	} catch (error) {
		console.error('Error checking init status:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
```

- [ ] **Step 2: 修改 `web/app/api/init/route.ts`**

读取当前文件，替换 Prisma 调用：

```ts
// web/app/api/init/route.ts
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { count } from 'drizzle-orm'

import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
	try {
		const db = getDb()
		const result = await db.select({ count: count() }).from(users)
		const userCount = result[0]?.count ?? 0

		if (userCount > 0) {
			return NextResponse.json({ message: '已经初始化过了' }, { status: 400 })
		}

		const { name, email, password } = await request.json()

		if (!name || !email || !password) {
			return NextResponse.json({ message: '姓名、邮箱和密码都是必填项' }, { status: 400 })
		}

		const hashedPassword = await bcrypt.hash(password, 12)

		await db.insert(users).values({
			name,
			email,
			password: hashedPassword,
		})

		return NextResponse.json({ message: '初始化成功' }, { status: 201 })
	} catch (error) {
		console.error('初始化失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
```

- [ ] **Step 3: Commit**

```bash
git add web/app/api/init/status/route.ts web/app/api/init/route.ts
git commit -m "feat: Init API Prisma → Drizzle"
```

---

### Task 10: 修改 Users API

**Files:**

- Modify: `web/app/api/users/route.ts`
- Modify: `web/app/api/users/[id]/route.ts`

- [ ] **Step 1: 修改 `web/app/api/users/route.ts`**

```ts
// web/app/api/users/route.ts
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'

import { authOptions } from '@/lib/auth'
import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const db = getDb()
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const allUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.orderBy(desc(users.createdAt))

		return NextResponse.json(allUsers)
	} catch (error) {
		console.error('获取用户列表失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const db = getDb()
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { name, email, password } = await request.json()

		if (!name || !email || !password) {
			return NextResponse.json({ message: '姓名、邮箱和密码都是必填项' }, { status: 400 })
		}

		const existingRows = await db.select().from(users).where(eq(users.email, email)).limit(1)

		if (existingRows[0]) {
			return NextResponse.json({ message: '该邮箱已被使用' }, { status: 400 })
		}

		const hashedPassword = await bcrypt.hash(password, 12)

		await db.insert(users).values({
			name,
			email,
			password: hashedPassword,
		})

		// 查回新创建的用户
		const newUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		return NextResponse.json(newUsers[0], { status: 201 })
	} catch (error) {
		console.error('创建用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
```

- [ ] **Step 2: 修改 `web/app/api/users/[id]/route.ts`**

```ts
// web/app/api/users/[id]/route.ts
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { authOptions } from '@/lib/auth'
import { getDb } from '@/db'
import { users } from '@/db/schema'

export const dynamic = 'force-dynamic'

interface RouteParams {
	params: Promise<{
		id: string
	}>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const db = getDb()
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { id } = await params
		const { name, email, password } = await request.json()

		if (!name || !email) {
			return NextResponse.json({ message: '姓名和邮箱都是必填项' }, { status: 400 })
		}

		const existingRows = await db.select().from(users).where(eq(users.id, id)).limit(1)

		if (!existingRows[0]) {
			return NextResponse.json({ message: '用户不存在' }, { status: 404 })
		}

		const emailRows = await db.select().from(users).where(eq(users.email, email)).limit(1)

		if (emailRows[0] && emailRows[0].id !== id) {
			return NextResponse.json({ message: '该邮箱已被其他用户使用' }, { status: 400 })
		}

		const updateData: Record<string, unknown> = {
			name,
			email,
		}

		if (password && password.trim()) {
			updateData.password = await bcrypt.hash(password, 12)
		}

		await db.update(users).set(updateData).where(eq(users.id, id))

		const updatedRows = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1)

		return NextResponse.json(updatedRows[0])
	} catch (error) {
		console.error('更新用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const db = getDb()
		const session = (await getServerSession(authOptions)) as { user: { id: string } }

		if (!session) {
			return NextResponse.json({ message: '未授权' }, { status: 401 })
		}

		const { id } = await params

		if (session.user?.id === id) {
			return NextResponse.json({ message: '不能删除自己的账户' }, { status: 400 })
		}

		const existingRows = await db.select().from(users).where(eq(users.id, id)).limit(1)

		if (!existingRows[0]) {
			return NextResponse.json({ message: '用户不存在' }, { status: 404 })
		}

		await db.delete(users).where(eq(users.id, id))

		return NextResponse.json({ message: '删除成功' })
	} catch (error) {
		console.error('删除用户失败:', error)
		return NextResponse.json({ message: '服务器错误' }, { status: 500 })
	}
}
```

- [ ] **Step 3: Commit**

```bash
git add web/app/api/users/route.ts web/app/api/users/[id]/route.ts
git commit -m "feat: Users API Prisma → Drizzle"
```

---

### Task 11: 迁移 Seed 脚本

**Files:**

- Move: `web/prisma/seed.ts` → `web/db/seed.ts`

- [ ] **Step 1: 移动并改写 seed 脚本**

```bash
cp web/prisma/seed.ts web/db/seed.ts
```

- [ ] **Step 2: 修改 `web/db/seed.ts`**

```ts
// web/db/seed.ts
import { getDb } from '@/db'
import { difyApps } from '@/db/schema'

const db = getDb()

async function main() {
	console.log('开始数据库种子数据初始化...')

	await db.insert(difyApps).values({
		name: '示例聊天助手',
		mode: 'chat',
		description: '这是一个示例的 Dify 聊天助手应用',
		tags: JSON.stringify(['示例', '聊天']),
		apiBase: 'https://api.dify.ai/v1',
		apiKey: 'app-xxxxxxxxxxxxxxxxx',
		enableAnswerForm: false,
		enableUpdateInputAfterStarts: false,
		openingStatementDisplayMode: 'default',
	})

	console.log('创建示例应用')
	console.log('数据库种子数据初始化完成!')
}

main()
	.then(async () => {
		await db.$client.end()
	})
	.catch(async e => {
		console.error(e)
		await db.$client.end()
		process.exit(1)
	})
```

- [ ] **Step 3: Commit**

```bash
git add web/db/seed.ts
git commit -m "feat: Seed 脚本 Prisma → Drizzle，移动到 db/seed.ts"
```

---

### Task 12: 修改 create-admin 脚本

**Files:**

- Modify: `web/scripts/create-admin.ts`

- [ ] **Step 1: 替换 Prisma 调用**

```ts
// web/scripts/create-admin.ts
import bcrypt from 'bcryptjs'
import * as readline from 'readline'
import { eq } from 'drizzle-orm'

import { getDb } from '../db'
import { users } from '../db/schema'

const db = getDb()

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

function question(prompt: string): Promise<string> {
	return new Promise(resolve => {
		rl.question(prompt, resolve)
	})
}

async function createAdmin() {
	console.log('=== 创建管理员账户 ===')

	const email = await question('请输入管理员邮箱: ')
	const password = await question('请输入管理员密码: ')
	const name = await question('请输入管理员姓名: ')

	if (!email || !password || !name) {
		console.log('邮箱、密码和姓名都不能为空')
		rl.close()
		return
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		console.log('邮箱格式不正确')
		rl.close()
		return
	}

	const existingRows = await db.select().from(users).where(eq(users.email, email)).limit(1)

	if (existingRows[0]) {
		console.log('管理员账户已存在')
		rl.close()
		return
	}

	const hashedPassword = await bcrypt.hash(password, 12)

	await db.insert(users).values({
		email,
		password: hashedPassword,
		name,
	})

	console.log('\n管理员账户创建成功:')
	console.log(`邮箱: ${email}`)
	console.log(`姓名: ${name}`)

	rl.close()
}

createAdmin()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await db.$client.end()
	})
```

- [ ] **Step 2: Commit**

```bash
git add web/scripts/create-admin.ts
git commit -m "feat: create-admin 脚本 Prisma → Drizzle"
```

---

### Task 13: 更新 web/package.json

**Files:**

- Modify: `web/package.json`

- [ ] **Step 1: 删除 Prisma 依赖，更新 scripts**

删除依赖：

```json
"@prisma/adapter-mariadb": ...
"@prisma/client": ...
"prisma": ...
"@auth/prisma-adapter": ...
```

scripts：

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"db:seed": "tsx db/seed.ts",
```

删除：

```json
"db:push", "db:init", "db:switch", "db:switch:sqlite", "db:switch:postgresql", "postinstall"
```

注意：如果 `typescript-eslint` 还在 devDependencies 中（web/ 保留 eslint），它之前可能被 Task 清理时误删。确认保留 `typescript-eslint`。

- [ ] **Step 2: Commit**

```bash
git add web/package.json
git commit -m "chore: 更新 web/package.json Prisma → Drizzle deps & scripts"
```

---

### Task 14: 更新根 package.json + AGENTS.md

**Files:**

- Modify: `package.json`
- Modify: `AGENTS.md`

- [ ] **Step 1: 删除根 package.json 中失效的 build:pkgs 脚本**

```json
// 删除 "build:pkgs": "pnpm --filter @dify-chat/* build",
```

- [ ] **Step 2: 在 AGENTS.md 末尾追加数据库迁移章节**

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

- [ ] **Step 3: Commit**

```bash
git add package.json AGENTS.md
git commit -m "chore: 删除 build:pkgs，AGENTS.md 新增数据库迁移规范"
```

---

### Task 15: 删除 Prisma 旧文件

**Files:**

- Delete: `web/prisma/`（整个目录）
- Delete: `web/prisma.config.ts`
- Delete: `web/lib/prisma.ts`
- Delete: `web/repository/prisma/`（整个目录）

- [ ] **Step 1: 删除所有 Prisma 相关文件**

```bash
rm -rf web/prisma
rm -f web/prisma.config.ts
rm -f web/lib/prisma.ts
rm -rf web/repository/prisma
```

- [ ] **Step 2: Commit**

```bash
git add -A web/
git commit -m "chore: 删除所有 Prisma 旧文件（schema/migrations/generated/lib/repository）"
```

---

### Task 16: 运行 pnpm install + 验证

**Files:**

- Modify: `pnpm-lock.yaml`（自动更新）

- [ ] **Step 1: 安装依赖，清理 lockfile**

```bash
pnpm install
```

Expected: 无错误。`@prisma/client`、`prisma`、`@prisma/adapter-mariadb`、`@auth/prisma-adapter` 应被移除

- [ ] **Step 2: 检查 build 是否通过**

```bash
cd web && npx tsc --noEmit 2>&1 | head -30
```

Expected: 无类型错误。如有错误，根据提示修复（常见：import 路径错误、类型不匹配）

- [ ] **Step 3: 验证所有文件无 Prisma 残留**

```bash
grep -r "from '@prisma\|from '@/prisma\|from './prisma\|PrismaClient\|PrismaAdapter\|getPrisma" web/ --include='*.ts' --include='*.tsx' || echo "Clean"
```

Expected: "Clean"

- [ ] **Step 4: Commit**

```bash
git add pnpm-lock.yaml web/
git commit -m "chore: pnpm install 清理 Prisma 残留依赖"
```

---

## 自检清单

实现完成后确认：

- [ ] `grep -r "prisma\|Prisma" web/app web/lib web/db web/repository --include='*.ts' --include='*.tsx'` 无业务代码残留
- [ ] `web/package.json` 中无 `@prisma/*` 或 `prisma` 依赖
- [ ] `web/db/schema/` 存在 `apps.ts`、`users.ts`、`index.ts`
- [ ] `web/db/index.ts` 正确导出 `getDb()`
- [ ] 根 `package.json` 中 `build:pkgs` 已删除
- [ ] `AGENTS.md` 底部有数据库迁移章节
- [ ] `pnpm install` 不报错
- [ ] `web/db/migrations/` 下有 introspect 生成的初始迁移文件
