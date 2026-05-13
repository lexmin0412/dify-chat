# 初步体验

为方便演示，我们在 Github Pages 上部署了一个调试模式的应用，你可以点击 https://lexmin0412.github.io/dify-chat 来访问。

> 在调试模式下，Dify Chat 不会将你填入的任何信息上传到开发者服务器，所有数据都缓存在本地，前端页面直接与 Dify API 对接，你可以放心体验。

进入演示站点后，你会看到应用列表的初始界面, 页面右下角有一个调试按钮。

![初始界面](/guide__debug_mode_main.png)

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

## 填写应用配置

点击页面右下角的 "调试按钮"：

![调试模式按钮](/guide__debug_mode_button.png)

可以看到调试模式的数据配置抽屉, 点击输入框下方的 "使用示例配置" 按钮：

![使用示例配置按钮](/guide__debug_mode_use_sample_data_button.png)

依次填入你的 apiBase 和 apiKey：

![添加应用配置抽屉-填入信息](/guide__debug_mode_data_fulfilled.png)

点击下方的 "保存配置" 按钮，提示 “调试配置保存成功”，在应用列表中会多出一条数据：

![调试配置保存成功](/guide__debug_mode_save_success.png)

点击应用卡片，即可进入应用详情页开始对话了～

![主界面](/guide__sample_chat_main.png)
