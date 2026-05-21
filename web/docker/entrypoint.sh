#!/bin/sh

# 数据库迁移
echo "开始数据库迁移"
npx drizzle-kit migrate
echo "数据库迁移成功"

# 启动应用
exec "$@"
