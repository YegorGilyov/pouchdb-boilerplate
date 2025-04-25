import React, { useEffect, useCallback } from 'react';
import { Select, Space, Typography, Spin, Alert, Empty, ConfigProvider, theme, Skeleton, Menu, Avatar, Dropdown } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { AppstoreOutlined, SettingOutlined, SearchOutlined, InboxOutlined, StarOutlined } from '@ant-design/icons';
import { useUsers, useSpaces } from '../hooks';
import { SettingsSection, SETTINGS_SECTIONS } from '../types';
import type { MenuProps } from 'antd';

interface LeftNavigationProps {
  userId?: string | null;
  spaceId?: string | null;
  onSettingsOpen: (settingsSection: SettingsSection) => void;
}

export function LeftNavigation({ userId, spaceId, onSettingsOpen }: LeftNavigationProps): React.ReactElement {
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

  // If no spaceId is specified or the current spaceId is not available to the user,
  // select the first available space in the list when they load
  useEffect(() => {
    if (userId && spaces.length > 0 && !spacesLoading) {
      const isSpaceAvailable = spaceId && spaces.some(space => space._id === spaceId);
      
      if (!spaceId || !isSpaceAvailable) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('spaceId', spaces[0]._id);
        setSearchParams(newParams);
      }
    }
  }, [userId, spaceId, spaces, spacesLoading, searchParams, setSearchParams]);

  // Handle user selection change
  const handleUserChange = useCallback((selectedUserId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('userId', selectedUserId);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Handle space selection change
  const handleSpaceChange = useCallback((selectedSpaceId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('spaceId', selectedSpaceId);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Loading state
  const isLoading = usersLoading || spacesLoading;
  
  // Error state
  const hasError = usersError || spacesError;
  const errorMessage = 
    usersError?.message || 
    spacesError?.message || 
    'An error occurred';

  // Get current user name for display
  const currentUser = users.find(user => user._id === userId);
  const userName = currentUser?.name || 'User';

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'currentUser',
      label: userName,
      children: users.map(user => ({
        key: user._id,
        label: user.name,
        onClick: () => handleUserChange(user._id)
      }))
    },
    {
      type: 'divider'
    },
    {
      key: 'settings',
      label: 'Settings',
      onClick: () => onSettingsOpen("itemTypes")
    },
    {
      key: 'help',
      label: 'Help'
    },
    {
      key: 'mobileApps',
      label: 'Mobile apps'
    },
    {
      key: 'privacy',
      label: 'Privacy policy'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Log out'
    }
  ];

  // Navigation menu items
  const navMenuItems: MenuProps['items'] = [
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: 'Search',
    },
    {
      key: 'inbox',
      icon: <InboxOutlined />,
      label: 'Inbox',
    },
    {
      key: 'starred',
      icon: <StarOutlined />,
      label: 'Starred tasks',
    },
  ];

  // Space settings menu items
  const spaceSettingsMenuItems: MenuProps['items'] = [
    {
      key: 'general',
      label: 'General space settings'
    },
    {
      type: 'divider'
    },
    ...SETTINGS_SECTIONS.map(section => ({
      key: section.key,
      label: section.label,
      onClick: () => onSettingsOpen(section.key)
    }))
  ];

  if (hasError) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <Alert
          type="error"
          message="Error"
          description={errorMessage}
          showIcon
        />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Menu: {
            itemHeight: 32,
            itemMarginInline: 4,
          },
          Select: {
            borderRadius: 8,
            paddingSM: 16,
          }
        }
      }}
    >
      <div style={{ background: '#141414', color: '#fff', padding: '8px', height: '100%' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>

          <div style={{ padding: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <svg fill="none" height="20" role="img" viewBox="0 0 100 20" width="100" aria-label="Wrike logo">
              <path fill="white" d="M20.78 1.404C21.885.298 22.587 0 24.113 0h6.878c.561 0 .684.509.35.842l-11.49 11.491c-.176.176-.246.21-.352.246-.035.018-.087.018-.122.018s-.088 0-.123-.018c-.106-.035-.176-.07-.351-.246L14.85 8.281c-.175-.176-.21-.246-.245-.351-.018-.035-.018-.088-.018-.123s0-.088.018-.123c.035-.105.07-.175.245-.35l5.93-5.93zM10.745 8.649C9.64 7.544 8.92 7.263 7.395 7.263H.534c-.562 0-.685.509-.351.842l11.49 11.492c.176.175.246.21.352.245a.299.299 0 00.123.018c.035 0 .087 0 .122-.018.105-.035.176-.07.351-.245l4.053-4.07c.175-.176.21-.246.245-.351a.3.3 0 00.018-.123c0-.035 0-.088-.018-.123-.035-.105-.07-.175-.245-.351l-5.93-5.93z"></path>
              <path fill="white" d="M71.064 4.72a1.965 1.965 0 100-3.93 1.965 1.965 0 000 3.93zm1.579 1.578h-3.158v11.035h3.158V6.298zm-9.877 11.035V12.37c0-3 2.649-2.948 4.035-2.72V6.263c-2.21-.193-3.526.421-4.123 1.614h-.07l.017-1.561h-3.07v11.018h3.21zm-22.685 0h2.474l3.79-7.087 3.666 7.087h2.509l5.632-11.035h-3.737l-3.456 7.035-3.281-7.035h-2.684l-3.456 7.07-3.281-7.07H34.52l5.561 11.035zm36.053 0h2l3.298-4.158 2.79 4.158h3.72l-4.387-6.386 3.842-4.649h-3.701l-4.386 5.544h-.07L79.275.79h-3.14v16.544zm18.228-2.368c1.351 0 2.158-.72 2.544-1.298l2.421 1.667c-.982 1.28-2.509 2.28-5.035 2.28-3.386 0-5.912-2.544-5.912-5.754 0-3.228 2.579-5.755 5.912-5.755 3.403 0 5.702 2.562 5.702 5.755v.877h-8.58c.246 1.316 1.37 2.228 2.948 2.228zm2.58-4.421c-.352-1.158-1.37-1.965-2.825-1.965-1.492 0-2.492.807-2.843 1.965h5.667z"></path>
            </svg>
            
            {userId && (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={['click']}
                placement="bottomLeft"
              >
                <Avatar 
                  src={'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=' + userName} 
                  shape="square" 
                  size={24}
                  style={{ cursor: 'pointer' }}
                />
              </Dropdown>
            )}
          </div>

          {userId && (
            <>
              <Menu
                mode="vertical"
                style={{ background: 'transparent', border: 'none' }}
                selectable={false}
                items={navMenuItems}
              />
              
              <div style={{ padding: '0 4px', margin: '0' }}>
                <Typography.Text type="secondary" style={{ paddingLeft: '16px'}}>Space</Typography.Text>
                {!isLoading && spaces.length === 0 ? (
                  <p>No spaces are available for this user.</p>
                ) : (
                  <Select
                    loading={isLoading}
                    placeholder="Select Space"
                    value={spaceId || undefined}
                    onChange={handleSpaceChange}
                    options={spaces.map(space => ({
                      label: space.name,
                      value: space._id
                    }))}
                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No spaces found" />}
                    style={{ width: '100%', height: '32px', marginTop: '4px' }}
                  />
                )}
              </div>
            </>
          )}
          
          {spaceId && (
            <div style={{ padding: '0 4px', marginTop: '4px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px', 
                height: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)', 
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <AppstoreOutlined style={{ marginRight: '8px' }} />
                  <span>Space overview</span>
                </div>
                <Dropdown
                  menu={{
                    items: spaceSettingsMenuItems
                  }}
                  trigger={['click']}
                  placement="bottomLeft"
                >
                  <SettingOutlined />
                </Dropdown>
              </div>
            </div>
          )}

          {spaceId && (
            <div style={{ padding: '8px 20px' }}>
              <Typography.Text type="secondary" style={{ marginBottom: '12px', display: 'block' }}>Tools</Typography.Text>
              <Skeleton title={false} paragraph={{ rows: 4 }} />
            </div>
          )}

          {spaceId && (
            <div style={{ padding: '8px 20px' }}>
              <Typography.Text type="secondary" style={{ marginBottom: '12px', display: 'block' }}>Projects and folders</Typography.Text>
              <Skeleton title={false} paragraph={{ rows: 4 }} />
            </div>
          )}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
              <Spin />
            </div>
          )}
        </Space>
      </div>
    </ConfigProvider>
  );
} 