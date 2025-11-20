import React, { useState } from 'react'
import { Card, Typography, Button, Modal, Form, Input, message, Avatar, Row, Col, Switch, Divider, Layout } from 'antd'
import { UserOutlined, LockOutlined, SaveOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons'
import { useHistory } from 'pure-react-router'
import { IUser } from '@/types'
import { Header } from '@/components'

const { Title, Text } = Typography
const { Content } = Layout
const { Password } = Input

// Mock user data (to be replaced with API call)
const mockUserProfile: IUser = {
  id: '1',
  username: '张三',
  workspaceId: 'workspace-1',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  avatar: '',
  role: 'owner',
  joinTime: '2023-01-01T00:00:00Z'
}

const AccountPage: React.FC = () => {
  const history = useHistory()
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false)
  const [passwordForm] = Form.useForm()
  const [settingsForm] = Form.useForm()
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Handle password change modal visibility
  const showPasswordModal = () => {
    setIsPasswordModalVisible(true)
  }

  const handlePasswordCancel = () => {
    setIsPasswordModalVisible(false)
    passwordForm.resetFields()
  }

  // Handle settings modal visibility
  const showSettingsModal = () => {
    setIsSettingsModalVisible(true)
    // Load saved settings from localStorage
    const savedBackendUrl = localStorage.getItem('backendUrl')
    if (savedBackendUrl) {
      settingsForm.setFieldsValue({ backendUrl: savedBackendUrl })
    }
  }

  const handleSettingsCancel = () => {
    setIsSettingsModalVisible(false)
    settingsForm.resetFields()
  }

  // Handle password change form submission
  const handlePasswordChange = async (values: any) => {
    try {
      setPasswordLoading(true)
      // TODO: Replace with actual API call to change password
      console.log('Password change submitted:', values)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('密码修改成功')
      setIsPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch (error) {
      message.error('密码修改失败，请重试')
      console.error('Password change error:', error)
    } finally {
      setPasswordLoading(false)
    }
  }

  // Handle settings form submission
  const handleSettingsSave = async (values: any) => {
    try {
      setSettingsLoading(true)
      
      // Save settings to localStorage
      localStorage.setItem('backendUrl', values.backendUrl)
      
      // TODO: Replace with actual API call to update settings if needed
      console.log('Settings saved:', values)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      message.success('设置保存成功')
      setIsSettingsModalVisible(false)
      settingsForm.resetFields()
    } catch (error) {
      message.error('设置保存失败，请重试')
      console.error('Settings save error:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Format join time
  const formatJoinTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
      <Header />
      <Layout className="flex-1 overflow-hidden">
        <Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
          <div className="flex flex-col max-w-4xl mx-auto">
            {/* <div className="mb-6">
              <Title level={2} className="m-0">账户设置</Title>
            </div> */}

            {/* User Information Card */}
            <Card title="基本信息" className="mb-6 text-center">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex flex-col items-center">
                    <Avatar size={100} icon={<UserOutlined />} className="mb-4" />
                    <Title level={4} className="m-0">{mockUserProfile.username}</Title>
                    <Text type="secondary">{mockUserProfile.role === 'owner' ? '所有者' : '成员'}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Text strong className="w-24">用户名：</Text>
                      <Text>{mockUserProfile.username}</Text>
                    </div>
                    <div className="flex items-center">
                      <Text strong className="w-24">邮箱：</Text>
                      <Text>{mockUserProfile.email}</Text>
                    </div>
                    <div className="flex items-center">
                      <Text strong className="w-24">手机号：</Text>
                      <Text>{mockUserProfile.phone}</Text>
                    </div>
                    <div className="flex items-center">
                      <Text strong className="w-24">加入时间：</Text>
                      <Text>{formatJoinTime(mockUserProfile.joinTime)}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Password Change Card */}
            <Card title="安全设置" className="mb-6 text-center">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>密码</Text>
                  <Text type="secondary" className="ml-2">建议定期修改密码以保障账户安全</Text>
                </div>
                <Button type="primary" icon={<LockOutlined />} onClick={showPasswordModal}>
                  修改密码
                </Button>
              </div>
            </Card>
          </div>

          {/* Password Change Modal */}
          <Modal
            title="修改密码"
            visible={isPasswordModalVisible}
            onCancel={handlePasswordCancel}
            footer={null}
            width={500}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="oldPassword"
                label="原密码"
                rules={[
                  { required: true, message: '请输入原密码' },
                  { min: 6, message: '密码长度不能少于6位' }
                ]}
              >
                <Password
                  prefix={<LockOutlined />}
                  placeholder="请输入原密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不能少于6位' },
                  {
                    validator: (_, value) => {
                      if (!value || passwordForm.getFieldValue('oldPassword') !== value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('新密码不能与原密码相同'))
                    }
                  }
                ]}
              >
                <Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  {
                    validator: (_, value) => {
                      if (!value || passwordForm.getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  }
                ]}
              >
                <Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
                  autoComplete="new-password"
                />
              </Form.Item>

              <div className="flex justify-end gap-2">
                <Button onClick={handlePasswordCancel}>取消</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={passwordLoading}>
                  保存修改
                </Button>
              </div>
            </Form>
          </Modal>

          {/* Settings Modal */}
          <Modal
            title="系统设置"
            visible={isSettingsModalVisible}
            onCancel={handleSettingsCancel}
            footer={null}
            width={600}
          >
            <Form
              form={settingsForm}
              layout="vertical"
              onFinish={handleSettingsSave}
              initialValues={{ backendUrl: '' }}
            >
              <Form.Item
                name="backendUrl"
                label="后端服务地址"
                rules={[
                  { required: true, message: '请输入后端服务地址' },
                  { type: 'url', message: '请输入有效的URL地址' },
                  {
                    pattern: /^(https?:\/\/)/,
                    message: 'URL必须以http://或https://开头'
                  }
                ]}
                tooltip="设置后端服务的API地址，修改后需要刷新页面才能生效"
              >
                <Input
                  placeholder="例如：https://api.dify.ai"
                  className="w-full"
                />
              </Form.Item>

              <Divider />

              <Form.Item name="autoSync" label="自动同步">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name="notifications" label="通知提醒">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
              </Form.Item>

              <div className="flex justify-end">
                <Button onClick={handleSettingsCancel}>取消</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={settingsLoading}>
                  保存设置
                </Button>
              </div>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </div>
  )
}

export default AccountPage