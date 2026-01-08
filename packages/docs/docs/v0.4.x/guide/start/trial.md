# 30 秒试用

为方便演示，我们在 Github Pages 上部署了一个多应用模式的 React SPA 版本，你可以访问 https://lexmin0412.github.io/dify-chat/ 体验。

点击以上链接，你会看到应用列表的初始界面：

![初始界面](/apps_init.png)

## 准备

首先，你需要在 Dify 控制台获取几个关键变量：

| 变量 | 说明 |
| --- | --- |
| API Base | Dify API 请求前缀, 如果你使用的是 Dify 官方提供的云服务，则为 `https://api.dify.ai/v1` |
| Api Key | Dify API 密钥，用于访问对应应用的 API, Dify 应用和 API 密钥是一对多的关系 |

进入 Dify 的应用详情，点击左侧的 `访问 API`：

![获取域名和前缀](/get_api_base.png)

`API 服务器` 后展示的域名即为 `API Base` 变量的值。

点击右侧的 `API 密钥` 按钮，即可看到 API Key 的管理弹窗：

![获取 API Key](/get_api_key_entry.png)

你可以选择创建一个新的 API Key，或者复制现有的 API Key。

![获取 API Key](/get_api_key.png)

完成以上步骤后，我们将会得到如下信息：

- API Base: `https://api.dify.ai/v1` OR `${SELF_HOSTED_API_DOMAIN}/v1`
- API Key: `app-YOUR_API_KEY`

## 添加应用配置

点击页面底部的 "添加应用配置" 按钮：

![添加应用配置按钮](/guide_mtapp_setting.png)

依次填入应用信息：

- 请求配置：在上一步中获取的 API Base 和 API Secret
- 应用类型：默认是聊天助手，如果是其他类型应用，需要切换到对应的类型
- 其他配置非必需，先保持默认值，后续需要再编辑即可

![添加应用配置抽屉-已填入信息](/guide_mtapp_setting_add_fulfilled.png)

点击确定按钮，提示 “添加配置成功”，在应用列表中会多出一条数据：

![添加应用配置成功](/guide_mtapp_setting_add_success.png)

此时你可以点击应用卡片右上角的 "更多" 图标，对应用进行编辑和删除操作：

![应用卡片操作](/guide_mtapp_app_actions.png)

点击应用卡片，即可进入应用详情页开始对话了～

![主界面](/guide_mtapp_main.png)
