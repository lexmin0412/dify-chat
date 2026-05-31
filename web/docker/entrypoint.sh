#!/bin/sh

# 数据库迁移
echo "数据库迁移中..."
cd /app/web
if [ -f /app/.env ]; then
  node --experimental-strip-types --env-file /app/.env db/migrate.ts
else
  node --experimental-strip-types db/migrate.ts
fi
echo "数据库迁移完成"

# 启动应用
cd /app
exec "$@"
