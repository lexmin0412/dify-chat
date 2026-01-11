# `@dify-chat/theme`

![version](https://img.shields.io/npm/v/@dify-chat/theme) ![NPM Last Update](https://img.shields.io/npm/last-update/@dify-chat/theme) ![NPM Downloads](https://img.shields.io/npm/dm/@dify-chat/theme)

`@dify-chat/theme` 是 Dify Chat 项目的主题包，它提供了一套主题管理的完整方案，包括主题上下文 hook、主题切换组件、主题状态管理等。

## 主要功能

- 主题模式切换（系统/浅色/深色）
- 完整的主题上下文管理
- 暗黑模式自动适配

## 安装

通过 npm/yarn/pnpm 安装：

```bash
# npm
npm install @dify-chat/theme

# yarn
yarn add @dify-chat/theme

# pnpm
pnpm add @dify-chat/theme
```

## API

### `<ThemeContextProvider />`

主题上下文容器。

> 说明：只有在上层组件使用了 `ThemeContextProvider` 包裹应用，才能在子组件中使用主题相关的功能。

在最外层组件中使用 `ThemeContextProvider` 包裹应用：

```tsx
import { ThemeContextProvider } from '@dify-chat/theme'
function App() {
	return (
		<ThemeContextProvider>
			<YourApp />
		</ThemeContextProvider>
	)
}
```

### `<ThemeSelector />`

主题选择器组件。

默认情况下，`ThemeContextProvider` 中已经提供了自适应系统主题的能力。如果你需要支持用户手动切换主题模式，可以引入主题选择器：

```tsx
import { ThemeSelector } from '@dify-chat/theme'

function App() {
	const { themeMode } = useThemeContext()
	return (
		<ThemeSelector>
			<Button>当前主题模式：{themeMode}</Button>
		</ThemeSelector>
	)
}
```

### `useThemeContext()`

获取主题上下文 hook。

返回值：

- `theme`: 当前应用的主题，值为 `'light' | 'dark'`
- `themeMode`: 当前主题模式，值为 `'light' | 'dark' | 'system'`
- `setThemeMode`: 设置主题模式，接受一个 `'light' | 'dark' | 'system'` 类型的参数

你可以使用 `useThemeContext` hook 获取当前应用的主题：

```tsx
import { useThemeContext } from '@dify-chat/theme'

function ThemeToggle() {
	const { theme } = useThemeContext()

	return <div>当前主题模式：{theme}</div>
}
```

也可以在组件中使用 `setThemeMode` 方法，自定义切换主题模式：

```tsx
import { useThemeContext } from '@dify-chat/theme'

function ThemeSwitcher() {
	const { themeMode, setThemeMode } = useThemeContext()
	return (
		<div>
			<h3>当前主题模式：{themeMode}</h3>

			<div>
				<Button onClick={() => setThemeMode('light')}>浅色模式</Button>
				<Button onClick={() => setThemeMode('dark')}>深色模式</Button>
				<Button onClick={() => setThemeMode('system')}>系统主题</Button>
			</div>
		</div>
	)
}
```

### 其他导出的成员

**枚举**

- `ThemeEnum`: 主题枚举
- `ThemeModeEnum`: 主题模式枚举
- `ThemeModeLabelEnum`: 主题模式文本枚举

**常量**

- `ThemeModeOptions` : 主题模式选项

**类型**

- `IThemeContext`: 主题上下文类型
- `IThemeMode`: 主题模式类型
- `ICurrentTheme`: 当前主题类型

使用示例:

```tsx
import { Select } from 'antd'
import { ThemeModeEnum, ThemeModeOptions } from '@dify-chat/theme'

function ThemeSwitcher() {
	const { themeMode, setThemeMode } = useThemeContext()
	return (
		<div>
			<h3>当前主题模式：{themeMode}</h3>
			<div>
				切换主题模式：
				<Select
					options={ThemeModeOptions}
					value={themeMode}
					onChange={value => setThemeMode(value as ThemeModeEnum)}
				/>
			</div>
		</div>
	)
}
```
