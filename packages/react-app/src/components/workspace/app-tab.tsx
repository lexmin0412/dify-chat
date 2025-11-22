import { Table, Button, Modal, Form, Input, Select, Tag, message, Space } from 'antd';
import { PlusOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { IApp } from '@/types';
import { applicationService } from '@/services/application';

interface AppTabProps {
  workspaceId: string;
}

export default function AppTab({ workspaceId }: AppTabProps) {
  // 状态管理
  const [applications, setApplications] = useState<IApp[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddAppModalVisible, setIsAddAppModalVisible] = useState<boolean>(false);
  const [isEditAppModalVisible, setIsEditAppModalVisible] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<IApp | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [filterMode, setFilterMode] = useState<string>('all');
  
  // 表单实例
  const [addAppForm] = Form.useForm();
  const [editAppForm] = Form.useForm();

  // 获取应用列表
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const apps = await applicationService.getApplicationsByWorkspaceId(workspaceId);
      setApplications(apps || []);
    } catch (error) {
      message.error('获取应用列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [workspaceId]);

  // 打开添加应用模态框
  const handleAddApp = () => {
    setIsAddAppModalVisible(true);
  };
  
  // 关闭添加应用模态框
  const handleCancelAddApp = () => {
    setIsAddAppModalVisible(false);
    addAppForm.resetFields();
  };

  // 打开编辑应用模态框
  const handleEditApp = (app: IApp) => {
    setEditingApp(app);
    editAppForm.setFieldsValue({
      name: app.name,
      description: app.description,
      mode: app.mode,
      tags: app.tags
    });
    setIsEditAppModalVisible(true);
  };

  // 关闭编辑应用模态框
  const handleCancelEditApp = () => {
    setIsEditAppModalVisible(false);
    setEditingApp(null);
    editAppForm.resetFields();
  };

  // 提交添加应用表单
  const handleSubmitAddApp = () => {
    addAppForm.validateFields()
      .then(values => {
        const newApp: IApp = {
          id: `app-${Date.now()}`,
          name: values.name,
          description: values.description,
          mode: values.mode,
          tags: values.tags || [],
          workspaceId: workspaceId,
        };
        
        // 模拟添加应用
        setApplications([...applications, newApp]);
        message.success('应用创建成功');
        
        // 关闭模态框并重置表单
        setIsAddAppModalVisible(false);
        addAppForm.resetFields();
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  // 提交编辑应用表单
  const handleSubmitEditApp = () => {
    editAppForm.validateFields()
      .then(values => {
        if (!editingApp) return;
        
        const updatedApps = applications.map(app => 
          app.id === editingApp.id 
            ? {
                ...app,
                name: values.name,
                description: values.description,
                mode: values.mode,
                tags: values.tags || []
              }
            : app
        );
        
        setApplications(updatedApps);
        message.success('应用更新成功');
        
        // 关闭模态框并重置状态
        setIsEditAppModalVisible(false);
        setEditingApp(null);
        editAppForm.resetFields();
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  // 删除应用
  const handleDeleteApp = (appId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个应用吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const updatedApps = applications.filter(app => app.id !== appId);
        setApplications(updatedApps);
        message.success('应用删除成功');
      }
    });
  };

  // 过滤应用
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         app.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesMode = filterMode === 'all' || app.mode === filterMode;
    
    return matchesSearch && matchesMode;
  });

  // 表格列定义
  const columns = [
    {
      title: '应用名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center">
          <AppstoreOutlined className="mr-2 text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (mode: string) => {
        const modeConfig = {
          'chat': { color: 'green', text: '对话' },
          'workflow': { color: 'blue', text: '工作流' }
        };
        const config = modeConfig[mode as keyof typeof modeConfig] || { color: 'default', text: mode };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: IApp) => (
        <Space size="small">
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditApp(record)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteApp(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="app-tab">
      {/* 操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="搜索应用名称、描述或标签"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            value={filterMode}
            onChange={setFilterMode}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部模式' },
              { value: 'chat', label: '对话' },
              { value: 'workflow', label: '工作流' }
            ]}
          />
        </div>
        <Button 
          type="primary" 
          onClick={handleAddApp}
          icon={<PlusOutlined />}
        >
          创建应用
        </Button>
      </div>

      {/* 应用列表表格 */}
      <Table 
        dataSource={filteredApplications} 
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        columns={columns}
      />
      
      {/* 添加应用模态框 */}
      <Modal
        title="创建新应用"
        open={isAddAppModalVisible}
        onOk={handleSubmitAddApp}
        onCancel={handleCancelAddApp}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={addAppForm}
          layout="vertical"
          initialValues={{
            mode: 'chat'
          }}
        >
          <Form.Item
            name="name"
            label="应用名称"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="应用描述"
            rules={[{ required: true, message: '请输入应用描述' }]}
          >
            <Input.TextArea 
              placeholder="请输入应用描述" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item
            name="mode"
            label="应用模式"
            rules={[{ required: true, message: '请选择应用模式' }]}
          >
            <Select
              options={[
                { value: 'chat', label: '对话模式' },
                { value: 'workflow', label: '工作流模式' }
              ]}
            />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="输入标签后按回车添加"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑应用模态框 */}
      <Modal
        title="编辑应用"
        open={isEditAppModalVisible}
        onOk={handleSubmitEditApp}
        onCancel={handleCancelEditApp}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={editAppForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="应用名称"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="应用描述"
            rules={[{ required: true, message: '请输入应用描述' }]}
          >
            <Input.TextArea 
              placeholder="请输入应用描述" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item
            name="mode"
            label="应用模式"
            rules={[{ required: true, message: '请选择应用模式' }]}
          >
            <Select
              options={[
                { value: 'chat', label: '对话模式' },
                { value: 'workflow', label: '工作流模式' }
              ]}
            />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="输入标签后按回车添加"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}