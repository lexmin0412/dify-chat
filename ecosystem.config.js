module.exports = {
	apps: [
		{
			name: 'dify-app-hub',
			script: 'node_modules/.bin/next',
			args: 'start',
			env: {
				NODE_ENV: 'production',
				PORT: 5300,
			},
			instances: 1,
			exec_mode: 'fork',
			watch: false,
			max_memory_restart: '1G',
			error_file: './logs/app-error.log',
			out_file: './logs/app-out.log',
			log_file: './logs/app-combined.log',
			time: true,
			autorestart: true,
			max_restarts: 10,
			min_uptime: '10s',
		},
	],
}
