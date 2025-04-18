import React from 'react';
import { FloatButton, Layout } from 'antd';
import { 
  UnorderedListOutlined, 
  DatabaseOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  const location = useLocation();
  const path = location.pathname;

  const getSelectedIcon = () => {
    if (path.startsWith('/todos')) return <UnorderedListOutlined />;
    if (path.startsWith('/db-admin')) return <DatabaseOutlined />;
    return '';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ insetInlineEnd: 94 }}
        icon={getSelectedIcon()}
      >
        {!path.startsWith('/todos') && <FloatButton icon={<UnorderedListOutlined />} href='/todos' />}
        {!path.startsWith('/db-admin') && <FloatButton icon={<DatabaseOutlined />} href='/db-admin/info' />}
      </FloatButton.Group>
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