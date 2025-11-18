import { useState, useEffect } from 'react';
import { Layout, Tabs, Button, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Workspace } from '@/types';
import MembersTab from './members-tab';
import SpacesTab from './space-tab';
import { workspaceService } from '@/services/workspace';


const { Content } = Layout;

// 定义用户接口
interface User {
  id: string;
  username: string;
  phone: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'member' | 'admin';
  joinTime: string;
}

// 定义空间接口扩展
interface Space extends Workspace {
  createdAt: string;
  updatedAt: string;
}
interface WorkspaceManagementViewProps {
  onBack: () => void;
  workspaces: Workspace[];
  workspacesLoading: boolean;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  isMobile: boolean;
}

export default function WorkspaceManagementView({ onBack, workspaces, workspacesLoading, searchKeyword, onSearchChange, isMobile }: WorkspaceManagementViewProps) {
  // 多标签状态
  const [activeTab, setActiveTab] = useState<string>('members');
  
  // 用户数据状态
  const [users, setUsers] = useState<User[]>([]);
  
  // 空间数据状态
  const [spaces, setSpaces] = useState<Space[]>([]);
  
  // 初始化模拟数据
  useEffect(() => {
    // 初始化模拟空间数据
    const mockSpaces: Space[] = (workspaces || []).map(workspace => ({
      ...workspace,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02'
    }));
    setSpaces(mockSpaces);
    
    // 初始化模拟用户数据
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        phone: '13800138000',
        email: 'admin@example.com',
        avatar: '',
        role: 'owner',
        joinTime: '2024-01-01 10:00:00'
      },
      {
        id: '2',
        username: 'user1',
        phone: '13800138001',
        email: 'user1@example.com',
        avatar: '',
        role: 'member',
        joinTime: '2024-01-02 14:30:00'
      },
      {
        id: '3',
        username: 'user2',
        phone: '13800138002',
        email: 'user2@example.com',
        avatar: '',
        role: 'member',
        joinTime: '2024-01-03 09:15:00'
      }
    ];
    setUsers(mockUsers);
  }, [workspaces]);

  // 标签页切换处理
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 添加成员处理
  const handleAddMember = (newUser: User) => {
    setUsers([...users, newUser]);
    message.success('成员添加成功');
  };

  // 编辑空间处理
  const handleEditSpace = (updatedSpace: Space) => {
    // 更新空间列表
    const updatedSpaces = spaces.map(space => 
      space.id === updatedSpace.id ? updatedSpace : space
    );
    setSpaces(updatedSpaces);
    message.success('空间信息更新成功');
  };

  // 删除空间处理
  const handleDeleteSpace = (spaceId: string) => {
    // 从空间列表中删除
    const updatedSpaces = spaces.filter(space => space.id !== spaceId);
    setSpaces(updatedSpaces);
    message.success('空间删除成功');
  };

  // 回退按钮处理函数
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      message.info('没有更多历史记录');
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
          <h2 className="text-xl font-bold">工作区管理</h2>
        </div>
      </div>
      
      {/* 多标签界面 */}
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* 成员管理标签 */}
        <Tabs.TabPane tab="成员管理" key="members">
          <MembersTab users={users} onAddMember={handleAddMember} />
        </Tabs.TabPane>
        
        {/* 空间管理标签 */}
        <Tabs.TabPane tab="空间管理" key="spaces">
          <SpacesTab 
            spaces={spaces} 
            onEditSpace={handleEditSpace} 
            onDeleteSpace={handleDeleteSpace} 
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}