# 自定义数据库类型

默认情况下，Dify Chat 使用 MySQL 进行应用配置的持久化存储。

### 1. 使用 MySQL

如果你有 MySQL 数据库，那么非常简单，只需要构建一个用于存放 Dify Chat 数据的数据库连接并配置在环境变量：

```shell
mysql://username:password@host:port/database_name
```

### 2. 使用其他数据库

如果你的数据库是其他类型，则需要修改代码。下面以 PostgreSQL 为例说明如何配置。

首先，修改 Prisma 配置文件中的数据库类型：

```shell title="packages/platform/prisma/schema.prisma"
datasource db {
  provider = "postgresql"
}
```

然后在 .env 中配置你的数据库连接地址：

```shell title="packages/platform/.env"
DATABASE_URL=postgres://username:password@ip:port/dify-chat
```

重新生成 Prisma 客户端文件并同步表结构：

```shell
# 重新生成客户端文件
pnpm --filter dify-chat-platform db:generate

# 删除 migrations 目录
rm -rf packages/platform/prisma/migrations

# 重置迁移历史
pnpm --filter dify-chat-platform exec prisma migrate reset

# 重新生成迁移文件
pnpm --filter dify-chat-platform exec prisma migrate dev
```

最后，按照你喜欢的方式（Docker 或者脚本）启动即可。
