import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				// Node.js globals
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				global: 'readonly',
				module: 'readonly',
				require: 'readonly',
				exports: 'readonly',
				// Browser globals
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				location: 'readonly',
				fetch: 'readonly',
				Response: 'readonly',
				Request: 'readonly',
				RequestInit: 'readonly',
				FormData: 'readonly',
				Headers: 'readonly',
				URL: 'readonly',
				URLSearchParams: 'readonly',
				ReadableStream: 'readonly',
				// React globals
				React: 'readonly',
				JSX: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			'@next/next': nextPlugin,
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,
			'no-unused-vars': 'off', // 关闭基础的 no-unused-vars 规则
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
]
