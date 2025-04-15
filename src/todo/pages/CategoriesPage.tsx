import React from 'react';
import { Card } from 'antd';
import { CategoriesManagement } from '../components/CategoriesManagement';

export function CategoriesPage(): React.ReactElement {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Card style={{ flex: 1 }}>
        <CategoriesManagement />
      </Card>
    </div>
  );
} 