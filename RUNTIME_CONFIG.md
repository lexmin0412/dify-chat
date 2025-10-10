# 运行时配置功能

本文档介绍了 dify-chat-react 项目的运行时配置功能，允许您在不重新构建镜像的情况下，在不同的环境中使用不同的配置参数。

## 功能特性

- **一次构建，多环境运行**：构建一次 Docker 镜像，通过环境变量配置不同环境
- **配置优先级**：运行时环境变量 > 构建时环境变量 > 硬编码默认值
- **实时配置**：通过 HTTP 端点提供配置信息，支持 JavaScript 动态加载
- **向后兼容**：完全兼容现有的构建时配置方式

## 支持的配置参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PUBLIC_DEBUG_MODE` | boolean | `false` | 是否启用调试模式 |
| `PUBLIC_APP_API_BASE` | string | `http://localhost:5300/api/client` | API 基础地址 |
| `PUBLIC_DIFY_PROXY_API_BASE` | string | `http://localhost:5300/api/client/dify` | DIFY 代理 API 基础地址 |

## 使用方法

### 1. Docker Compose 部署

```bash
# 使用默认配置
docker-compose up --build

# 使用自定义环境变量
PUBLIC_DEBUG_MODE=true PUBLIC_APP_API_BASE=https://api.example.com docker-compose up --build
```

### 2. Docker 直接部署

#### 构建镜像
```bash
docker build -f Dockerfile_react_app -t dify-chat-app-react:latest .
```

#### 运行容器（使用默认配置）
```bash
docker run -d -p 5200:80 --name dify-chat-app-react dify-chat-app-react:latest
```

#### 运行容器（使用自定义配置）
```bash
docker run -d -p 5200:80 \
  -e PUBLIC_DEBUG_MODE=true \
  -e PUBLIC_APP_API_BASE=https://api.example.com \
  -e PUBLIC_DIFY_PROXY_API_BASE=https://dify.example.com \
  --name dify-chat-app-react dify-chat-app-react:latest
```

### 3. 环境变量配置文件

项目包含 `.env` 文件，默认配置如下：
```bash
PUBLIC_DEBUG_MODE=false
PUBLIC_APP_API_BASE=http://localhost:5300/api/client
PUBLIC_DIFY_PROXY_API_BASE=http://localhost:5300/api/client/dify
```

Docker Compose 会自动读取 `.env` 文件中的配置。

## 工作原理

1. **容器启动时**：启动脚本读取环境变量，设置默认值
2. **Nginx 配置生成**：使用 `envsubst` 将环境变量注入到 Nginx 配置文件中
3. **配置端点**：Nginx 提供 `/dify-chat/config.js` 端点，返回运行时配置
4. **客户端加载**：HTML 页面加载时，通过 `<script>` 标签加载配置
5. **应用使用**：应用通过 `runtime-config.ts` 工具获取配置参数

## 配置优先级

配置参数的优先级从高到低：

1. **运行时环境变量**：容器启动时传入的环境变量
2. **构建时环境变量**：构建时通过 `--build-arg` 传入的参数
3. **硬编码默认值**：代码中的默认值

## 访问地址

- **应用地址**：http://localhost:5200/dify-chat/
- **配置端点**：http://localhost:5200/dify-chat/config.js
- **健康检查**：http://localhost:5200/health

## 开发说明

### 运行时配置工具

位于 `packages/react-app/src/utils/runtime-config.ts`，提供以下方法：

```typescript
import { getDebugMode, getApiBase, getDifyProxyApiBase } from '@/utils/runtime-config'

// 获取调试模式状态
const debugMode = getDebugMode()

// 获取 API 基础地址
const apiBase = getApiBase()

// 获取 DIFY 代理 API 基础地址
const difyApiBase = getDifyProxyApiBase()
```

### Nginx 配置模板

位于 `packages/react-app/docker/nginx.conf.template`，支持环境变量替换：

```nginx
# 运行时配置端点
location /dify-chat/config.js {
    add_header Content-Type application/javascript;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    access_log off;
    return 200 'window.APP_CONFIG = {
        PUBLIC_DEBUG_MODE: "${PUBLIC_DEBUG_MODE}",
        PUBLIC_APP_API_BASE: "${PUBLIC_APP_API_BASE}",
        PUBLIC_DIFY_PROXY_API_BASE: "${PUBLIC_DIFY_PROXY_API_BASE}"
    };';
}
```

## 故障排除

### 1. 配置未生效
检查容器启动日志，确认环境变量是否正确设置：
```bash
docker logs dify-chat-app-react
```

### 2. 配置端点无法访问
确认 Nginx 配置是否正确生成：
```bash
docker exec dify-chat-app-react cat /etc/nginx/conf.d/default.conf
```

### 3. 应用配置错误
检查浏览器控制台，确认 `window.APP_CONFIG` 是否正确加载：
```javascript
console.log(window.APP_CONFIG)
```

## 贡献指南

如果您想为运行时配置功能贡献代码，请：

1. 创建功能分支：`git checkout -b feature/runtime-config`
2. 实现功能并测试
3. 提交 PR：`git push origin feature/runtime-config`
4. 创建 Pull Request 到主分支

## 许可证

本功能遵循项目主许可证。