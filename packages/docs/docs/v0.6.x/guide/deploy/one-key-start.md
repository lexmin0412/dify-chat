# Shell 脚本一键启动

如果你没有 Docker 环境，也可以通过源码启动项目，本小节将会教你如何通过脚本一键完成 Dify Chat 的项目构建和启动。

## 0. 部署环境

在开始部署前，你需要准备好以下环境：

- Node.js >= 20
- Pnpm >= 10.8.1

## 1. Clone 项目源码

```bash
git clone git@github.com:lexmin0412/dify-chat.git
```

## 2. 配置环境变量

进入项目目录：

```bash
cd dify-chat
```

配置 react-app 的环境变量：

```bash
cd packages/react-app
cp .env.template .env
```

配置 platform 的环境变量：

```bash
cd packages/platform
# 注意这里要替换 DATABASE_URL 为你自己的数据库连接
cp .env.template .env
```

## 3. 运行启动脚本

```bash
chmod +x ./prod-start.sh
./prod-start.sh
```

脚本会帮你自动完成依赖安装，源码构建以及服务启动，稍等片刻后，看到如下图片则表示执行成功了：

![启动成功提示](/guide__one_key_start.png)

访问 `http://localhost:5300`，你会看到 Platform 的初始化界面，依次输入用户名、邮箱、密码，即可创建一个管理员账号。此账号可用于 `Dify Chat Platform` 的登录。

对于前端应用，你需要将 `packages/react-app/dist` 中的产物通过 nginx 等静态文件服务器进行部署。

## 4. 修改环境变量

如果你需要修改环境变量的值（如数据库连接地址），可以编辑第 2 步中创建的 .env 文件，然后重新运行 `./prod-start.sh` 即可。
