import React from 'react';
import { Layout } from 'antd';
import { DbAdminNavigation } from '../components/DbAdminNavigation';

const { Sider } = Layout;

interface DbAdminLayoutProps {
  children: React.ReactNode;
}

export function DbAdminLayout({ children }: DbAdminLayoutProps): React.ReactElement {
  return (
    <Layout>
      <Sider
        width={256}
        style={{
          background: '#fff',
          overflow: 'auto',
          height: '100%',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          padding: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
        }}
      >
        <DbAdminNavigation />
      </Sider>
      <Layout style={{ padding: '0', marginLeft: 256 }}>
        <Layout.Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#fff',
          }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
} 