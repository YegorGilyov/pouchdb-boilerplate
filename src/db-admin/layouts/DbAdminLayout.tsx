import React from 'react';
import { Layout, Divider } from 'antd';
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
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          left: 0,
          top: 64,
          bottom: 0,
          padding: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
        }}
      >
        <DbAdminNavigation />
      </Sider>
      <Divider 
        type="vertical" 
        style={{
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          left: 256,
          top: 64,
          bottom: 0,
          margin: 0,
          zIndex: 1
        }}
      />
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