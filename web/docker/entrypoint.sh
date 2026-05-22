#!/bin/sh

# 数据库迁移
echo "数据库迁移中..."
node --import tsx db/migrate.ts
echo "数据库迁移完成"

# 启动应用
exec "$@"
