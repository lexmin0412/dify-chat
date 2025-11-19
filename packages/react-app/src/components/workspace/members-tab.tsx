import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { IUser } from '@/types';

// 定义用户接口

interface MembersTabProps {
  users: IUser[];
  onAddMember: (user: IUser) => void;
  workspaceId: string;
}

export default function MembersTab({ users, onAddMember, workspaceId }: MembersTabProps) {
  // 模态框状态
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState<boolean>(false);
  
  // 表单状态
  const [addMemberForm] = Form.useForm();

  // 打开添加成员模态框
  const handleAddMember = () => {
    setIsAddMemberModalVisible(true);
  };
  
  // 关闭添加成员模态框
  const handleCancelAddMember = () => {
    setIsAddMemberModalVisible(false);
    addMemberForm.resetFields();
  };
  
  // 提交添加成员表单
  const handleSubmitAddMember = () => {
    addMemberForm.validateFields()
      .then(values => {
        // 创建新用户
        const newUser: IUser = {
          id: Date.now().toString(),
          username: values.username,
          workspaceId: workspaceId,
          phone: values.phone,
          email: values.email,
          avatar: '',
          role: 'member',
          joinTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        // 调用父组件的添加成员方法
        onAddMember(newUser);
        
        // 关闭模态框并重置表单
        setIsAddMemberModalVisible(false);
        addMemberForm.resetFields();
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  return (
    <div className="members-tab">
      {/* 添加成员按钮 */}
      <div className="flex justify-end mb-4">
        <Button 
          type="primary" 
          onClick={handleAddMember}
          icon={<PlusOutlined />}
        >
          添加成员
        </Button>
      </div>

      {/* 成员列表表格 */}
      <Table 
        dataSource={users} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            render: (text: string) => (
              <div className="flex items-center">
                <UserOutlined className="mr-2" />
                {text}
              </div>
            )
          },
          {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone'
          },
          {
            title: '邮箱号',
            dataIndex: 'email',
            key: 'email'
          },
          {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
              const roleMap: Record<string, string> = {
                'owner': '所有者',
                'admin': '管理员',
                'member': '成员'
              };
              return roleMap[role] || role;
            }
          },
          {
            title: '加入时间',
            dataIndex: 'joinTime',
            key: 'joinTime'
          }
        ]}
      />
      
      {/* 添加成员模态框 */}
      <Modal
        title="添加新成员"
        open={isAddMemberModalVisible}
        onOk={handleSubmitAddMember}
        onCancel={handleCancelAddMember}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={addMemberForm}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱号"
            rules={[
              { required: true, message: '请输入邮箱号' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}