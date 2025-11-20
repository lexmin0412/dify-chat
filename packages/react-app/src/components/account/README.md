# 账户组件 (Account Component)

账户组件是一个用于管理用户账户信息和系统设置的功能模块，提供了用户信息展示、密码修改和系统设置等功能。

## 功能特性

### 1. 下拉菜单交互
- 增强的下拉菜单体验，流畅展示"设置"和"账户"两个选项
- 点击用户头像或名称时显示下拉菜单
- 支持键盘导航和无障碍访问

### 2. 账户页面
- 用户基本信息展示：用户名、邮箱、手机号、角色、加入时间等
- 密码修改功能：
  - 支持原密码验证
  - 新密码格式验证（长度至少6位）
  - 确认密码一致性检查
  - 与后端API的密码更新接口对接
  - 加载状态和操作反馈提示

### 3. 设置功能
- 后端服务地址配置：
  - URL格式验证
  - 持久化保存到localStorage
  - 刷新页面后设置依然生效
- 自动同步和通知提醒开关
- 保存状态和操作反馈提示

## 技术实现

### 组件结构

```
account/
├── index.tsx          # 主组件文件，包含下拉菜单实现
└── README.md          # 组件说明文档
```

### 相关页面

```
pages/
└── account/
    └── index.tsx      # 账户页面实现
```

### 核心技术栈

- React 18
- TypeScript
- Ant Design 5.x
- pure-react-router

### 关键功能实现

1. **用户信息展示**
   - 使用 `IUser` 接口定义用户数据结构
   - 支持不同角色（所有者/成员）的显示
   - 格式化日期时间显示

2. **表单验证**
   - 使用 Ant Design 的 Form 组件实现表单验证
   - 自定义密码验证规则
   - 实时错误提示

3. **状态管理**
   - 使用 React Hooks (useState, useEffect) 管理组件状态
   - localStorage 用于持久化设置信息

4. **路由配置**
   - 在 `App.tsx` 中配置 `/account` 路由
   - 使用 `useNavigate` 实现页面跳转

## 样式设计

- 遵循项目的统一设计规范
- 使用项目自定义的主题样式类（`bg-theme-bg`, `bg-theme-main-bg`等）
- 响应式布局，适配不同屏幕尺寸
- 与现有项目风格保持一致

## 使用示例

### 组件使用

```tsx
import Account from '@/components/account'

const App = () => {
  return (
    <div>
      <Account />
    </div>
  )
}
```

### 路由配置

```tsx
import { BrowserRouter, Route } from 'pure-react-router'
import AccountPage from '@/pages/account'

const App = () => {
  return (
    <BrowserRouter>
      <Route path="/account" component={AccountPage} />
    </BrowserRouter>
  )
}
```

## 后续优化方向

1. 增加用户头像上传功能
2. 支持多语言切换
3. 增加更多账户安全设置选项
4. 优化移动端显示效果
5. 增加数据缓存策略

## 开发注意事项

1. 密码修改功能需要与后端API对接
2. 后端服务地址修改后需要刷新页面才能生效
3. 所有用户数据需要从实际API获取，目前使用mock数据
4. 确保所有交互操作都有适当的加载状态和反馈提示