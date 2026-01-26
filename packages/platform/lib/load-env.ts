import { loadEnvFile } from 'node:process'

/**
 * 通过 .env 加载环境变量，用于替代 dotenv 库
 * loadEnvFile API: https://nodejs.org/docs/v24.5.0/api/process.html#processloadenvfilepath
 */
export const loadEnv = () => {
	try {
		loadEnvFile()
	} catch (error) {
		console.warn('加载 .env 文件失败，请确保你通过其他方式注入了环境变量', error)
	}
}
