import { Table, Button, Modal, Form, Input, message, Space, Select } from 'antd';
import { PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { IUser } from '@/types';

// 定义用户接口

interface MembersTabProps {
  users: IUser[];
  onAddMember: (user: IUser) => void;
  onEditMember: (user: IUser) => void;
  onDeleteMember: (userId: string) => void;
  workspaceId: string;
}

export default function MembersTab({ users, onAddMember, onEditMember, onDeleteMember, workspaceId }: MembersTabProps) {
  // 模态框状态
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState<boolean>(false);
  const [isEditMemberModalVisible, setIsEditMemberModalVisible] = useState<boolean>(false);
  
  // 表单状态
  const [addMemberForm] = Form.useForm();
  const [editMemberForm] = Form.useForm();
  
  // 编辑状态
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  
  // 搜索和过滤状态
  const [searchText, setSearchText] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // 分页状态
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

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
  
  // 打开编辑成员模态框
  const handleEditMember = (user: IUser) => {
    setEditingUser(user);
    editMemberForm.setFieldsValue({
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role
    });
    setIsEditMemberModalVisible(true);
  };
  
  // 关闭编辑成员模态框
  const handleCancelEditMember = () => {
    setIsEditMemberModalVisible(false);
    setEditingUser(null);
    editMemberForm.resetFields();
  };
  
  // 提交编辑成员表单
  const handleSubmitEditMember = () => {
    editMemberForm.validateFields()
      .then(values => {
        if (!editingUser) return;
        
        const updatedUser: IUser = {
          ...editingUser,
          username: values.username,
          phone: values.phone,
          email: values.email,
          role: values.role
        };
        
        // 调用父组件的编辑成员方法
        onEditMember(updatedUser);
        
        // 关闭模态框并重置状态
        setIsEditMemberModalVisible(false);
        setEditingUser(null);
        editMemberForm.resetFields();
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };
  
  // 删除成员
  const handleDeleteMember = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个成员吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 调用父组件的删除成员方法
        onDeleteMember(userId);
      }
    });
  };
  
  // 处理搜索输入变化（带防抖）
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    // 清除之前的超时
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // 设置新的超时
    const timeout = setTimeout(() => {
      // 重置到第一页
      setCurrentPage(1);
    }, 300);
    
    setSearchTimeout(timeout);
  };
  
  // 过滤成员
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.phone.includes(searchText) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="members-tab">
      {/* 操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="搜索用户名、手机号或邮箱"
            value={searchText}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
          />
        </div>
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
        dataSource={filteredUsers} 
        rowKey="id"
        loading={false}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
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
          },
          {
            title: '操作',
            key: 'actions',
            render: (_, record: IUser) => (
              <Space size="small">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditMember(record)}
                >
                  编辑
                </Button>
                <Button 
                  type="text" 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteMember(record.id)}
                >
                  删除
                </Button>
              </Space>
            )
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
        width={600}
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
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
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
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              options={[
                { value: 'member', label: '成员' },
                { value: 'admin', label: '管理员' },
                { value: 'owner', label: '所有者' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 编辑成员模态框 */}
      <Modal
        title="编辑成员"
        open={isEditMemberModalVisible}
        onOk={handleSubmitEditMember}
        onCancel={handleCancelEditMember}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={editMemberForm}
          layout="vertical"
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
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
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
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              options={[
                { value: 'member', label: '成员' },
                { value: 'admin', label: '管理员' },
                { value: 'owner', label: '所有者' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}