import { useState, useEffect } from 'react';
import { Layout, Tabs, Button, message } from 'antd';
import { LeftOutlined, SettingOutlined } from '@ant-design/icons';
import { Workspace, IUser } from '@/types';
import MembersTab from './members-tab';
import SpacesTab from './space-tab';
import AppTab from './app-tab';
import { workspaceService } from '@/services/workspace';
import { userService } from '@/services/user';

interface WorkspaceManagementViewProps {
  workspaceId: string;
  handleGoBack: () => void;
  onEditWorkspace?: (workspaceData: { name: string; description: string }) => void;
  workspaceData?: { name: string; description: string };
}

export default function WorkspaceSettingView({ 
  workspaceId, 
  handleGoBack, 
  onEditWorkspace,
  workspaceData 
}: WorkspaceManagementViewProps) {
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

  // // 删除空间处理
  // const handleDeleteSpace = (spaceId: string) => {
  //   // 从空间列表中删除
  //   const updatedSpaces = spaces.filter(space => space.id !== spaceId);
  //   setSpaces(updatedSpaces);
  //   message.success('空间删除成功');
  // };

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
            设置
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