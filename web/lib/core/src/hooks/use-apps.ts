import React, { useContext } from 'react'

import { EIsEnabled } from '../enums'
import { IDifyAppItem } from '../repository'
import { IDifyAppParameters, IDifyAppSiteSetting } from '../types'

export interface ICurrentApp {
	config: IDifyAppItem
	/**
	 * 应用参数
	 */
	parameters: IDifyAppParameters
	/**
	 * 应用 WebApp 设置, 需要 Dify >= 1.4.0
	 */
	site?: IDifyAppSiteSetting
}

export interface IAppContext {
	appLoading?: boolean
	currentAppId?: string
	setCurrentAppId: (appId: string) => void
	currentApp?: ICurrentApp
	setCurrentApp: (app: ICurrentApp | undefined) => void
}

/**
 * 应用的默认 WebApp 设置
 */
export const DEFAULT_APP_SITE_SETTING: IDifyAppSiteSetting = {
	title: '',
	chat_color_theme: '',
	chat_color_theme_inverted: false,
	icon_type: 'emoji',
	icon: '',
	icon_background: '',
	icon_url: '',
	description: '',
	copyright: '',
	default_language: '',
	privacy_policy: '',
	custom_disclaimer: '',
	show_workflow_steps: false,
	use_icon_as_answer_icon: false,
}

const DEFAULT_APP_CONTEXT: IAppContext = {
	currentAppId: '',
	setCurrentAppId: () => {},
	appLoading: false,
	currentApp: {
		config: {
			id: '',
			isEnabled: EIsEnabled.enabled,
			info: {
				name: '',
				description: '',
				tags: [],
			},
			requestConfig: {
				apiBase: '',
				apiKey: '',
			},
		},
		parameters: {
			opening_statement: '',
			user_input_form: [],
			suggested_questions: [],
			suggested_questions_after_answer: {
				enabled: false,
			},
			file_upload: {
				enabled: false,
				allowed_file_extensions: [],
				allowed_file_types: [],
				allowed_file_upload_methods: [],
				number_limits: 1,
				image: {
					enabled: false,
					number_limits: 3,
					transfer_methods: ['local_file', 'remote_url'],
				},
				fileUploadConfig: {
					file_size_limit: 0,
					batch_count_limit: 0,
					image_file_size_limit: 0,
					video_file_size_limit: 0,
					audio_file_size_limit: 0,
					workflow_file_upload_limit: 0,
				},
			},
			text_to_speech: {
				enabled: false,
				autoPlay: 'enabled',
				language: '',
				voice: '',
			},
			speech_to_text: {
				enabled: false,
			},
		},
		site: {
			title: '',
			chat_color_theme: '',
			chat_color_theme_inverted: false,
			icon_type: 'emoji',
			icon: '',
			icon_background: '',
			icon_url: '',
			description: '',
			copyright: '',
			default_language: '',
			privacy_policy: ',',
			custom_disclaimer: '',
			show_workflow_steps: false,
			use_icon_as_answer_icon: false,
		},
	},
	setCurrentApp: () => {},
}

export const AppContext = React.createContext<IAppContext>(DEFAULT_APP_CONTEXT)

export const AppContextProvider = AppContext.Provider

/**
 * 获取应用上下文
 */
export const useAppContext = () => {
	return useContext(AppContext)
}
