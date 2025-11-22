import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { User,  Settings, CircleUser } from 'lucide-react'
import { useHistory } from 'pure-react-router'
import { UserOutlined } from '@ant-design/icons'

export default function Account() {
  const history = useHistory()
//   const { globalParams, setGlobalParams } = useGlobalStore()
//   const { isAuthorized, goAuthorize } = useAuth()

//   const handleLogout = async () => {
//     // Clear local storage
//     localStorage.removeItem('setup_status')
//     localStorage.removeItem('console_token')
//     localStorage.removeItem('refresh_token')
//     if (localStorage.getItem('conversationIdInfo')) {
//       localStorage.removeItem('conversationIdInfo')
//     }

//     // Navigate to auth page
//     history.push('/auth')
//   }

  const menuItems: MenuProps['items'] = [
    {
      key: 'account',
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <User size={16} />
          <span>账户</span>
        </div>
      ),
      onClick: () => history.push('/account'),
    },
    {
      key: 'settings',
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <Settings size={16} />
          <span>设置</span>
        </div>
      ),
      onClick: () => {
        // TODO: Add event emitter or context to show settings modal from account page
        // For now, navigate to account page which has settings button
        history.push('/setting')
      },
    },
    // {
    //   key: 'about',
    //   label: (
    //     <div className="flex items-center gap-2 px-2 py-1">
    //       <Info size={16} />
    //       <span>About</span>
    //     </div>
    //   ),
    //   onClick: () => history.push('/about'),
    // },
    // {
    //   key: 'docs',
    //   label: (
    //     <div className="flex items-center gap-2 px-2 py-1">
    //       <BookOpen size={16} />
    //       <span>Documentation</span>
    //     </div>
    //   ),
    //   onClick: () => window.open('https://docs.dify.ai', '_blank'),
    // },
    // {
    //   key: 'github',
    //   label: (
    //     <div className="flex items-center gap-2 px-2 py-1">
    //       <Github size={16} />
    //       <span>GitHub</span>
    //     </div>
    //   ),
    //   onClick: () => window.open('https://github.com/langgenius/dify', '_blank'),
    // },
  ]

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{ width: 200 }}
      arrow
    >
      <Tooltip title="账户菜单">
        <Button
          type="text"
          // icon={<Avatar size={26} src={mockUserProfile.avatar_url} alt={mockUserProfile.name} icon={<UserOutlined />} />}
        //   icon={<UserOutlined size={36}/>}
          icon={<CircleUser size={24}/>}
          className="p-1"
          onClick={(e) => e.preventDefault()}
        />
      </Tooltip>
    </Dropdown>
  )
}