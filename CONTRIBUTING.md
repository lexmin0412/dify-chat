# Contributing

感谢你对 Dify Chat 的关注！

## 环境准备

```bash
# 需要 Node.js >=22.21.1, pnpm >=10.8.1
git clone https://github.com/lexmin0412/dify-chat
cd dify-chat
pnpm install
```

## 项目结构

```
web/                 # 主应用 (Next.js 16 + React 19)
packages/docs/       # 文档站点 (Rspress)
```

## 开发

```bash
pnpm dev:platform    # 启动主应用开发服务器 (端口 5300)
pnpm dev:docs        # 启动文档站点
```

## 提交规范

- 使用 husky + lint-staged，提交前自动运行 oxlint 和 oxfmt
- Commit message 使用 [Conventional Commits](https://www.conventionalcommits.org/)

## Pull Request 流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/xxx`)
3. 提交变更
4. Push 到你的 Fork
5. 发起 Pull Request 到 main 分支
