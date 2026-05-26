# iframe 嵌入

Dify Chat 支持通过 `<iframe>` 将聊天界面嵌入到任意网站中。

## 基本使用

将 `<iframe>` 的 `src` 指向部署地址即可：

```html
<iframe src="https://your-domain.com/chat/{appId}"></iframe>
```

其中 `{appId}` 替换为你的 Dify 应用 ID。

## 认证

默认情况下，Dify Chat 使用浏览器指纹（FingerPrintJS）自动生成用户标识，无需额外认证配置。

如果你需要更严格的用户认证，可以修改 `web/app/(user)/auth/page.tsx` 中的 `mockLogin` 函数，改为从 URL 参数或其他方式获取用户身份。

## 注意事项

- 部分浏览器（Safari、Firefox）在第三方 iframe 中会限制 localStorage/IndexedDB 访问。Dify Chat 已内置存储降级机制，当持久化存储不可用时自动切换到内存存储，不会白屏。
- 项目未设置 `X-Frame-Options` 头，不会主动阻止 iframe 嵌入。
- 暂不提供类似 Dify 官方的 `<script>` 标签注入 SDK，需要自行封装。
