import { EntityTarget, ObjectLiteral } from 'typeorm'
import { getAppDataSource, initializeDataSource, closeDataSource } from './typeorm.config'

// 全局数据源实例
export const getRepository = async <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
	const dataSource = getAppDataSource()
	if (!dataSource.isInitialized) {
		await initializeDataSource()
	}
	return dataSource.getRepository(entity)
}

export { initializeDataSource, getAppDataSource, closeDataSource }
