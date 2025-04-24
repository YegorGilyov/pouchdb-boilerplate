import React from 'react';
import { Typography, Spin, Alert } from 'antd';
import { useSpaces } from '../hooks';
import styles from '../styles/SpaceHome.module.css';

interface SpaceHomeProps {
  userId: string | null;
  spaceId: string | null;
}

export function SpaceHome({ userId, spaceId }: SpaceHomeProps): React.ReactElement {
  // Fetch space details if spaceId is available
  const { spaces, loading, error } = useSpaces(
    spaceId ? { spaceIds: [spaceId] } : undefined
  );
  
  // Get current space
  const currentSpace = spaces?.[0];

  if (loading) {
    return (
      <Spin tip="Loading space information...">
        <div style={{ margin: 24, minHeight: 200 }} />
      </Spin>
    ); 
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Error loading space"
        description={error.message}
        showIcon
      />
    );
  }

  return (
    <div className={styles.container}>
      <Typography.Title level={2}>
        {currentSpace ? currentSpace.name : 'Please select a space'}
      </Typography.Title>
      
      {currentSpace && (
        <>
          <Typography.Paragraph>
            This is the dashboard for {currentSpace.name}.
          </Typography.Paragraph>
          
          {/* Additional space information could be displayed here */}
          <div className={styles.spaceDetails}>
            <Typography.Text type="secondary">Space ID: {spaceId}</Typography.Text>
          </div>
        </>
      )}
      
      {!currentSpace && spaceId && (
        <Alert
          type="warning"
          message="Space not found"
          description={`The space with ID ${spaceId} could not be found.`}
          showIcon
        />
      )}
    </div>
  );
} 