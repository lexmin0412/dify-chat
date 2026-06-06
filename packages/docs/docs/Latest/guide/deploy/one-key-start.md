# Shell 脚本一键启动

如果你没有 Docker 环境，也可以通过源码启动项目，本小节将会教你如何通过脚本一键完成 Dify App Hub 的项目构建和启动。

## 0. 部署环境

在开始部署前，你需要准备好以下环境：

- Node.js >= 22
- pnpm >= 10.8.1

## 1. Clone 项目源码

```bash
git clone git@github.com:lexmin0412/dify-app-hub.git
```

## 2. 配置环境变量

进入项目目录：

```bash
cd dify-app-hub
cp .env.template .env
```

注意：`.env` 中需要配置 `DATABASE_URL` 为实际的数据库连接地址。

## 3. 安装依赖并构建

```bash
# 安装依赖
pnpm install
# 构建应用
pnpm build:app
# 启动服务
pnpm start
```

启动成功后访问 `http://localhost:5300`，你会看到初始化界面，依次输入用户名、邮箱、密码，即可创建一个管理员账号。

## 4. 修改环境变量

如果你需要修改环境变量的值（如数据库连接地址），可以编辑 `.env` 文件，然后重新构建启动即可。
