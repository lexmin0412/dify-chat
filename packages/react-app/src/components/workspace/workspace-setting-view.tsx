import { useState, useEffect } from 'react';
import { Layout, Tabs, Button, message } from 'antd';
import { LeftOutlined, SettingOutlined } from '@ant-design/icons';
import { Workspace, IUser } from '@/types';
import MembersTab from './members-tab';
import SpacesTab from './space-tab';
import { workspaceService } from '@/services/workspace';
import { userService } from '@/services/user';

interface WorkspaceManagementViewProps {
  workspaceId: string;
  handleGoBack: () => void;
}

export default function WorkspaceSettingView({ workspaceId, handleGoBack }: WorkspaceManagementViewProps) {
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

  // // 回退按钮处理函数
//   const handleGoBack = () => {
//     window.history.back();
//   };

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
            type="text" 
            // onClick={handleGoBack}
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
          />
        </Tabs.TabPane>
        
        {/* 空间管理标签 */}
        <Tabs.TabPane tab="空间管理" key="spaces">
          {/* <SpacesTab 
            spaces={spaces} 
            onEditSpace={handleEditSpace} 
            onDeleteSpace={handleDeleteSpace} 
          /> */}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}