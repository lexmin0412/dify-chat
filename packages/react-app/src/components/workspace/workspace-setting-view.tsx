import { useState, useEffect } from 'react';
import { Layout, Tabs, Button, message, Modal, Spin } from 'antd';
import { DeleteOutlined, LeftOutlined, SettingOutlined } from '@ant-design/icons';
import { Workspace, IUser } from '@/types';
import MembersTab from './members-tab';
import SpacesTab from './space-tab';
import AppTab from './app-tab';
import { workspaceService } from '@/services/workspace';
import { userService } from '@/services/user';
import { useHistory } from 'pure-react-router';

interface WorkspaceManagementViewProps {
  workspaceId: string;
  handleGoBack: () => void;
  onEditWorkspace?: (workspaceData: { name: string; description: string }) => void;
  workspaceData?: { name: string; description: string };
  onWorkspaceDeleted?: (deletedWorkspaceId: string) => void;
}

export default function WorkspaceSettingView({ 
  workspaceId, 
  handleGoBack, 
  onEditWorkspace,
  workspaceData 
}: WorkspaceManagementViewProps) {
  const history = useHistory();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // 多标签状态
  const [activeTab, setActiveTab] = useState<string>('members');
  
  // 用户数据状态
  const [users, setUsers] = useState<IUser[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<Error | undefined>();
  

  useEffect(() => {
    if (workspaceId) {
      setUsersLoading(true)
      setUsersError(undefined)
      userService.getUsersByWorkspaceId(workspaceId)
        .then((res) => {
          setUsers(res || [])
          setUsersLoading(false)
        })
        .catch((error) => {
          setUsersError(error)
          setUsersLoading(false)
        })
    }
  }, [workspaceId])
  

  // 标签页切换处理
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 添加成员处理
  const handleAddMember = (newUser: IUser) => {
    setUsers([...users, newUser]);
    message.success('成员添加成功');
  };
  
  // 编辑成员处理
  const handleEditMember = (updatedUser: IUser) => {
    // 更新用户列表
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    message.success('成员信息更新成功');
  };
  
  // 删除成员处理
  const handleDeleteMember = (userId: string) => {
    // 从用户列表中删除
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    message.success('成员删除成功');
  };

  // // 编辑空间处理
  // const handleEditSpace = (updatedSpace: Space) => {
  //   // 更新空间列表
  //   const updatedSpaces = spaces.map(space => 
  //     space.id === updatedSpace.id ? updatedSpace : space
  //   );
  //   setSpaces(updatedSpaces);
  //   message.success('空间信息更新成功');
  // };

  // 删除空间处理
  const handleDeleteSpace = () => {
    // 从空间列表中删除
    Modal.confirm({
      title: '确认删除工作空间',
      content: (
        <div>
          <p className="mb-2 text-red-500 font-medium">此操作不可撤销！</p>
          <p>删除此工作空间将：</p>
          <ul className="list-disc list-inside pl-4 text-gray-700">
            <li>永久删除所有工作空间数据</li>
            <li>移除与此工作空间关联的所有应用</li>
            <li>清空相关的所有会话历史记录</li>
          </ul>
          <p className="mt-2 text-gray-500 text-sm">请确保您已备份所有重要数据。</p>
        </div>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 设置加载状态
          setIsDeleting(true);
          
          // 调用删除工作空间的服务
          await workspaceService.deleteWorkspace(workspaceId);
          
          // // 通知父组件工作空间已被删除
          // if (onWorkspaceDeleted) {
          //   onWorkspaceDeleted(workspaceId);
          // }
          
          // 删除成功后显示消息
          message.success('工作空间删除成功');
          
          // 延迟重定向以确保用户看到成功消息
          setTimeout(() => {
            // 重定向到工作空间列表页面
            // 使用正确的应用路由路径
            history.push('/workspace/workspace-1');
            // 强制刷新页面以确保数据完全更新
            window.location.reload();
          }, 1000);
        } catch (error: any) {
          // 错误处理
          console.error('删除工作空间失败:', error);
          message.error(error.message || '删除工作空间失败，请稍后重试');
        } finally {
          // 确保加载状态被重置
          setIsDeleting(false);
        }
      }
    });
  };

  // 处理编辑工作空间
  const handleEditClick = () => {
    if (onEditWorkspace && workspaceData) {
      onEditWorkspace(workspaceData);
    } else {
      message.warning('无法获取工作空间数据，请刷新页面后重试');
    }
  };

  return (
    <div className="workspace-management-view">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Button 
            type="text" 
            onClick={handleGoBack}
            icon={<LeftOutlined />}
            className="mr-2"
          >
            返回
          </Button>
        </div>
        <div className="flex justify-end items-center">
          <Button 
            // type="text" 
            color="default" 
            variant="filled"
            onClick={handleEditClick}
            icon={<SettingOutlined />}
            className="mr-2"
          >
            编辑
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={handleDeleteSpace}
            icon={<DeleteOutlined />}
            className="mr-2"
            loading={isDeleting}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spin size="small" style={{ marginRight: 8 }} />
                删除中...
              </>
            ) : '删除空间'}
          </Button>
        </div>
      </div>
      
      {/* 多标签界面 */}
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* 成员管理标签 */}
        <Tabs.TabPane tab="成员管理" key="members">
          <MembersTab 
            workspaceId={workspaceId}
            users={users} 
            onAddMember={handleAddMember} 
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
          />
        </Tabs.TabPane>
        
        {/* 应用管理标签 */}
        <Tabs.TabPane tab="应用管理" key="apps">
          <AppTab 
            workspaceId={workspaceId}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}