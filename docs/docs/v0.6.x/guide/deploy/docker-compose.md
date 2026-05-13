# Docker Compose 一键部署

使用 Docker Compose 时，我们提供了两种方式供你部署，你可以按需选用。

## 直接部署

这种方式适用于无需二开的场景，你不需要 clone 源码，直接使用官方镜像部署即可。

### 1. 准备工作目录

```bash
mkdir dify-chat && cd dify-chat
```

### 2. 下载配置文件

```bash
curl -O https://raw.githubusercontent.com/lexmin0412/dify-chat/main/docker-compose.yml
```

### 3. 修改配置

```bash
# 编辑配置文件, 需要配置 DATABASE_URL 为实际的数据库连接地址（MySql）
nano docker-compose.yml
```

### 4. 启动容器

```bash
docker-compose -f docker-compose.yml up -d
```

### 5. 访问应用

> serverip 是你的服务器 IP，如果是本机启动，直接使用 localhost 访问即可

- React App: http://serverip:5200
- Platform API: http://serverip:5300

## 二开后自行构建镜像

如果需要对 Dify Chat 进行二开，你需要 clone 源码并自行构建镜像。

### 1. Clone 代码仓库

```bash
git clone git@github.com:lexmin0412/dify-chat.git
```

### 2. 配置本地环境变量

复制 react-app 的环境变量配置文件：

```bash
cd packages/react-app
cp .env.template .env
```

复制 platform 的环境变量配置文件：

```bash
cd packages/platform
cp .env.template .env
```

注意：默认情况下，Dify Chat 使用 MySQL 进行应用配置的持久化存储，如果你需要配置其他类型的数据库，请查看 [使用其他数据库](/guide/deploy/db-config#2-使用其他数据库)。

### 3. 修改源码

修改代码并自测。

### 4. 基于本地代码构建镜像并启动

对于二开场景，我们准备了一个专用的 docker compose 配置文件，你可以直接使用，它会读取对应子包下的 .env 文件作为环境变量启动容器。

```bash
docker-compose -f docker-compose.dev.yml up -d
```
