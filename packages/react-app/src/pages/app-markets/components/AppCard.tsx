import { Button, message } from 'antd';
import { useHistory } from 'pure-react-router';
import { BaseAppCard } from '@/components';
import { IApp, Workspace } from '@/types';
import { applicationService } from '@/services/application';
import { useState } from 'react';
import WorkspaceSelectorModal from './WorkspaceSelectorModal';

interface AppCardProps {
  app: IApp;
}

const AppCard = ({ app }: AppCardProps) => {
  const history = useHistory();
  const { name } = app;
  
  // 状态管理
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addingApp, setAddingApp] = useState(false);
  
  // 处理应用信息缺失的情况
  if (!name) {
    return (
      <BaseAppCard 
        app={app} 
        variant="market"
      />
    );
  }

  // 打开模态框
  const handleAddToWorkspace = () => {
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // 确认添加到工作空间
  const handleConfirmAdd = async (workspace: Workspace) => {
    setAddingApp(true);
    try {
      // 添加应用到工作空间
      await applicationService.addAppToWorkspace(app, workspace.id);
      
      message.success(`应用 "${name}" 已成功添加到工作空间 "${workspace.name}"`);
      
      // 关闭模态框
      handleCloseModal();
      
      // 导航到工作空间界面并高亮显示
      history.push(`/workspace/${workspace.id}`);
      
    } catch (error) {
      message.error('添加应用失败');
      throw error; // 重新抛出错误让WorkspaceSelectorModal处理
    } finally {
      setAddingApp(false);
    }
  };

  // 渲染操作按钮
  const renderActions = () => (
    <Button 
      type="primary" 
      size="middle" 
      block 
      style={{ height: '32px' }}
      onClick={handleAddToWorkspace}
      className='rounded-xl'
    >
      添加到工作空间
    </Button>
  );

  return (
    <>
      <BaseAppCard 
        app={app} 
        variant="market"
        renderActions={renderActions}
      />

      {/* 工作空间选择模态框 */}
      <WorkspaceSelectorModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAdd}
        confirmLoading={addingApp}
        title="选择工作空间"
        confirmText="确认添加"
        cancelText="取消"
      />
    </>
  );
};

export default AppCard;