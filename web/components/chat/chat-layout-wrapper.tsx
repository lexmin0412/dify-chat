'use client'

import { DownCircleTwoTone } from '@ant-design/icons'
import { DEFAULT_APP_SITE_SETTING, IDifyAppItem, useDifyChatStore } from '@/lib/core'
import { useIsMobile } from '@/lib/helpers'
import { useMount, useRequest } from 'ahooks'
import { Button, Dropdown, Empty, message, Result, Spin } from 'antd'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { LucideIcon } from '@/components/chat/chatbox/exports'
import DebugMode from '@/components/chat/debug-mode'
import { useAuth } from '@/hooks/use-auth'
import appService from '@/services/app'
import { createDifyApiInstance, DifyApi } from '@/lib/dify-client'

import MainLayout from './main-layout'

const ChatLayoutInner = (props: { appList: IDifyAppItem[] }) => {
	const currentAppId = useDifyChatStore(s => s.currentAppId)
	const setCurrentAppId = useDifyChatStore(s => s.setCurrentAppId)
	const currentApp = useDifyChatStore(s => s.currentApp)
	const setCurrentApp = useDifyChatStore(s => s.setCurrentApp)
	const globalParams = useDifyChatStore(s => s.globalParams)
	const router = useRouter()
	const { appList } = props

	// DifyApi instance is kept as local state since it needs createDifyApiInstance
	const [difyApi, setDifyApi] = useState<DifyApi | null>(null)

	const { runAsync: getAppParameters } = useRequest(
		() => (difyApi as DifyApi).getAppParameters(),
		{ manual: true },
	)

	const { runAsync: getAppSiteSettting } = useRequest(
		() =>
			(difyApi as DifyApi)
				.getAppSiteSetting()
				.catch(err => {
					console.error(err)
					return DEFAULT_APP_SITE_SETTING
				}),
		{ manual: true },
	)

	const [initLoading, setInitLoading] = useState(false)

	useEffect(() => {
		if (difyApi) {
			const init = async () => {
				setInitLoading(true)
				const appItem = await appService.getAppByID(currentAppId!)
				if (!appItem) return
				const promises = [getAppParameters(), getAppSiteSettting()] as const
				Promise.all(promises)
					.then(res => {
						const [parameters, siteSetting] = res
						setCurrentApp({
							config: appItem,
							parameters: parameters!,
							site: siteSetting,
						} as any)
					})
					.catch(err => {
						message.error(`获取应用参数失败: ${err}`)
						console.error(err)
						setCurrentApp(null)
					})
					.finally(() => setInitLoading(false))
			}
			init()
		}
	}, [difyApi])

	if (!currentAppId || !difyApi) return null

	return (
		<>
			<MainLayout
				initLoading={initLoading}
				renderCenterTitle={() => (
					<div className="flex items-center overflow-hidden">
						<LucideIcon name="layout-grid" size={16} className="mr-1" />
						<span
							className="inline-block shrink-0 cursor-pointer"
							onClick={() => router.push('/apps')}
						>
							应用列表
						</span>
						{currentAppId ? (
							<div className="flex items-center overflow-hidden">
								<div className="text-desc mx-2 font-normal">/</div>
								<Dropdown
									arrow
									placement="bottom"
									trigger={['click']}
									menu={{
										selectedKeys: [currentAppId],
										items: (appList?.map(item => ({
											key: item.id,
											label: <div>{item.info.name}</div>,
											onClick: () => {
												router.push(`/chat/${item.id}`)
												setCurrentAppId(item.id)
											},
											icon: <LucideIcon name="bot" size={18} />,
										})) || []),
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
				)}
			/>
			<DebugMode />
		</>
	)
}

const ChatLayoutWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { userId } = useAuth()
	const [difyApi, setDifyApi] = useState<DifyApi | null>(null)
	const [appExists, setAppExists] = useState(true)
	const { t } = useTranslation()

	// Initialize globalParams from URL
	useEffect(() => {
		const isKeepAll = searchParams.get('isKeepAll')
		if (isKeepAll === 'true') {
			const params: Record<string, string> = {}
			searchParams.forEach((value, key) => {
				if (key !== 'isKeepAll') params[key] = value
			})
			useDifyChatStore.getState().setGlobalParams(params)
		}
	}, [])

	const [selectedAppId, setSelectedAppId] = useState<string>('')
	const [initLoading, setInitLoading] = useState(false)
	const [appList, setAppList] = useState<IDifyAppItem[]>([])

	const { appId } = useParams<{ appId: string }>()
	const [currentApp, setCurrentApp] = useState<any>()
	const [error, setError] = useState<Error | null>(null)

	const isMobile = useIsMobile()

	const { runAsync: getAppList } = useRequest(
		() => appService.getApps(),
		{
			manual: true,
			onSuccess: result => {
				flushSync(() => setAppList(result))
				if (isMobile && !result?.length) {
					router.replace('/apps')
					return
				}
				if (appId) {
					setSelectedAppId(appId as string)
				} else if (!selectedAppId && result?.length) {
					setSelectedAppId(result[0]?.id || '')
				}
			},
			onError: error => {
				setError(error)
				console.error(error)
			},
			onFinally: () => setInitLoading(false),
		},
	)

	const initApp = async (id: string) => {
		try {
			setError(null)
			const appItem = await appService.getAppByID(id)
			if (!appItem) { setAppExists(false); return }
			setDifyApi(createDifyApiInstance({
				user: userId,
				...appItem.requestConfig,
			}) as DifyApi)
			setAppExists(true)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		}
	}

	useEffect(() => {
		if (selectedAppId) initApp(selectedAppId)
	}, [selectedAppId])

	useMount(() => getAppList())

	if (error) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Result status="500" title="加载失败" subTitle={error.message} extra={<Button type="primary" onClick={() => window.location.reload()}>刷新页面</Button>} />
			</div>
		)
	}

	if (initLoading || (!difyApi && appExists)) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spin size="large" tip="应用加载中..." />
			</div>
		)
	}

	if (!difyApi) return null

	if (!selectedAppId || !appExists) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Empty description={t('app.no_config_default_text')} />
			</div>
		)
	}

	// Set Zustand store before rendering children
	useDifyChatStore.getState().setCurrentAppId(selectedAppId)
	useDifyChatStore.getState().setCurrentApp(currentApp)
	useDifyChatStore.getState().setAppLoading(initLoading)

	return <ChatLayoutInner appList={appList} />
}

export default ChatLayoutWrapper
