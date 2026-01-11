# 通过 URL 参数预填入消息内容

在某些场景下，我们可能希望在第三方应用中嵌入 Dify Chat 的链接，在用户点击链接进入对话后自动将预定好的文字填充到输入框中。

## 实现原理

Dify Chat 会自动获取 URL 中的 `sender_text` 参数，当参数存在时，会将其 decode 并填充到输入框中。

## 如何使用

假设当前 Dify Chat 前端的基础路径为 `http://localhost:5200/dify-chat/`，我们希望在用户进入 Chat 后自动将 `hello` 填充到输入框中。

构建链接（指定应用 ID、预填入消息内容、是否开启新会话）：

```shell
http://localhost:5200/dify-chat/app/b38e598b-e766-44d5-895a-95415a1b9bfd?sender_text=hello&isNewCvst=1
```

你可以将这个链接嵌入到你的应用中，当用户点击该链接时，会自动跳转至 Dify Chat 页面，同时输入框中会自动填充 `hello`。

![sender_text_in_url](/guide__sender_text_in_url.png)

## 注意

- `sender_text` 参数的值会自动解码，因此可以包含特殊字符。
- `isNewCvst` 参数用于指定是否开启新会话，默认不开启，如果设置为 `1` 则会开启新会话。
