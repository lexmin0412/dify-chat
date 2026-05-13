import path from 'path'

export default {
	plugins: {
		tailwindcss: {
			config: path.join(__dirname, './tailwind.config.ts'),
		},
	},
}
