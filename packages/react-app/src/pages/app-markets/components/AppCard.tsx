import { Button, Tag, Modal, List, Avatar, Spin, message } from 'antd';
import { TagOutlined, UserOutlined } from '@ant-design/icons';
import { useHistory } from 'pure-react-router';
import { LucideIcon } from '@/components';
import { IApp, Workspace } from '@/types';
import { workspaceService } from '@/services/workspace';
import { applicationService } from '@/services/application';
import { useState, useEffect } from 'react';

interface AppCardProps {
  app: IApp;
}

const AppCard = ({ app }: AppCardProps) => {
  const history = useHistory();
  const { id, name, description, creator, tags, usageCount, conversationCount } = app;
  
  // 状态管理
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [addingApp, setAddingApp] = useState(false);
  
  // 处理应用信息缺失的情况
  if (!name) {
    return (
      <div className="relative group p-3 bg-theme-btn-bg border border-solid border-theme-border rounded-2xl cursor-pointer hover:border-primary hover:text-primary">
        应用信息缺失，请检查
      </div>
    );
  }

  const hasTags = tags?.length;

  // 获取工作空间列表
  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const workspaceList = await workspaceService.getWorkspaces();
      setWorkspaces(workspaceList);
    } catch (error) {
      message.error('获取工作空间列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开模态框
  const handleAddToWorkspace = () => {
    setIsModalVisible(true);
    fetchWorkspaces();
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedWorkspace(null);
  };

  // 选择工作空间
  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  // 确认添加到工作空间
  const handleConfirmAdd = async () => {
    if (!selectedWorkspace) {
      message.warning('请选择一个工作空间');
      return;
    }

    setAddingApp(true);
    try {
      // 添加应用到工作空间
      await applicationService.addAppToWorkspace(app, selectedWorkspace.id);
      
      message.success(`应用 "${name}" 已成功添加到工作空间 "${selectedWorkspace.name}"`);
      
      // 关闭模态框
      handleCloseModal();
      
      // 导航到工作空间界面并高亮显示
      history.push(`/workspaces/${selectedWorkspace.id}?highlight=true`);
      
      // 延迟一下让页面加载完成，然后高亮显示
      setTimeout(() => {
        // 这里可以添加高亮逻辑，比如通过URL参数或状态管理
        // 暂时通过控制台日志表示高亮
        console.log(`高亮显示工作空间: ${selectedWorkspace.name}`);
      }, 500);
      
    } catch (error) {
      message.error('添加应用失败');
    } finally {
      setAddingApp(false);
    }
  };

  return (
    <>
      <div className="relative p-4 bg-[#1e1e1e] border border-[#333] rounded-lg hover:border-blue-500 transition-all duration-200">
        <div>
          <div className="flex items-center overflow-hidden mb-3">
            <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <LucideIcon
                name="bot"
                className="text-xl text-blue-400"
              />
            </div>
            <div className="flex-1 overflow-hidden ml-3">
              <div className="truncate font-semibold text-white text-base pr-4">{name}</div>
              <div className="text-xs mt-1 text-gray-400">
                {creator}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-300 leading-5 whitespace-normal line-clamp-2 mb-4">
            {description || '暂无描述'}
          </div>
        </div>
        
        {/* 应用元数据 */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <div className="flex items-center mr-4">
            <LucideIcon name="users" size={12} className="mr-1" />
            <span>{usageCount}</span>
          </div>
          <div className="flex items-center mr-4">
            <LucideIcon name="message-square" size={12} className="mr-1" />
            <span>{conversationCount}</span>
          </div>
        </div>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          <TagOutlined className="mr-2" />
          {hasTags ? (
            tags.map(tag => (
              <Tag key={tag} className="bg-gray-700/50 text-gray-300 border-0 px-2 py-0.5 rounded-full text-xs">
                #{tag}
              </Tag>
            ))
          ) : null}
        </div>
        
        {/* 使用按钮 */}
        <div className="mt-2">
          <Button 
            type="primary" 
            size="middle" 
            block 
            style={{ height: '30px' }}
            onClick={handleAddToWorkspace}
          >
            添加到工作空间
          </Button>
        </div>
      </div>

      {/* 工作空间选择模态框 */}
      <Modal
        title="选择工作空间"
        open={isModalVisible}
        onCancel={handleCloseModal}
        onOk={handleConfirmAdd}
        okText="确认添加"
        cancelText="取消"
        confirmLoading={addingApp}
        width={600}
        okButtonProps={{ disabled: !selectedWorkspace || addingApp }}
      >
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spin size="large" />
              <span className="ml-2">加载工作空间列表中...</span>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              暂无可用工作空间
            </div>
          ) : (
            <List
              dataSource={workspaces}
              renderItem={(workspace) => (
                <List.Item
                  className={`cursor-pointer rounded-lg mb-2 p-3 border ${
                    selectedWorkspace?.id === workspace.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                      <div className="font-semibold">
                        {workspace.name}
                        {selectedWorkspace?.id === workspace.id && (
                          <span className="ml-2 text-blue-500 text-sm">✓ 已选择</span>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          {workspace.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          成员数量：{workspace.memberCount} 人
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
    </>
  );
};

export default AppCard;