import { Dropdown } from 'antd'
import { useTranslation } from 'react-i18next'

import LucideIcon from '../lucide-icon'

const lngs = {
	en: { nativeName: 'English' },
	zh: { nativeName: '中文' },
} as const

/**
 * 国际化切换器
 */
function I18nSwitcher() {
	const { i18n } = useTranslation()

	return (
		<Dropdown
			arrow
			placement="bottomRight"
			menu={{
				items: Object.keys(lngs).map(lng => ({
					key: lng,
					label: lngs[lng].nativeName,
					onClick: () => i18n.changeLanguage(lng),
					className: lng === i18n.language ? '!text-primary' : '',
				})),
			}}
		>
			<div className="flex cursor-pointer items-center">
				<LucideIcon
					name="languages"
					size={20}
				/>
			</div>
		</Dropdown>
	)
}

export default I18nSwitcher
