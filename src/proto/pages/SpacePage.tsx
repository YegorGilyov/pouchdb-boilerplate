import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Spin, Alert } from 'antd';
import { useProtoDBInit } from '../hooks';
import { LeftNavigation } from '../components/LeftNavigation';
import { SpaceHome } from '../components/SpaceHome';

const { Sider, Content } = Layout;

export function SpacePage(): React.ReactElement {
  // Get query parameters
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const spaceId = searchParams.get('spaceId');
  
  // Initialize the database
  const { loading: dbLoading, error: dbError } = useProtoDBInit();
  
  // Handle settings panel opening
  const handleSettingsOpen = (settingsSection: "itemTypes" | "workflows" | "customFields") => {
    console.log(`Opening settings section: ${settingsSection}`);
    // Implement actual settings panel logic here
  };
  
  if (dbLoading) {
    return (
      <Spin tip="Setting up prototype functionality...">
        <div style={{ margin: 24, minHeight: 200 }} />
      </Spin>
    );
  }

  if (dbError) {
    return (
      <Alert
        type="error"
        message="Error initializing the database"
        description={dbError.message}
        showIcon
      />
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={256} 
        theme="light" 
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}
      >
        <LeftNavigation userId={userId} spaceId={spaceId} onSettingsOpen={handleSettingsOpen} />
      </Sider>
      <Content style={{ marginLeft: 256, background: '#fff' }}>
        <SpaceHome userId={userId} spaceId={spaceId} />
      </Content>
    </Layout>
  );
} 