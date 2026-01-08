/**
 * @type {import('lint-staged').Configuration}
 */
export default {
	'*.{js,jsx,ts,tsx,mjs,cjs}': ['oxlint', 'oxfmt'],
	'*.{css,less}': ['oxfmt'],
	'*.{json,jsonc,html,yml,yaml,md}': ['oxfmt'],
}
