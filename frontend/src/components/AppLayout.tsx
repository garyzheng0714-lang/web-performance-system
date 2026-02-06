import { Layout, Menu, Typography, Space, Button, Drawer, Grid, Tag } from 'antd';
import {
  DashboardOutlined,
  AimOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth } from '@/slices/authSlice';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const screens = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '总览' },
    { key: '/objectives', icon: <AimOutlined />, label: '目标管理' },
    { key: '/approvals', icon: <AuditOutlined />, label: '目标审批' },
    { key: '/completions', icon: <CheckCircleOutlined />, label: '完成情况' },
    { key: '/scoring', icon: <TeamOutlined />, label: '评分中心' },
    { key: '/admin', icon: <SettingOutlined />, label: '管理员' },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.key === '/admin') {
      return user?.role === '管理员';
    }
    if (item.key === '/approvals' || item.key === '/scoring') {
      return user?.role === '主管' || user?.role === '管理员';
    }
    return true;
  });

  const siderContent = (
    <>
      <div style={{ padding: '24px 20px' }}>
        <Typography.Title level={4} style={{ margin: 0 }} className="page-title">
          绩效考核系统
        </Typography.Title>
        <Typography.Text type="secondary">Feishu Bitable 驱动</Typography.Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        items={filteredMenuItems}
        onClick={(item) => {
          navigate(item.key);
          setDrawerOpen(false);
        }}
      />
    </>
  );

  return (
    <Layout className="app-shell">
      {screens.md ? (
        <Sider
          width={240}
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {siderContent}
        </Sider>
      ) : (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          bodyStyle={{ padding: 0 }}
        >
          {siderContent}
        </Drawer>
      )}
      <Layout>
        <Header
          style={{
            background: 'transparent',
            padding: screens.md ? '0 28px' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Space>
            {!screens.md && (
              <Button onClick={() => setDrawerOpen(true)} size="small">
                菜单
              </Button>
            )}
            <Typography.Title level={4} style={{ margin: 0 }} className="page-title">
              {filteredMenuItems.find((item) => item.key === currentPath)?.label || '总览'}
            </Typography.Title>
            <Typography.Text type="secondary">实时进度一览</Typography.Text>
          </Space>
          <Space>
            {user && (
              <Space>
                <Typography.Text>{user.name}</Typography.Text>
                <Tag color="processing">{user.role}</Tag>
              </Space>
            )}
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                localStorage.removeItem('token');
                dispatch(clearAuth());
                navigate('/login');
              }}
            >
              退出登录
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: screens.md ? '0 28px 28px' : '0 16px 24px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
