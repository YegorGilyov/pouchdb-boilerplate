import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Spin, Alert } from 'antd';
import { useProtoDBInit } from '../hooks';
import { LeftNavigation } from '../components/LeftNavigation';
import styles from '../styles/SpacePage.module.css';

const { Sider, Content } = Layout;

export function SpacePage(): React.ReactElement {
  // Get query parameters
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const spaceId = searchParams.get('spaceId');
  
  // Initialize the database
  const { loading, error } = useProtoDBInit();

  if (loading) {
    return <div style={{ margin: 24 }}>Setting up prototype functionality...</div>;
  }

  // Error handling
  if (error) {
    return (
      <Alert
        type="error"
        message="Error initializing the database"
        description={error.message}
        showIcon
      />
    );
  }

  return (
    <Layout className={styles.pageLayout}>
      <Sider 
        width={250} 
        theme="light" 
        className={styles.sider}
      >
        <LeftNavigation userId={userId} spaceId={spaceId} />
      </Sider>
      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>
          <div>
            <Typography.Title level={2}>
              {spaceId ? 'Space Dashboard' : 'Please select a space'}
            </Typography.Title>
            <Typography.Paragraph>
              This is a placeholder for the main content area. In a real application, this would 
              display the actual content for the selected space.
            </Typography.Paragraph>
            {spaceId && (
              <Typography.Text strong>Current Space ID: {spaceId}</Typography.Text>
            )}
            {userId && (
              <div className={styles.userInfo}>
                <Typography.Text strong>Current User ID: {userId}</Typography.Text>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 