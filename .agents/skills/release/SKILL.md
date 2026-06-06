---
name: dify-app-hub-release
description: 手动发布 Dify App Hub 的完整操作流程。覆盖版本号更新、Git Tag 推送（触发 Docker 自动构建）、GitHub Release 创建。当用户说"发布新版本"、"打 tag 发版"、"执行发布流程"或"创建 release"时使用。
---

# Dify App Hub 手动发布流程

## 发布类型

| 类型            | Tag 格式        | 示例            | 何时使用                             |
| --------------- | --------------- | --------------- | ------------------------------------ |
| **Beta 预发布** | `vX.Y.Z-beta.N` | `v0.8.0-beta.1` | 重大版本发布前验证 Docker 构建和部署 |
| **正式发布**    | `vX.Y.Z`        | `v0.8.0`        | 经过 beta 验证后的稳定版本           |

---

## Beta 预发布流程

### Beta.1 更新版本号

修改 2 个 `package.json` 的 `version` 为 beta 版本号（如 `0.8.0-beta.1`）：

- `package.json`（根目录，即主应用本身）
- `packages/docs/package.json`

### Beta.2 提交并打 Tag

```bash
git add package.json packages/docs/package.json
git commit -m "chore: bump version to vX.Y.Z-beta.N"
git tag vX.Y.Z-beta.N
git push && git push --tags
```

Tag 推送后 CI 自动构建并推送 Docker 镜像 `lexmin0412/dify-app-hub:vX.Y.Z-beta.N`，同时推送 `:beta` 标签。

### Beta.3 创建 Pre-release（仅首个 Beta）

首个 beta 版本（`.1`）需创建 GitHub Pre-release 包含变更要点。后续 beta 版本仅打 tag 推送 Docker 镜像即可，无需重复创建 Release。

```bash
# 仅在 beta.1 执行
gh release create vX.Y.Z-beta.1 \
  --title "vX.Y.Z-beta.1" \
  --notes-file docs/releases/draft-vX.Y.Z.md \
  --prerelease

# beta.2+ 跳过此步骤，仅 tag 推送即触发 Docker 构建
```

Release Notes 草稿位于 `docs/releases/draft-vX.Y.Z.md`，结构参考现有 `docs/releases/draft-v0.8.0.md`。正式发布的 Release Notes 需在开头的升级指南中添加迁移文档链接。

### Beta.4 验证清单

- [ ] Docker 镜像拉取成功：`docker pull lexmin0412/dify-app-hub:vX.Y.Z-beta.N`
- [ ] 容器启动后数据库迁移正常
- [ ] 核心功能可用（登录、应用管理、对话）

---

## 正式发布流程

> **前置条件**：已完成至少一次 Beta 预发布并验证通过。

### 约束

- 所有子包均为 `private: true`，不发布 npm 包，发布指创建 GitHub Release + Docker 镜像。
- 两个 `package.json`（根目录 + packages/docs）的 `version` 必须保持一致。
- Tag 推送后 CI 自动构建 Docker 镜像并推送，无需手动执行。
- Release Notes 需包含：新增特性、架构变更、迁移注意事项（如有），并在升级指南中附上迁移文档链接。
- 正式发布前建议备份数据库，尤其是涉及 Schema 变更的版本。

### 正式.1 更新版本号

修改 2 个 `package.json` 的 `version` 为正式版本号（如 `0.8.0`）：

- `package.json`（根目录，即主应用本身）
- `packages/docs/package.json`

### 正式.2 提交并打 Tag

```bash
git add package.json packages/docs/package.json
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```

Tag 推送后 CI 自动构建并推送 Docker 镜像 `lexmin0412/dify-app-hub:vX.Y.Z` 及 `:latest`。

### 正式.3 确认并创建 GitHub Release

向用户展示待创建的版本信息（tag 名称、Release Notes 要点），确认后执行：

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file docs/releases/draft-vX.Y.Z.md
```

> Release Notes 从 `docs/releases/draft-vX.Y.Z.md` 读取。

## 相关文件

- `package.json`（根目录 + packages/docs/）— 版本号
- `docs/releases/` — Release Notes 草稿
- `.github/workflows/docker-build-push.yaml` — Tag 触发 Docker 构建
- `docker-bake.hcl` — Docker Buildx Bake 构建配置（定义镜像标签规则）
