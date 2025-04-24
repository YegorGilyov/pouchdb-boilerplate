import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Spin, Alert } from 'antd';
import { useProtoDBInit } from '../hooks';
import { LeftNavigation } from '../components/LeftNavigation';
import { SpaceHome } from '../components/SpaceHome';
import styles from '../styles/SpacePage.module.css';

const { Sider, Content } = Layout;

export function SpacePage(): React.ReactElement {
  // Get query parameters
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const spaceId = searchParams.get('spaceId');
  
  // Initialize the database
  const { loading: dbLoading, error: dbError } = useProtoDBInit();
  
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
    <Layout className={styles.pageLayout}>
      <Sider 
        width={256} 
        theme="light" 
        className={styles.sider}
      >
        <LeftNavigation userId={userId} spaceId={spaceId} />
      </Sider>
      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>
          <SpaceHome userId={userId} spaceId={spaceId} />
        </Content>
      </Layout>
    </Layout>
  );
} 