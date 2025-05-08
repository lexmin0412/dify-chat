import { createDifyApiInstance, DifyApi } from '@dify-chat/api'
import { AppContextProvider, ICurrentApp, IDifyChatContextSingleApp } from '@dify-chat/core'
import { useDifyChat } from '@dify-chat/core'
import { useMount, useRequest } from 'ahooks'
import { Spin } from 'antd'
import React, { useState } from 'react'

import MainLayout from './main-layout'

const SingleAppLayout: React.FC = () => {
	const difyChatContext = useDifyChat()
	const { user, appConfig } = difyChatContext as IDifyChatContextSingleApp
	const [selectedAppId, setSelectedAppId] = useState('')
	const [initLoading, setInitLoading] = useState(false)
	const [currentApp, setCurrentApp] = useState<ICurrentApp>() // 新增 currentApp 状态用于保存当前应用的 inf

	const [difyApi] = useState(
		createDifyApiInstance({
			user,
			apiBase: '',
			apiKey: '',
		}),
	)

	const { runAsync: getAppParameters } = useRequest(
		(difyApi: DifyApi) => {
			return difyApi.getAppParameters()
		},
		{
			manual: true,
		},
	)

	const initInSingleMode = async () => {
		console.log('即将更新 options', {
			user,
			apiBase: (difyChatContext as IDifyChatContextSingleApp).appConfig.requestConfig.apiBase,
			apiKey: (difyChatContext as IDifyChatContextSingleApp).appConfig.requestConfig.apiKey,
		})
		difyApi.updateOptions({
			user,
			apiBase: (difyChatContext as IDifyChatContextSingleApp).appConfig.requestConfig.apiBase,
			apiKey: (difyChatContext as IDifyChatContextSingleApp).appConfig.requestConfig.apiKey,
		})
		setInitLoading(true)
		const difyAppInfo = await difyApi.getAppInfo()
		const appParameters = await getAppParameters(difyApi)
		// 获取应用信息
		setCurrentApp({
			config: {
				id: Math.random().toString(),
				info: difyAppInfo,
				...appConfig,
			},
			parameters: appParameters,
		})
		setInitLoading(false)
	}

	// 初始化获取应用列表
	useMount(() => {
		initInSingleMode()
	})

	if (initLoading) {
		return (
			<div className="absolute w-full h-full left-0 top-0 z-50 flex items-center justify-center">
				<Spin spinning />
			</div>
		)
	}

	return currentApp ? (
		<AppContextProvider
			value={{
				appLoading: initLoading,
				currentAppId: selectedAppId,
				setCurrentAppId: setSelectedAppId,
				currentApp: currentApp,
				setCurrentApp,
			}}
		>
			<MainLayout
				difyApi={difyApi}
				initLoading={false}
				renderCenterTitle={appInfo => {
					return <>{appInfo?.name}</>
				}}
			/>
		</AppContextProvider>
	) : null
}

export default SingleAppLayout
