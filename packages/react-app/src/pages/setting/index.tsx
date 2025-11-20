import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Form, Input, message, Switch, Divider, Layout, Content } from 'antd'
import { SaveOutlined, SettingOutlined } from '@ant-design/icons'
import { useHistory } from 'pure-react-router'
import { Header } from '@/components'

const { Title, Text } = Typography
const { Content } = Layout
const { Password } = Input


const SettingsPage: React.FC = () => {
  const history = useHistory()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedBackendUrl = localStorage.getItem('backendUrl')
    if (savedBackendUrl) {
      form.setFieldsValue({ backendUrl: savedBackendUrl })
    }
  }, [form])

  // Handle form submission
  const handleSaveSettings = async (values: any) => {
    try {
      setLoading(true)

      // Save settings to localStorage
      localStorage.setItem('backendUrl', values.backendUrl)

      // TODO: Replace with actual API call to update settings if needed
      console.log('Settings saved:', values)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      message.success('设置保存成功')
    } catch (error) {
      message.error('设置保存失败，请重试')
      console.error('Settings save error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    // <div className="min-h-screen p-6 bg-theme-bg">
    //   <Header />
    //   <div className="max-w-4xl mx-auto">
    <div className="h-screen relative overflow-hidden flex flex-col bg-theme-bg w-full">
      <Header />
      <Layout className="flex-1 overflow-hidden">
        <Content className="bg-theme-main-bg rounded-t-3xl p-6 overflow-y-auto">
          {/* System Settings Card */}
          <div className="flex flex-col max-w-4xl mx-auto">
          <Card title="系统配置" className="text-center">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveSettings}
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
                  className="w-full block"
                />
              </Form.Item>

              <Divider />

              <div className="flex justify-end">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存设置
                </Button>
              </div>
            </Form>
          </Card>

          {/* About Card */}
          <Card title="关于" className="mt-6 text-center">
            <div className="space-y-2 flex flex-col items-center">
              <div className="flex items-center">
                <Text strong className="w-24">版本：</Text>
                <Text>v1.0.0</Text>
              </div>
              <div className="flex items-center">
                <Text strong className="w-24">更新时间：</Text>
                <Text>2025-11-20</Text>
              </div>
              <div className="flex items-center">
                <Text strong className="w-24">开发者：</Text>
                <Text>Dify Team</Text>
              </div>
            </div>
          </Card>
          </div>
        </Content>
      </Layout>
    </div>
  )
}

export default SettingsPage