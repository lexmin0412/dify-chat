import { Dropdown } from 'antd'
import { useThemeContext } from '../hooks'
import { ThemeModeEnum, ThemeModeLabelEnum } from '../constants'
import { DynamicIcon } from 'lucide-react/dynamic'

interface IThemeSelectorProps {
	children?: React.ReactNode
}

/**
 * 主题选择器组件
 */
export default function ThemeSelector(props: IThemeSelectorProps) {
	const { children } = props
	const { themeMode, setThemeMode } = useThemeContext()

	return (
		<Dropdown
			placement="bottomRight"
			menu={{
				selectedKeys: [themeMode],
				items: [
					{
						type: 'item',
						key: ThemeModeEnum.SYSTEM,
						label: ThemeModeLabelEnum.SYSTEM,
						icon: <DynamicIcon name="screen-share" />,
					},
					{
						type: 'item',
						key: ThemeModeEnum.LIGHT,
						label: ThemeModeLabelEnum.LIGHT,
						icon: <DynamicIcon name="sun" />,
					},
					{
						type: 'item',
						key: ThemeModeEnum.DARK,
						label: ThemeModeLabelEnum.DARK,
						icon: <DynamicIcon name="moon-star" />,
					},
				],
				onClick: item => {
					setThemeMode(item.key as ThemeModeEnum)
				},
			}}
		>
			{children}
		</Dropdown>
	)
}
