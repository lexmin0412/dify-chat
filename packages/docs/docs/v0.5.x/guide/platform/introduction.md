# Dify Chat Platform

Dify Chat Platform 是在 v0.5.0 中新增的一个子包，它是一个基于 Dify 平台的应用平台，提供了以下功能：

- 应用配置的增删改查（支持持久化存储）
- 可供客户端访问的应用配置 API
- Dify API 的代理服务，客户端可以通过一个 appID 和 Platform 交互，规避 Dify API Key 的泄露问题

在 [一键启动](/guide/quick-start/one-key-start.md) 中，我们已经完成了整个应用的启动，并创建了管理员账号。使用管理员账号登录后，你可以看到如下的界面：

![Platform首页](/guide__platform_app_init.png)

点击新增按钮，填写 API Base 和 Key, 新增一个应用：

![新增应用](/guide__platform_add_app.png)

点击确定后，你可以在应用列表中看到新增的应用：

![应用列表](/guide__platform_add_app_success.png)

回到前端应用刷新页面，你就可以看到新增的应用了。
