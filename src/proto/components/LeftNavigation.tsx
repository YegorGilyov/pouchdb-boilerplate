import React, { useEffect } from 'react';
import { Select, Space, Typography, Spin, Alert, Empty } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useUsers, useSpaces } from '../hooks';
import { EmptyState } from './EmptyState';
import styles from '../styles/LeftNavigation.module.css';

interface LeftNavigationProps {
  userId?: string | null;
  spaceId?: string | null;
}

export function LeftNavigation({ userId, spaceId }: LeftNavigationProps): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { spaces, loading: spacesLoading, error: spacesError } = useSpaces(
    userId ? { availableTo: userId } : undefined
  );

  // If no userId is specified, select the first user in the list when they load
  useEffect(() => {
    if (!userId && users.length > 0 && !usersLoading) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('userId', users[0]._id);
      setSearchParams(newParams);
    }
  }, [userId, users, usersLoading, searchParams, setSearchParams]);

  // If no spaceId is specified, select the first space in the list when they load
  useEffect(() => {
    if (userId && !spaceId && spaces.length > 0 && !spacesLoading) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('spaceId', spaces[0]._id);
      setSearchParams(newParams);
    }
  }, [userId, spaceId, spaces, spacesLoading, searchParams, setSearchParams]);

  // Handle user selection change
  const handleUserChange = (selectedUserId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('userId', selectedUserId);
    setSearchParams(newParams);
  };

  // Handle space selection change
  const handleSpaceChange = (selectedSpaceId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('spaceId', selectedSpaceId);
    setSearchParams(newParams);
  };

  // Loading state
  const isLoading = usersLoading || spacesLoading;
  
  // Error state
  const hasError = usersError || spacesError;
  const errorMessage = 
    usersError?.message || 
    spacesError?.message || 
    'An error occurred';

  if (hasError) {
    return (
      <Alert
        type="error"
        message="Error"
        description={errorMessage}
        showIcon
      />
    );
  }

  return (
    <div className={styles.navigationContainer}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className={styles.sectionContainer}>
          <Typography.Title level={5}>Current User</Typography.Title>
          {!isLoading && users.length === 0 ? (
            <EmptyState 
              title="No Users" 
              description="No users are available in the system."
              imageStyle={{ height: 60 }}
            />
          ) : (
            <Select
              loading={isLoading}
              className={styles.selector}
              placeholder="Select User"
              value={userId || undefined}
              onChange={handleUserChange}
              options={users.map(user => ({
                label: user.name,
                value: user._id
              }))}
              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No users found" />}
            />
          )}
        </div>

        {userId && (
          <div className={styles.sectionContainer}>
            <Typography.Title level={5}>Available Spaces</Typography.Title>
            {!isLoading && spaces.length === 0 ? (
              <EmptyState 
                title="No Spaces" 
                description="No spaces are available for this user."
                imageStyle={{ height: 60 }}
              />
            ) : (
              <Select
                loading={isLoading}
                className={styles.selector}
                placeholder="Select Space"
                value={spaceId || undefined}
                onChange={handleSpaceChange}
                options={spaces.map(space => ({
                  label: space.name,
                  value: space._id
                }))}
                notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No spaces found" />}
              />
            )}
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingContainer}>
            <Spin />
          </div>
        )}
      </Space>
    </div>
  );
} 