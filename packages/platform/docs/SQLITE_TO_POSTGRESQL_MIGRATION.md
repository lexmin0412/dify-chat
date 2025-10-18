# SQLite 到 PostgreSQL 数据库迁移指南

本文档详细说明了如何将 Dify Chat Platform 从 SQLite 数据库迁移到 PostgreSQL 数据库。

## 📋 迁移前准备

### 1. 环境要求

- PostgreSQL 服务器（版本 12 或更高）
- 具有创建数据库权限的 PostgreSQL 用户
- 备份当前 SQLite 数据库

### 2. 备份现有数据

```bash
# 进入 platform 目录
cd packages/platform

# 备份当前 SQLite 数据库
cp data/dev.db backup/sqlite-backup-$(date +%Y%m%d-%H%M%S).db

# 或者如果数据库在其他位置
cp ./dev.db backup/sqlite-backup-$(date +%Y%m%d-%H%M%S).db
```

## 🗄️ PostgreSQL 数据库准备

### 测试连接

```bash
# 测试数据库连接
psql -U your_user -h your_host -d your_database -c "SELECT version();"
```

## ⚙️ 环境变量配置

### 1. 更新 .env 文件

```bash
# 备份原有配置
cp .env .env.sqlite.backup

# 更新数据库 URL
# 将原来的：
# DATABASE_URL="file:./dev.db"
#
# 修改为：
DATABASE_URL="postgresql://dify_user:your_secure_password@localhost:5432/dify_chat_platform"

# 其他环境变量保持不变
NEXTAUTH_SECRET=your_existing_secret
```

### 2. 环境变量格式说明

PostgreSQL URL 格式：

```
postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]?[参数]
```

常用参数：

- `sslmode=require` - 强制使用 SSL
- `connect_timeout=10` - 连接超时时间
- `application_name=dify_chat` - 应用程序名称

示例：

```bash
# 本地开发环境
DATABASE_URL="postgresql://dify_user:password@localhost:5432/dify_chat_platform"

# 生产环境（使用 SSL）
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/dify_chat?sslmode=require"

# Docker 环境
DATABASE_URL="postgresql://postgres:password@db:5432/dify_chat"
```

## 🔄 数据迁移步骤

### 1. 安装 PostgreSQL 依赖

```bash
# 确保已安装 PostgreSQL 驱动
pnpm install pg @types/pg
```

### 2. 初始化 PostgreSQL 数据库结构

```bash
# 启动应用以使用新的数据库连接
pnpm dev
```

应用启动时，TypeORM 会自动：

- 检测到 PostgreSQL 数据库
- 创建必要的表结构
- 初始化数据库

### 3. 初始化系统设置

由于已经实现了 `/init` 页面的逻辑，您可以：

```bash
# 启动应用
pnpm dev

# 访问初始化页面
# http://localhost:3000/init
```

通过 Web 界面完成系统初始化和管理员账户创建。

## 🧪 验证迁移结果

### 1. 检查数据库连接

```bash
# 启动应用
pnpm dev

# 检查控制台输出，应该看到：
# ✅ TypeORM DataSource initialized successfully
```

### 2. 验证表结构

```sql
-- 连接到 PostgreSQL
psql -U dify_user -h localhost -d dify_chat_platform

-- 查看所有表
\dt

-- 查看用户表结构
\d users

-- 查看应用表结构
\d dify_apps

-- 退出
\q
```

### 3. 功能测试

- [ ] 访问 http://localhost:3000/init 检查初始化页面
- [ ] 通过 Web 界面创建管理员账户
- [ ] 登录系统
- [ ] 创建和管理应用
- [ ] 检查数据持久化

## 🔧 配置优化

### 1. 生产环境配置

```bash
# 生产环境变量
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db:5432/dify_chat?sslmode=require&connect_timeout=10"

# 连接池配置（在代码中）
# TypeORM 会自动处理连接池
```

### 2. 性能优化

PostgreSQL 相比 SQLite 的优势：

- ✅ 更好的并发性能
- ✅ 支持更多数据类型
- ✅ 更强的 ACID 特性
- ✅ 支持复杂查询优化
- ✅ 支持扩展和插件

## 🚨 常见问题和解决方案

### 问题 1：连接被拒绝

```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案：**

```bash
# 检查 PostgreSQL 服务状态
brew services list | grep postgresql
# 或
systemctl status postgresql

# 启动 PostgreSQL 服务
brew services start postgresql
# 或
sudo systemctl start postgresql
```

### 问题 2：认证失败

```bash
Error: password authentication failed for user "dify_user"
```

**解决方案：**

```sql
-- 重置用户密码
ALTER USER dify_user WITH PASSWORD 'new_password';

-- 检查 pg_hba.conf 配置
-- 确保允许密码认证
```

### 问题 3：数据库不存在

```bash
Error: database "your_database" does not exist
```

**解决方案：** 请确保您已经创建了相应的数据库，或联系数据库管理员。

### 问题 4：权限不足

```bash
Error: permission denied for schema public
```

**解决方案：** 请联系数据库管理员确保您的用户具有足够的权限。

## 🔄 回滚方案

如果迁移过程中遇到问题，可以快速回滚到 SQLite：

```bash
# 1. 恢复原有 .env 配置
cp .env.sqlite.backup .env

# 2. 恢复 SQLite 数据库
cp backup/sqlite-backup-*.db ./dev.db

# 3. 重启应用
pnpm dev
```

## 📊 Docker 环境配置

### docker-compose.yml 示例

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/dify_chat
      - NEXTAUTH_SECRET=your_secret_here
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=dify_chat
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

volumes:
  postgres_data:
```

## 📝 迁移检查清单

### 迁移前

- [ ] 备份 SQLite 数据库
- [ ] 记录当前应用配置
- [ ] 准备 PostgreSQL 服务器
- [ ] 测试 PostgreSQL 连接

### 迁移中

- [ ] 更新 DATABASE_URL 环境变量
- [ ] 安装 PostgreSQL 依赖
- [ ] 启动应用验证连接
- [ ] 通过 Web 界面完成系统初始化

### 迁移后

- [ ] 验证所有功能正常
- [ ] 检查数据持久化
- [ ] 性能测试
- [ ] 备份新的 PostgreSQL 数据库

## 🎯 总结

迁移到 PostgreSQL 后，您将获得：

1. **更好的性能**：支持更多并发连接
2. **更强的功能**：支持更多 SQL 特性
3. **更好的扩展性**：适合生产环境使用
4. **更好的数据完整性**：更强的 ACID 保证

完成迁移后，建议定期备份 PostgreSQL 数据库，并监控数据库性能。

---

如有任何问题，请参考项目文档或提交 Issue。
