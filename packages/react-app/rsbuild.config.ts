import { defineConfig } from '@rsbuild/core'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSourceBuild } from '@rsbuild/plugin-source-build'
import path from 'path'
import tailwindcss from 'tailwindcss'

const tsconfigDevPath = path.resolve(__dirname, './tsconfig.json')
const tsconfigProdPath = path.resolve(__dirname, './tsconfig.prod.json')

export default defineConfig({
	source: {
		tsconfigPath: process.env.NODE_ENV === 'development' ? tsconfigDevPath : tsconfigProdPath,
		include: [{ not: /[\\/]core-js[\\/]/ }],
		// 把 .env 中的变量注入到 process.env，供前端代码读取
		define: {
			'process.env.PUBLIC_DEBUG_MODE': JSON.stringify(process.env.PUBLIC_DEBUG_MODE ?? ''),
			'process.env.PUBLIC_APP_API_BASE': JSON.stringify(process.env.PUBLIC_APP_API_BASE ?? ''),
			'process.env.PUBLIC_DIFY_PROXY_API_BASE': JSON.stringify(
				process.env.PUBLIC_DIFY_PROXY_API_BASE ?? '',
			),
		},
	},
	output: {
		polyfill: 'entry',
	},
	html: {
		template: path.resolve(__dirname, './public/template.html'),
		favicon: path.resolve(__dirname, './public/logo.png'),
	},
	plugins: [
		pluginSourceBuild(),
		pluginReact(),
		pluginLess({
			lessLoaderOptions: {
				lessOptions: {
					plugins: [],
					javascriptEnabled: true,
				},
			},
		}),
	],
	server: {
		compress: false, // 解决代理后流式输出失效的问题
		base: '/dify-chat',
		port: 5300,
		// 允许外部访问
		host: '0.0.0.0',
	},
	tools: {
		postcss: {
			postcssOptions: {
				plugins: [tailwindcss()],
			},
		},
	},
})
