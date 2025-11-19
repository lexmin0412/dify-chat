import React, { useState } from 'react'
import { Button, Dropdown, MenuProps, Avatar, Space, Tooltip } from 'antd'
import { User,  Settings, Info, Github, BookOpen, Map, ExternalLink } from 'lucide-react'
import { useHistory } from 'pure-react-router'
import { useGlobalStore } from '@/store'
import { useAuth } from '@/hooks/use-auth'
import { UserOutlined } from '@ant-design/icons'

// Mock user profile data
const mockUserProfile = {
  name: 'Demo User',
  email: 'demo@example.com',
  avatar_url: 'http://192.168.31.84:5200/dify-chat/static/image/logo.8ef08883.png',
}

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
    // {
    //   key: 'profile',
    //   label: (
    //     <div className="flex items-center gap-2 px-2 py-1">
    //       <User size={16} />
    //       <span>Profile</span>
    //     </div>
    //   ),
    //   onClick: () => history.push('/account'),
    // },
    {
      key: 'settings',
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      ),
      onClick: () => history.push('/settings'),
    },
    {
      key: 'about',
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <Info size={16} />
          <span>About</span>
        </div>
      ),
      onClick: () => history.push('/about'),
    },
    {
      key: 'docs',
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <BookOpen size={16} />
          <span>Documentation</span>
        </div>
      ),
      onClick: () => window.open('https://docs.dify.ai', '_blank'),
    },
    {
      key: 'github',
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <Github size={16} />
          <span>GitHub</span>
        </div>
      ),
      onClick: () => window.open('https://github.com/langgenius/dify', '_blank'),
    },
    {
      type: 'divider' as const,
    }
  ]

  return (
    <Dropdown
      menu={{ items: menuItems }}
    //   image={<UserOutlined />}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{ width: 200 }}
    >
      {/* <Tooltip title="Account Menu">
        <Button
          type="text"
          icon={<Avatar size={36} src={mockUserProfile.avatar_url} alt={mockUserProfile.name} />}
          className="p-1"
        />
      </Tooltip> */}
        <Button
          type="text"
        //   icon={<Avatar size={24} src={mockUserProfile.avatar_url} alt={mockUserProfile.name} />}
          icon={<UserOutlined />}
          className="p-1"
        />
    </Dropdown>
  )
}