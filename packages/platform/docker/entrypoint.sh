#!/bin/sh

# 数据库迁移
npx prisma@7.2.0 migrate deploy

# 启动应用
exec "$@"
