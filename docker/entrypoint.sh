#!/bin/sh
set -e

echo "数据库迁移中..."
if [ -f /app/.env ]; then
  node --experimental-strip-types --env-file /app/.env db/migrate.ts
else
  node --experimental-strip-types db/migrate.ts
fi
echo "数据库迁移完成"

exec "$@"
