import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rslib/core'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

const tsconfigDevPath = path.resolve(__dirname, './tsconfig.json')
const tsconfigProdPath = path.resolve(__dirname, './tsconfig.prod.json')

export default defineConfig({
	source: {
		entry: {
			index: ['./src/**'],
		},
		tsconfigPath: isDevelopment ? tsconfigDevPath : tsconfigProdPath,
	},
	lib: [
		{
			bundle: false,
			dts: true,
			format: 'esm',
		},
	],
	output: {
		target: 'web',
	},
	plugins: [pluginReact()],
})
