# 一键启动

本小节将会教你如何通过脚本一键完成

Clone 项目源码：

```bash
git clone git@github.com:lexmin0412/dify-chat.git
```

进入项目目录：

```bash
cd dify-chat
```

运行一键启动脚本：

```bash
chmod +x ./prod-start.sh
./prod-start.sh
```

脚本会帮你自动完成依赖安装，数据库初始化，以及项目启动，稍等片刻后，看到如下图片则表示服务启动成功了：

![启动成功提示](/guide__one_key_start.png)

访问 `http://localhost:5300`，即可看到 `Platform` 应用的登录页面：

![Platform 登录](/guide__platform_login.png)

回到项目目录，运行 `pnpm create-admin`，按照提示依次输入邮箱、密码、用户名，即可创建一个管理员账号。此账号可用于 `Dify Chat Platform` 的登录。

对于前端应用，你需要将 `packages/react-app/dist` 中的产物通过 nginx 等静态文件服务器进行部署。

注意：Platform 应用的端口默认为 `5300`，不要随意改动。
