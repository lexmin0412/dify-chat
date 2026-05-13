#!/bin/sh

# 数据库迁移
echo "开始数据库迁移"
npx prisma@7.2.0 migrate deploy
echo "数据库迁移成功"

# 启动应用
exec "$@"
