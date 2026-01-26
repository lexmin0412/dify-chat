import { loadEnv } from './lib/load-env'

/**
 * 应用启动入口
 */
export function register() {
	console.time('加载环境变量耗时')
	loadEnv()
	console.timeEnd('加载环境变量耗时')
}
