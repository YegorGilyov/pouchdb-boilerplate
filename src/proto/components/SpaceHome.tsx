import React from 'react';
import { Typography, Spin, Alert, Divider, Button, Tag, Card, Row, Col, Dropdown, Space, Skeleton } from 'antd';
import { ShareAltOutlined, QuestionCircleOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import { useSpaces } from '../hooks';
import { SettingsSection, SETTINGS_SECTIONS } from '../types';

interface SpaceHomeProps {
  userId: string | null;
  spaceId: string | null;
  onSettingsOpen: (settingsSection?: SettingsSection) => void;
}

export function SpaceHome({ userId, spaceId, onSettingsOpen }: SpaceHomeProps): React.ReactElement {
  // Fetch space details if spaceId is available
  const { spaces, loading, error } = useSpaces(
    spaceId ? { spaceIds: [spaceId] } : undefined
  );
  
  // Get current space
  const currentSpace = spaces?.[0];
  
  // Check if current user is an admin of the space
  const isAdmin = userId && currentSpace?.adminUserIds?.includes(userId);

  // Settings dropdown items
  const dropdownItems = {
    items: SETTINGS_SECTIONS
      .filter(section => !section.default)
      .map(section => ({
        key: section.key,
        label: section.label,
        onClick: () => onSettingsOpen(section.key)
      }))
  };
  
  // Default settings section
  const defaultSettingsSection = SETTINGS_SECTIONS.find(section => section.default);

  if (loading) {
    return (
      <Spin tip="Loading space information..." >
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

  if (!currentSpace && spaceId) {
    return (
      <Alert
        type="warning"
        message="Space not found"
        description={`The space with ID ${spaceId} could not be found.`}
        showIcon
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {currentSpace?.name || 'Please select a space'}
          </Typography.Title>
          {isAdmin && (
            <Tag color="blue" style={{ marginLeft: 8 }}>You manage this space</Tag>
          )}
        </div>
        
        <Space>
          {defaultSettingsSection && (
            <Dropdown.Button
              icon={<DownOutlined />}
              menu={dropdownItems}
              placement="bottomRight"
              onClick={() => onSettingsOpen(defaultSettingsSection.key)}
              trigger={['click']}
            >
              {defaultSettingsSection.label}
            </Dropdown.Button>
          )}
          
          <Button icon={<ShareAltOutlined />}>Share</Button>
          
          <Button icon={<QuestionCircleOutlined />} />
          
          <Button type="primary" icon={<PlusOutlined />} />
        </Space>
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Dashboard Content */}
      <div style={{ padding: 24, height: 'calc(100vh - 98px)' }}>
        <Row gutter={[24, 24]} style={{ height: '100%' }}>
          {/* First Row */}
          <Col span={12} style={{ height: '50%' }}>
            <Card style={{ height: '100%' }}>
              <Skeleton active={false} />
            </Card>
          </Col>
          <Col span={12} style={{ height: '50%' }}>
            <Card style={{ height: '100%' }}>
              <Skeleton active={false} />
            </Card>
          </Col>
          
          {/* Second Row */}
          <Col span={12} style={{ height: '50%' }}>
            <Card style={{ height: '100%' }}>
              <Skeleton active={false} />
            </Card>
          </Col>
          <Col span={12} style={{ height: '50%' }}>
            <Card style={{ height: '100%' }}>
              <Skeleton active={false} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
} 