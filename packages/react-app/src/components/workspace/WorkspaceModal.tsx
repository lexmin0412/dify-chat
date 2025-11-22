import React, { useEffect, useRef } from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface WorkspaceData {
  name: string;
  description: string;
}

interface WorkspaceModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: WorkspaceData) => Promise<void>;
  mode: 'create' | 'edit';
  workspaceData?: WorkspaceData;
  isSubmitting?: boolean;
}

/**
 * 工作空间模态框组件
 * 支持创建新工作空间和编辑现有工作空间
 */
const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  open,
  onCancel,
  onSubmit,
  mode,
  workspaceData,
  isSubmitting = false,
}) => {
  const [form] = Form.useForm<WorkspaceData>();
  const prevModeRef = useRef<'create' | 'edit'>(mode);
  const prevOpenRef = useRef<boolean>(open);

  // 当工作空间数据变化、模式切换或模态框打开时，重置或设置表单
  useEffect(() => {
    // 处理模式切换 - 当模式改变时强制重置表单
    if (prevModeRef.current !== mode) {
      form.resetFields();
      prevModeRef.current = mode;
    }
    
    // 处理打开状态变化 - 当从关闭变为打开时
    if (!prevOpenRef.current && open) {
      if (mode === 'edit' && workspaceData) {
        form.setFieldsValue(workspaceData);
      } else {
        form.resetFields();
      }
    }
    
    // 当工作空间数据变化时（仅在编辑模式下）
    if (open && mode === 'edit' && workspaceData) {
      form.setFieldsValue(workspaceData);
    }
    
    prevOpenRef.current = open;
  }, [open, mode, workspaceData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      // 提交成功后重置表单
      form.resetFields();
    } catch (error) {
      // 表单验证失败或提交失败时的处理
      console.error('表单提交失败:', error);
      // 不重置表单，保留用户输入以便修改
    }
  };

  return (
    <Modal
      title={mode === 'create' ? '创建工作空间' : '编辑工作空间'}
      open={open}
      onCancel={onCancel}
      footer={null}
      className="workspace-modal"
      aria-labelledby={`${mode}-workspace-title`}
      keyboard={true}
      centered
      width={{ xs: 320, sm: 500, md: 600 }}
      onOk={handleSubmit}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="工作空间名称"
          validateFirst
          rules={[
            { required: true, message: '请输入工作空间名称' },
            { min: 1, max: 50, message: '工作空间名称长度应在1-50个字符之间' },
            {
              validator: (_, value) => {
                // 检查名称是否只包含允许的字符
                if (value && !/^[\u4e00-\u9fa5a-zA-Z0-9-_\s]+$/.test(value)) {
                  return Promise.reject('工作空间名称只能包含中文、英文、数字、下划线和连字符');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input 
            placeholder="请输入工作空间名称" 
            showCount 
            maxLength={50}
            status={form.getFieldError('name').length ? 'error' : ''}
            aria-required={true}
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="工作空间描述"
          rules={[
            { max: 200, message: '工作空间描述不能超过200个字符' }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="请输入工作空间描述（选填）"
            showCount
            maxLength={200}
            status={form.getFieldError('description').length ? 'error' : ''}
          />
        </Form.Item>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
          <Button 
            onClick={onCancel}
            aria-label={`取消${mode === 'create' ? '创建' : '编辑'}工作空间`}
          >取消</Button>
          <Button 
            type="primary" 
            // color="cyan" 
            // variant="filled"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            aria-label={`确认${mode === 'create' ? '创建' : '编辑'}工作空间`}
            aria-disabled={isSubmitting}
          >{mode === 'create' ? '创建工作空间' : '保存修改'}</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default WorkspaceModal;