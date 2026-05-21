#!/bin/bash

# Determine the correct sed -i syntax based on OS
if [[ "$(uname)" == "Darwin" ]]; then
  # macOS (BSD sed)
  SED_INPLACE="sed -i ''"
else
  # Linux (GNU sed)
  SED_INPLACE="sed -i"
fi

# 生产环境启动脚本
# 使用 PM2 管理 Platform 服务，构建 React App 静态文件

set -e

echo "🚀 启动 Dify Chat 生产环境..."

# 检查必要工具
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，正在安装..."
    npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# 构建基础包
echo "🔨 构建基础包..."
pnpm build:pkgs

# 配置 Platform 环境
echo "⚙️ 配置 Platform 环境..."
cd packages/platform

# 检查生产环境配置文件
if [ ! -f .env ]; then
    echo "创建 Platform 生产环境配置文件..."
    touch .env
fi

# 检查必要的环境变量
if ! grep -q "^DATABASE_URL=" .env; then
    echo "添加 DATABASE_URL 配置..."
    echo "# Database - 生产环境请使用 PostgreSQL 或 MySQL" >> .env
    echo "DATABASE_URL=\"mysql://username:password@host:port/database_name\"" >> .env
    echo "添加 NEXTAUTH_SECRET 配置..."
    echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env
    echo ""
    echo "⚠️  请编辑 .env 文件中的 DATABASE_URL，配置正确的生产环境数据库连接"
fi

if ! grep -q "^NEXTAUTH_SECRET=" .env; then
    echo "添加 NEXTAUTH_SECRET 配置..."
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
    echo "✅ 已自动生成 NEXTAUTH_SECRET"
fi

# 数据库迁移
echo "🗄️ 初始化数据库..."
npx drizzle-kit migrate

# 构建 Platform
echo "🏗️ 构建 Platform..."
pnpm build

cd ../..

# 创建 PM2 配置文件
if [ ! -f ecosystem.config.js ]; then
    echo "📝 创建 PM2 配置..."
    cat > ecosystem.config.js << EOF
export default {
  apps: [{
    name: 'dify-chat-platform',
    cwd: './packages/platform',
    script: 'pnpm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 5300
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/platform-error.log',
    out_file: './logs/platform-out.log',
    log_file: './logs/platform-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
else
    echo "📝 PM2 配置文件已存在，跳过创建"
fi

# 创建日志目录
mkdir -p logs

# 停止可能存在的旧进程
echo "🛑 停止旧进程..."
pm2 delete dify-chat-platform 2>/dev/null || true

# 启动 Platform 服务
echo "🌟 启动 Platform 服务..."
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

echo ""
echo "✅ 生产环境启动成功！"
echo ""
echo "🔧 Platform API:      http://localhost:5300"
echo "🔑 生成管理员账户请运行: pnpm create-admin"
echo ""
echo "📊 查看服务状态: pm2 status"
echo "📋 查看日志:     pm2 logs dify-chat-platform"
echo "🛑 停止服务:     pm2 stop dify-chat-platform"
echo "🔄 重启服务:     pm2 restart dify-chat-platform"
echo ""
echo "⚠️  请配置 Nginx 反向代理来提供前端静态文件和 API 服务"
