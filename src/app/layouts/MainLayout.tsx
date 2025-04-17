import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  UnorderedListOutlined, TagsOutlined, 
  DatabaseOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  // Check if current path is a PouchDB related path
  const isDBAdminPage = path.startsWith('/db-admin');
  
  // Determine which menu item should be active based on current path
  const getSelectedKey = () => {
    if (path === '/todos') return 'todos';
    if (path === '/todos/categories') return 'categories';
    if (isDBAdminPage) return 'db-admin';
    return '';
  };

  const selectedKey = getSelectedKey();

  // Main menu items
  const menuItems = [
    {
      key: 'todos',
      icon: <UnorderedListOutlined />,
      label: 'To-Do',
      onClick: () => navigate('/todos')
    },
    {
      key: 'db-admin',
      icon: <DatabaseOutlined />,
      label: 'DB',
      onClick: () => navigate('/db-admin/info')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', padding: '0' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Layout>
        <Content
          style={{
            padding: 0,
            margin: 0,
            minHeight: 280,
            background: '#fff',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 