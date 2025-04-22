import React from 'react';
import { Empty, Typography, Space } from 'antd';
import { EmptyProps } from 'antd/es/empty';

interface EmptyStateProps extends EmptyProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = 'No Data Available', 
  description = 'There are no items to display at the moment.',
  ...restProps 
}: EmptyStateProps): React.ReactElement {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <Space direction="vertical" size="middle">
        <Empty {...restProps} />
        {title && <Typography.Title level={4}>{title}</Typography.Title>}
        {description && <Typography.Paragraph>{description}</Typography.Paragraph>}
      </Space>
    </div>
  );
} 