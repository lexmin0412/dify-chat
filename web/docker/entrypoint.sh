#!/bin/sh

# 数据库迁移
echo "数据库迁移中..."
if [ -f .env ]; then
  node --env-file .env --import tsx db/migrate.ts
else
  node --import tsx db/migrate.ts
fi
echo "数据库迁移完成"

# 启动应用
exec "$@"
