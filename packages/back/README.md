# Dify Chat Backend

基于 NestJS 的 Dify Chat 后端服务，为前端应用提供 API 支持。

## 功能特性

- 🚀 基于 NestJS 框架构建
- 📚 集成 Swagger API 文档
- 🔐 JWT 身份认证
- 📝 数据验证和转换
- 🏗️ 模块化架构设计
- 🔧 环境变量配置
- 📊 健康检查端点

## 技术栈

- **框架**: NestJS
- **语言**: TypeScript
- **文档**: Swagger
- **验证**: class-validator
- **转换**: class-transformer

## 快速开始

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 环境配置

复制环境变量模板并配置：

\`\`\`bash
cp .env.template .env
\`\`\`

根据你的环境修改 \`.env\` 文件中的配置。

### 启动开发服务器

\`\`\`bash
# 开发模式
pnpm run start:dev

# 调试模式
pnpm run start:debug

# 生产模式
pnpm run start:prod
\`\`\`

### 构建项目

\`\`\`bash
pnpm run build
\`\`\`

## API 文档

启动服务后，访问 http://localhost:3001/api 查看 Swagger API 文档。

## 项目结构

\`\`\`
src/
├── app.controller.ts       # 应用控制器
├── app.module.ts          # 应用模块
├── app.service.ts         # 应用服务
├── main.ts                # 应用入口
├── modules/               # 功能模块
│   ├── app/              # 应用管理模块
│   ├── auth/             # 认证模块
│   └── user/             # 用户模块
├── common/               # 公共模块
└── config/               # 配置模块
\`\`\`

## 可用脚本

- \`pnpm run start\` - 启动应用
- \`pnpm run start:dev\` - 开发模式启动（监听文件变化）
- \`pnpm run start:debug\` - 调试模式启动
- \`pnpm run start:prod\` - 生产模式启动
- \`pnpm run build\` - 构建应用
- \`pnpm run lint\` - 运行 ESLint
- \`pnpm run format\` - 格式化代码
- \`pnpm run test\` - 运行单元测试
- \`pnpm run test:cov\` - 运行测试并生成覆盖率报告

## 端点

- \`GET /\` - 获取欢迎信息
- \`GET /health\` - 健康检查

## 开发指南

### 添加新模块

使用 NestJS CLI 创建新模块：

\`\`\`bash
npx nest generate module modules/module-name
npx nest generate controller modules/module-name
npx nest generate service modules/module-name
\`\`\`

### 环境变量

所有环境变量都在 \`.env\` 文件中配置，参考 \`.env.template\` 文件。

## 许可证

ISC