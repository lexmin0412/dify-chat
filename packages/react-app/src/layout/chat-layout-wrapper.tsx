import { DownCircleTwoTone } from '@ant-design/icons'
import {
	AppContextProvider,
	DEFAULT_APP_SITE_SETTING,
	ICurrentApp,
	IDifyAppItem,
	useAppContext,
} from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { useMount, useRequest } from 'ahooks'
import { Dropdown, Empty, message } from 'antd'
import { useHistory, useParams } from 'pure-react-router'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

import { DebugMode, LucideIcon } from '@/components'
import { isDebugMode } from '@/components/debug-mode'
import { useAuth } from '@/hooks/use-auth'
import appService from '@/services/app'
import { useGlobalStore } from '@/store'
import { createDifyApiInstance, DifyApi } from '@/utils/dify-api'

import MainLayout from './main-layout'
import { useTranslation } from 'react-i18next'

const ChatLayoutInner = (props: { appList: IDifyAppItem[] }) => {
	const { currentAppId, setCurrentAppId, currentApp, setCurrentApp } = useAppContext()
	const history = useHistory()
	const { difyApi } = useGlobalStore()
	const { appList } = props

	const { runAsync: getAppParameters } = useRequest(
		() => {
			return (difyApi as DifyApi).getAppParameters()
		},
		{
			manual: true,
		},
	)

	const { runAsync: getAppSiteSettting } = useRequest(
		() => {
			return (difyApi as DifyApi)
				.getAppSiteSetting()
				.then(res => {
					return res
				})
				.catch(err => {
					console.error(err)
					console.warn(
						'Dify 版本提示: 获取应用 WebApp 设置失败，已降级为使用默认设置。如需与 Dify 配置同步，请确保你的 Dify 版本 >= v1.4.0',
					)
					return DEFAULT_APP_SITE_SETTING
				})
		},
		{
			manual: true,
		},
	)
	const [initLoading, setInitLoading] = useState(false)

	useEffect(() => {
		if (difyApi) {
			const init = async () => {
				setInitLoading(true)
				const appItem = await appService.getAppByID(currentAppId!)
				if (!appItem) {
					return
				}
				const getParameters = () => getAppParameters()
				const getSiteSetting = () => getAppSiteSettting()
				const promises = [getParameters(), getSiteSetting()] as const
				Promise.all(promises)
					.then(res => {
						const [parameters, siteSetting] = res
						setCurrentApp({
							config: appItem,
							parameters: parameters!,
							site: siteSetting,
						})
					})
					.catch(err => {
						message.error(`获取应用参数失败: ${err}`)
						console.error(err)
						setCurrentApp(undefined)
					})
					.finally(() => {
						setInitLoading(false)
					})
			}
			init()
		}
	}, [difyApi])

	if (!currentAppId || !difyApi) {
		return null
	}

	return (
		<>
			<MainLayout
				initLoading={initLoading}
				renderCenterTitle={() => {
					return (
						<div className="flex items-center overflow-hidden">
							<LucideIcon
								name="layout-grid"
								size={16}
								className="mr-1"
							/>
							<span
								className="inline-block shrink-0 cursor-pointer"
								onClick={() => {
									history.push('/apps')
								}}
							>
								应用列表
							</span>
							{currentAppId ? (
								<div className="flex items-center overflow-hidden">
									<div className="mx-2 font-normal text-desc">/</div>
									<Dropdown
										arrow
										placement="bottom"
										trigger={['click']}
										menu={{
											selectedKeys: [currentAppId],
											items: [
												...(appList?.map(item => {
													const isSelected = currentAppId === item.id
													return {
														key: item.id,
														label: (
															<div className={isSelected ? 'text-primary' : 'text-theme-text'}>
																{item.info.name}
															</div>
														),
														onClick: () => {
															history.push(`/app/${item.id}`)
															setCurrentAppId(item.id)
														},
														icon: (
															<LucideIcon
																name="bot"
																size={18}
															/>
														),
													}
												}) || []),
											],
										}}
									>
										<div className="flex flex-1 cursor-pointer items-center overflow-hidden">
											<span className="inline-block w-full cursor-pointer truncate">
												{currentApp?.config?.info?.name}
											</span>
											<DownCircleTwoTone className="ml-1" />
										</div>
									</Dropdown>
								</div>
							) : null}
						</div>
					)
				}}
			/>
			<DebugMode />
		</>
	)
}

const ChatLayoutWrapper = () => {
	const history = useHistory()
	const { userId } = useAuth()
	const { difyApi, setDifyApi } = useGlobalStore()
	const [appExists, setAppExists] = useState(true)
	const { t } = useTranslation()

	const [selectedAppId, setSelectedAppId] = useState<string>('')
	const [initLoading, setInitLoading] = useState(false)
	const [appList, setAppList] = useState<IDifyAppItem[]>([])

	const { appId } = useParams<{ appId: string }>()
	const [currentApp, setCurrentApp] = useState<ICurrentApp>()

	const { runAsync: getAppList } = useRequest(
		() => {
			console.log('获取应用列表？')
			setInitLoading(true)
			return appService.getApps()
		},
		{
			manual: true,
			onSuccess: result => {
				flushSync(() => {
					setAppList(result)
				})
				if (isMobile) {
					// 移动端如果没有应用，直接跳转应用列表页
					if (!result?.length) {
						history.replace('/apps')
						return Promise.resolve([])
					}
				}

				if (appId) {
					setSelectedAppId(appId as string)
				} else if (!selectedAppId && result?.length) {
					setSelectedAppId(result[0]?.id || '')
				}
			},
			onError: error => {
				message.error(`获取应用列表失败: ${error}`)
				console.error(error)
			},
			onFinally: () => {
				setInitLoading(false)
			},
		},
	)

	/**
	 * 初始化应用信息
	 */
	const initApp = async (appId: string) => {
		const appItem = await appService.getAppByID(appId)
		if (!appItem) {
			setAppExists(false)
			return
		}
		const newOptions = isDebugMode()
			? {
					user: userId,
					...appItem.requestConfig,
				}
			: {
					user: userId,
					...appItem.requestConfig,
					apiBase: `/${appId}`,
				}
		setDifyApi(null)
		setDifyApi(createDifyApiInstance(newOptions) as DifyApi)
		setAppExists(true)
	}

	useEffect(() => {
		if (selectedAppId) {
			initApp(selectedAppId)
		}
	}, [selectedAppId])

	const isMobile = useIsMobile()

	// 初始化获取应用列表
	useMount(() => {
		getAppList()
	})

	if (!difyApi) {
		return null
	}

	if (!selectedAppId || !appExists) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Empty description={t('app.no_config_default_text')} />
			</div>
		)
	}

	return (
		<AppContextProvider
			value={{
				appLoading: initLoading,
				currentAppId: selectedAppId,
				setCurrentAppId: setSelectedAppId,
				currentApp,
				setCurrentApp,
			}}
		>
			<ChatLayoutInner appList={appList} />
		</AppContextProvider>
	)
}

export default ChatLayoutWrapper
