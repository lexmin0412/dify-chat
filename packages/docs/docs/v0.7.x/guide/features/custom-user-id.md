# 自定义 User ID

在调用大部分 Dify API 时，需要传入 `userId`，用于标识用户身份。

默认情况下，Dify Chat 会使用 `FingerprintJS` 生成一个唯一的用户 ID，并将其作为 `userId` 参数传入。

如果你希望控制 `userId` 的生成逻辑，可以修改 `mockLogin` 函数，自定义登录逻辑：

```tsx title="packages/react-app/src/pages/auth/index.tsx"
/**
 * 模拟登录
 */
const mockLogin = async () => {
	const fp = await FingerPrintJS.load()
	const result = await fp.get()
	return await new Promise<{ userId: string }>(resolve => {
		setTimeout(() => {
			resolve({
				userId: result.visitorId,
			})
		}, 2000)
	})
}
```
