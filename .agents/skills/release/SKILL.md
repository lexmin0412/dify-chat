---
name: dify-app-hub-release
description: 手动发布 Dify App Hub 的完整操作流程。覆盖版本号更新、Git Tag 推送（触发 Docker 自动构建）、GitHub Release 创建。当用户说"发布新版本"、"打 tag 发版"、"执行发布流程"或"创建 release"时使用。
---

# Dify App Hub 手动发布流程

目标：执行完整的 Dify App Hub 版本发布。

## 约束

- 所有子包均为 `private: true`，不发布 npm 包，发布指创建 GitHub Release + Docker 镜像。
- 三个 `package.json` 的 `version` 必须保持一致。
- Tag 推送后 CI 自动构建 Docker 镜像并推送，无需手动执行。
- Release Notes 需包含：新增特性、架构变更、迁移注意事项（如有）。

## 执行步骤

### 1. 更新版本号

修改以下 3 个文件的 `version` 字段为同一值：

- `package.json`（根目录）
- `web/package.json`
- `packages/docs/package.json`

### 2. 提交并打 Tag

```bash
git add package.json web/package.json packages/docs/package.json
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```

Tag 推送后 CI 自动构建 Docker 镜像（`.github/workflows/docker-build-push.yaml`）。

### 3. 确认并创建 GitHub Release

向用户展示待创建的版本信息（tag 名称、Release Notes 要点），确认后执行：

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "在此填写 Release Notes"
```

## 相关文件

- `package.json`（根目录、web/、packages/docs/）— 版本号
- `.github/workflows/docker-build-push.yaml` — Tag 触发 Docker 构建
- `scripts/docker-build.sh` — 构建脚本（由 CI 调用）
