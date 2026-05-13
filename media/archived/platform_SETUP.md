# Dify Chat Admin 数据库持久化设置指南

本指南详细说明了 Dify Chat Admin 的数据库持久化存储方案。

## 🎯 方案概述

### 技术选型

- **ORM**: Prisma - 类型安全的现代 ORM
- **数据库**: SQLite - 轻量级，无需额外服务

### 优势

- ✅ 数据持久化，不会因容器重启丢失
- ✅ 支持并发访问，避免文件锁定问题
- ✅ 类型安全的数据操作
- ✅ 支持数据备份和恢复

## 🚀 快速开始

### 1. 安装依赖

```bash
cd packages/nextjs-admin
pnpm install
```

### 2. 初始化数据库

使用一键初始化脚本：

```bash
pnpm db:init
```

或者手动执行：

```bash
# 复制并配置环境变量文件
cp .env.example .env

# 确保 DATABASE_URL 配置正确（开发环境默认）
# DATABASE_URL="file:./prisma/dev.db"

# 生成 Prisma 客户端
pnpm db:generate

# 初始化数据库结构
pnpm db:push
```

### 3. 启动应用

```bash
pnpm dev
```

访问 http://localhost:5300 查看管理后台。

> 📖 **重要提示**：关于不同环境下的数据库配置详情，请参考 [数据库配置指南](./docs/DATABASE_CONFIG.md)

## 🗄️ 数据库结构

### 表结构

```sql
CREATE TABLE "dify_apps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    -- 应用基本信息
    "name" TEXT NOT NULL,
    "mode" TEXT,
    "description" TEXT,
    "tags" TEXT, -- JSON 字符串

    -- 请求配置
    "apiBase" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,

    -- 功能配置
    "enableAnswerForm" BOOLEAN NOT NULL DEFAULT false,
    "answerFormFeedbackText" TEXT,
    "enableUpdateInputAfterStarts" BOOLEAN NOT NULL DEFAULT false,
    "openingStatementDisplayMode" TEXT
);
```

### 数据类型映射

| 应用配置字段 | 数据库字段 | 类型 | 说明 |
| --- | --- | --- | --- |
| `info.name` | `name` | TEXT | 应用名称 |
| `info.mode` | `mode` | TEXT | 应用类型 |
| `info.description` | `description` | TEXT | 应用描述 |
| `info.tags` | `tags` | TEXT | JSON 字符串存储 |
| `requestConfig.apiBase` | `api_base` | TEXT | API 基础地址 |
| `requestConfig.apiKey` | `api_key` | TEXT | API 密钥 |
| `enableAnswerForm` | `enable_answer_form` | BOOLEAN | 是否启用回复表单 |
| `answerForm.feedbackText` | `answer_form_feedback_text` | TEXT | 回复表单反馈文本 |
| `enableUpdateInputAfterStarts` | `enable_update_input_after_starts` | BOOLEAN | 对话开始后是否允许修改对话参数 |
| `openingStatementDisplayMode` | `opening_statement_display_mode` | TEXT | 开场白展示模式 |

## 🛠️ 开发工具

### 数据库管理

```bash
# 打开 Prisma Studio（可视化数据库管理）
pnpm db:studio

# 查看数据库结构
pnpm db:generate

# 重置数据库（谨慎使用）
pnpm db:push --force-reset
```

### 种子数据

```bash
# 添加示例数据
pnpm db:seed
```

### 数据库版本管理

```bash
# 创建新的数据库版本（生产环境推荐）
pnpm db:migrate

# 应用数据库版本到生产环境
npx prisma migrate deploy
```

## 🚢 部署

### 开发环境

```bash
pnpm dev
```

### 生产环境

#### 方式一：直接部署

```bash
# 构建应用
pnpm build

# 启动生产服务器
pnpm start
```

### 环境变量

生产环境需要设置以下环境变量：

```bash
# 数据库连接
DATABASE_URL="file:/app/data/prod.db"
```

## 🔧 故障排除

### 常见问题

#### 1. Prisma 客户端未生成

```bash
Error: @prisma/client did not initialize yet
```

**解决方案**：

```bash
pnpm db:generate
```

#### 2. 数据库文件权限问题

```bash
Error: SQLITE_CANTOPEN: unable to open database file
```

**解决方案**：

```bash
# 确保数据库目录存在且有写权限
mkdir -p prisma
chmod 755 prisma
```

#### 3. 数据库初始化失败

```bash
Error: Database initialization failed
```

**解决方案**：

```bash
# 重置数据库
rm -f prisma/dev.db
pnpm db:push
```

### 数据备份

#### 备份数据库

```bash
# SQLite 数据库备份
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

#### 导出数据

```bash
# 导出为 JSON 格式
npx prisma db seed --preview-feature
```

### 性能优化

#### 数据库索引

```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_dify_apps_name ON dify_apps(name);
CREATE INDEX idx_dify_apps_created_at ON dify_apps(createdAt);
```

#### 连接池配置

```javascript
// lib/prisma.ts
export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
	log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})
```

## 📈 监控和维护

### 健康检查

访问 `/api/health` 端点检查应用和数据库状态：

```json
{
	"status": "ok",
	"timestamp": "2024-01-01T00:00:00.000Z",
	"database": "connected"
}
```

### 日志监控

```bash
# 查看应用日志
docker-compose logs -f dify-chat-admin

# 查看数据库查询日志（开发环境）
tail -f logs/prisma.log
```

## 🔄 版本升级

### 升级 Prisma

```bash
# 更新 Prisma 版本
pnpm add @prisma/client@latest
pnpm add -D prisma@latest

# 重新生成客户端
pnpm db:generate
```

### 数据库模式变更

```bash
# 创建新的迁移
pnpm db:migrate

# 应用到生产环境
npx prisma migrate deploy
```

## 📞 技术支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 GitHub Issues
3. 提交新的 Issue 并附上详细的错误信息

---

🎉 恭喜！你已经成功将 Dify Chat Admin 升级到数据库持久化存储。现在可以享受更稳定、更可靠的数据管理体验了！
