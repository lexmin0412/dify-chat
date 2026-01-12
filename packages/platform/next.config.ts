import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
	output: 'standalone',
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					// 支持跨域
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value:
							'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-USER-ID',
					},
				],
			},
		]
	},
	turbopack: {
		root: path.resolve(__dirname, '../../'),
	},
}

export default nextConfig
