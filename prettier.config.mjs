/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export default {
	plugins: ['prettier-plugin-tailwindcss', '@trivago/prettier-plugin-sort-imports'],
	printWidth: 100,
	useTabs: true,
	tabWidth: 2,
	semi: false,
	singleQuote: true,
	quoteProps: 'as-needed',
	jsxSingleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'avoid',
	proseWrap: 'never',
	htmlWhitespaceSensitivity: 'css',
	vueIndentScriptAndStyle: false,
	endOfLine: 'lf',
	embeddedLanguageFormatting: 'auto',
	singleAttributePerLine: true,
	importOrder: ['<THIRD_PARTY_MODULES>', '^src/(.*)$', '^@/(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,
	overrides: [
		{
			files: ['*.md', '.yaml'],
			options: {
				useTabs: false,
			},
		},
		// 支持 ts 装饰器语法
		{
			files: ['*.ts', '*.tsx'],
			options: {
				parser: 'babel-ts',
			},
		},
	],
}
