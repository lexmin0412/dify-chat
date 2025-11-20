import { Button, Modal, List, Avatar, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Workspace } from '@/types';
import { workspaceService } from '@/services/workspace';

/**
 * 工作空间选择模态框的Props接口
 */
export interface WorkspaceSelectorModalProps {
  /** 模态框是否可见 */
  visible: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
  /** 确认选择的回调函数 */
  onConfirm: (workspace: Workspace) => Promise<void> | void;
  /** 模态框标题，默认为"选择工作空间" */
  title?: string;
  /** 确认按钮文本，默认为"确认添加" */
  confirmText?: string;
  /** 取消按钮文本，默认为"取消" */
  cancelText?: string;
  /** 模态框宽度，默认为600 */
  width?: number;
  /** 是否禁用确认按钮，默认为false */
  confirmLoading?: boolean;
  /** 预选的工作空间ID */
  preselectedWorkspaceId?: string;
  /** 自定义工作空间获取函数 */
  workspaceFetcher?: () => Promise<Workspace[]>;
  /** 自定义空状态文本 */
  emptyText?: string;
  /** 加载状态文本 */
  loadingText?: string;
}

/**
 * 工作空间选择模态框组件
 * 提供工作空间列表选择功能，支持自定义获取函数和样式配置
 */
const WorkspaceSelectorModal: React.FC<WorkspaceSelectorModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = '选择工作空间',
  confirmText = '确认添加',
  cancelText = '取消',
  width = 600,
  confirmLoading = false,
  preselectedWorkspaceId,
  workspaceFetcher,
  emptyText = '暂无可用工作空间',
  loadingText = '加载工作空间列表中...'
}) => {
  // 状态管理
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // 获取工作空间列表
  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      let workspaceList: Workspace[];
      
      if (workspaceFetcher) {
        workspaceList = await workspaceFetcher();
      } else {
        workspaceList = await workspaceService.getWorkspaces();
      }
      
      setWorkspaces(workspaceList);
      
      // 如果有预选的工作空间ID，自动选中
      if (preselectedWorkspaceId) {
        const preselected = workspaceList.find(ws => ws.id === preselectedWorkspaceId);
        if (preselected) {
          setSelectedWorkspace(preselected);
        }
      }
    } catch (error) {
      console.error('获取工作空间列表失败:', error);
      message.error('获取工作空间列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模态框打开时获取工作空间列表
  useEffect(() => {
    if (visible) {
      fetchWorkspaces();
    }
  }, [visible, workspaceFetcher, preselectedWorkspaceId]);

  // 选择工作空间
  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  // 确认选择
  const handleConfirm = async () => {
    if (!selectedWorkspace) {
      message.warning('请选择一个工作空间');
      return;
    }

    try {
      await onConfirm(selectedWorkspace);
    } catch (error) {
      console.error('确认操作失败:', error);
      // 错误处理由调用方负责
    }
  };

  // 关闭模态框时重置状态
  const handleClose = () => {
    setSelectedWorkspace(null);
    onClose();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      onOk={handleConfirm}
      okText={confirmText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      width={width}
      okButtonProps={{ disabled: !selectedWorkspace || confirmLoading }}
    >
      <div className="py-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
            <span className="ml-2">{loadingText}</span>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {emptyText}
          </div>
        ) : (
          <List
            dataSource={workspaces}
            renderItem={(workspace) => (
              <List.Item
                className={`cursor-pointer rounded-lg mb-2 p-3 border transition-colors duration-200 ${
                  selectedWorkspace?.id === workspace.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-700'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
                onClick={() => handleSelectWorkspace(workspace)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      className="bg-purple-500"
                    />
                  }
                  title={
                    <div className={`font-semibold ${
                      selectedWorkspace?.id === workspace.id 
                        ? 'text-blue-900 dark:text-white'
                        : ''
                    }`}>
                      {workspace.name}
                      {selectedWorkspace?.id === workspace.id && (
                        <span className="ml-2 text-blue-500 dark:text-blue-300 text-sm">✓ 已选择</span>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {workspace.description}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        成员数量：{workspace.memberCount || 0} 人
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
};

export default WorkspaceSelectorModal;