import { Table, Button, Modal, Form, Input, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Workspace } from '@/types';

// 定义空间接口扩展
interface Space extends Workspace {
  createdAt: string;
  updatedAt: string;
}

interface SpacesTabProps {
  spaces: Space[];
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (spaceId: string) => void;
}

export default function SpacesTab({ spaces, onEditSpace, onDeleteSpace }: SpacesTabProps) {
  // 模态框状态
  const [isEditSpaceModalVisible, setIsEditSpaceModalVisible] = useState<boolean>(false);
  
  // 表单状态
  const [editSpaceForm] = Form.useForm();
  
  // 编辑中的空间
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  // 打开编辑空间模态框
  const handleEditSpace = (space: Space) => {
    setEditingSpace(space);
    editSpaceForm.setFieldsValue({
      name: space.name,
      description: space.description
    });
    setIsEditSpaceModalVisible(true);
  };
  
  // 关闭编辑空间模态框
  const handleCancelEditSpace = () => {
    setIsEditSpaceModalVisible(false);
    setEditingSpace(null);
    editSpaceForm.resetFields();
  };
  
  // 提交编辑空间表单
  const handleSubmitEditSpace = () => {
    editSpaceForm.validateFields()
      .then(values => {
        if (!editingSpace) return;
        
        // 创建更新后的空间对象
        const updatedSpace: Space = {
          ...editingSpace,
          ...values,
          updatedAt: new Date().toISOString().slice(0, 10)
        };
        
        // 调用父组件的编辑空间方法
        onEditSpace(updatedSpace);
        
        // 关闭模态框并重置表单
        setIsEditSpaceModalVisible(false);
        setEditingSpace(null);
        editSpaceForm.resetFields();
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };
  
  // 处理删除空间
  const handleDeleteSpace = (spaceId: string) => {
    onDeleteSpace(spaceId);
  };

  return (
    <div className="spaces-tab">
      {/* 空间列表表格 */}
      <Table 
        dataSource={spaces} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: '空间名称',
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: '空间描述',
            dataIndex: 'description',
            key: 'description'
          },
          {
            title: '成员数量',
            dataIndex: 'memberCount',
            key: 'memberCount'
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt'
          },
          {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt'
          },
          {
            title: '操作',
            key: 'action',
            render: (_: any, record: Space) => (
              <div className="flex space-x-2">
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditSpace(record)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除此空间吗？"
                  onConfirm={() => handleDeleteSpace(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </div>
            )
          }
        ]}
      />
      
      {/* 编辑空间模态框 */}
      <Modal
        title="编辑空间信息"
        open={isEditSpaceModalVisible}
        onOk={handleSubmitEditSpace}
        onCancel={handleCancelEditSpace}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={editSpaceForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="空间名称"
            rules={[{ required: true, message: '请输入空间名称' }]}
          >
            <Input placeholder="请输入空间名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="空间描述"
          >
            <Input.TextArea placeholder="请输入空间描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}