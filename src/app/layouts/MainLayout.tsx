import React from 'react';
import { FloatButton, Layout } from 'antd';
import { 
  UnorderedListOutlined, 
  DatabaseOutlined,
  ExperimentOutlined
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
    if (path.startsWith('/proto')) return <ExperimentOutlined />;
    return '';
  };

  return (
    <Layout>
      <FloatButton.Group
        trigger="hover"
        type="primary"
        icon={getSelectedIcon()}
      >
        {!path.startsWith('/proto') && <FloatButton icon={<ExperimentOutlined />} tooltip='Prototype' href='/proto/space' />}
        {!path.startsWith('/todos') && <FloatButton icon={<UnorderedListOutlined />} tooltip='To-Do App' href='/todos' />}
        {!path.startsWith('/db-admin') && <FloatButton icon={<DatabaseOutlined />} tooltip='Database Administration' href='/db-admin/info' />}
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