import { Space, Divider } from 'antd'
import { useHistory } from 'pure-react-router'
import { HeaderLayout } from '@/components'
import { LucideIcon } from '@/components'


export default function Header() {
    const history = useHistory()
    return (
        <HeaderLayout
            title={

                <Space split={<Divider type="vertical" />}>
                    <div className="flex items-center cursor-pointer hover:border-blue-500 transition-all duration-200" onClick={() => history.push('/app-markets')}>
                        <LucideIcon
                            name="aperture"
                            size={16}
                            className="mr-1"
                        />
                        应用市场
                    </div>
                    <div className="flex items-center cursor-pointer hover:border-blue-500 transition-all duration-200" onClick={() => history.push('/apps')}>
                        <LucideIcon
                            name="layout-grid"
                            size={16}
                            className="mr-1"
                        />
                        工作空间
                    </div>
                </Space>
            }
        />
    )
}