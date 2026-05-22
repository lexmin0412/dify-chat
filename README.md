![Dify Chat](./media/banner.png)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/lexmin0412/dify-chat) [![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/lexmin0412/dify-chat) ![GitHub License](https://img.shields.io/github/license/lexmin0412/dify-chat) ![GitHub Created At](https://img.shields.io/github/created-at/lexmin0412/dify-chat) ![GitHub contributors](https://img.shields.io/github/contributors/lexmin0412/dify-chat) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/lexmin0412/dify-chat)![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/lexmin0412/dify-chat)[![All Contributors](https://img.shields.io/github/all-contributors/lexmin0412/dify-chat?color=ee8449&style=flat-square)](#contributors) [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/lexmin0412/dify-chat/badge)](https://scorecard.dev/viewer/?uri=github.com/lexmin0412/dify-chat)

**Dify Chat** 是一个 Dify 应用管理平台，基于 Dify API 构建，提供深度优化的用户端交互界面，支持 Chatflow、Workflow 等多种 Dify 应用类型，适配深度思考、思维链、图表渲染、文件处理等丰富的 AI 输出形式，提供开箱即用的 AI 应用解决方案。

如果你觉得这个项目还不错的话，请动动你的小手指点个 Star ⭐️ 吧～

> [!WARNING] **main 分支正在进行大范围技术重构，代码处于不稳定状态。**
>
> 如果你需要部署到生产环境，请使用 [v0.7.1 Release](https://github.com/lexmin0412/dify-chat/releases/tag/v0.7.1) 版本。
>
> ```shell
> curl -O https://raw.githubusercontent.com/lexmin0412/dify-chat/v0.7.1/docker-compose.yml
> ```

## 快速开始

使用 Docker Compose 启动 `Dify Chat` 是最便捷的方式。在执行以下命令前，请确保你的机器已安装 Docker 和 Docker Compose：

```shell
# 创建项目目录并进入
mkdir dify-chat && cd dify-chat
# 下载 Docker Compose 文件
curl -O https://raw.githubusercontent.com/lexmin0412/dify-chat/main/docker-compose.yml
# 修改环境变量，主要是 DATABASE_URL
nano docker-compose.yml
# 启动服务
docker compose up -d
```

更多部署方式，详见 [官方文档](https://lexmin0412.github.io/dify-chat-docs/guide/deploy/docker-compose.html)。

## 相关链接

官方站点：

- 使用文档：[https://lexmin0412.github.io/dify-chat-docs/](https://lexmin0412.github.io/dify-chat-docs/)
- 演示站点：[https://lexmin0412.github.io/dify-chat/](https://lexmin0412.github.io/dify-chat/)

另外，如果你想要了解整个项目的架构或技术细节，推荐访问：

- DeepWiki: [https://deepwiki.com/lexmin0412/dify-chat](https://deepwiki.com/lexmin0412/dify-chat)
- Zread: [https://zread.ai/lexmin0412/dify-chat](https://zread.ai/lexmin0412/dify-chat)

| 加群沟通（人数已超只能邀请，加我微信备注来意） | 喂我花生（请在留言中备注自己的 Github 用户名哦） |
| --- | --- |
| <img src="https://github.com/user-attachments/assets/63daca4a-5583-487b-9329-aed87decc61a" alt="wechat-group" style="width: 400px; height: 400px" /> | <img src="https://github.com/user-attachments/assets/f56d53b7-8529-4a1d-a0ce-27bfe60510ec" alt="sponsor" style="width: 400px; height: 400px" /> |

## 🥇 Sponsors

<img width="1908" height="1618" alt="image" src="https://github.com/user-attachments/assets/3df5561d-ab54-4278-8c7c-4f66756421f6" />

## Repobeats

![Alt](https://repobeats.axiom.co/api/embed/cd9a078e6a4a70289aa28870d4934f6757d2fd4f.svg 'Repobeats analytics image')

## Contributors

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-9-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Amourtani"><img src="https://avatars.githubusercontent.com/u/48053221?v=4?s=100" width="100px;" alt="子休"/><br /><sub><b>子休</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/commits?author=Amourtani" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Renderz"><img src="https://avatars.githubusercontent.com/u/17194685?v=4?s=100" width="100px;" alt="jiAng"/><br /><sub><b>jiAng</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/commits?author=Renderz" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GavinZha0"><img src="https://avatars.githubusercontent.com/u/88469005?v=4?s=100" width="100px;" alt="Gavin Zhao"/><br /><sub><b>Gavin Zhao</b></sub></a><br /><a href="#ideas-GavinZha0" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-GavinZha0" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ranzhengfeng"><img src="https://avatars.githubusercontent.com/u/204541953?v=4?s=100" width="100px;" alt="ranzhengfeng"/><br /><sub><b>ranzhengfeng</b></sub></a><br /><a href="#example-ranzhengfeng" title="Examples">💡</a> <a href="#tutorial-ranzhengfeng" title="Tutorials">✅</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ARShl"><img src="https://avatars.githubusercontent.com/u/8003750?v=4?s=100" width="100px;" alt="ArsHl"/><br /><sub><b>ArsHl</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/commits?author=ARShl" title="Code">💻</a> <a href="#design-ARShl" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hitechbeijing"><img src="https://avatars.githubusercontent.com/u/9780601?v=4?s=100" width="100px;" alt="hitechbeijing"/><br /><sub><b>hitechbeijing</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/commits?author=hitechbeijing" title="Code">💻</a> <a href="#example-hitechbeijing" title="Examples">💡</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://saowu.top/"><img src="https://avatars.githubusercontent.com/u/33569619?v=4?s=100" width="100px;" alt="saowu"/><br /><sub><b>saowu</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/commits?author=saowu" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SickoGt"><img src="https://avatars.githubusercontent.com/u/17882380?v=4?s=100" width="100px;" alt="Sicko"/><br /><sub><b>Sicko</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/commits?author=SickoGt" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/HZJprince"><img src="https://avatars.githubusercontent.com/u/8064272?v=4?s=100" width="100px;" alt="HZJprince"/><br /><sub><b>HZJprince</b></sub></a><br /><a href="https://github.com/lexmin0412/dify-chat/issues?q=author%3AHZJprince" title="Bug reports">🐛</a> <a href="#design-HZJprince" title="Design">🎨</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## 特性

- 📦 开箱即用：运行启动脚本，填入 Dify API Key，直接开始使用
- 👏 完全开源：采用 MIT 开源协议，所有源代码完全开放
- 💃 灵活架构：你可以只部署轻量前端应用，也可以集成全栈 Platform 服务以获取完整功能
- 📱 响应式设计：确保在不同屏幕尺寸下都能提供一致的用户体验和功能表现
- 📝 支持渲染图片、视频、代码、图表等丰富的交互性内容，让 AI 自由发挥。

## 技术栈

- React v19
- Next.js v16 (App Router)
- Ant Design v6
- Ant Design X v1
- Rsbuild v1
- Tailwind CSS (v3 in react-app and v4 in platform)
- TypeScript v5

## 运行环境

本地开发/生产部署均需满足以下要求：

- Node.js ^22.21.1
- pnpm ^10.8.1

> 注意：本项目使用了 pnpm workspace 高级特性来实现 Monorepo 管理，其他包管理工具可能无法正常工作，请先确保你的环境满足以上要求。

## License

[MIT](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lexmin0412/dify-chat&type=Date)](https://www.star-history.com/#lexmin0412/dify-chat&Date)
