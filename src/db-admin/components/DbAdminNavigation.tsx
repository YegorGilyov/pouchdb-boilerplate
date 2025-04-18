import React from 'react';
import { Menu } from 'antd';
import { 
  InfoCircleOutlined,
  TableOutlined, 
  FileSearchOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export function DbAdminNavigation(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Determine which sidebar item should be active based on current path
  const getSidebarSelectedKey = () => {
    if (path === '/db-admin/info') return 'db-info';
    if (path === '/db-admin/indexes') return 'db-indexes';
    if (path === '/db-admin/documents') return 'db-documents';
    if (path === '/db-admin/query') return 'db-query';
    return '';
  };

  const sidebarSelectedKey = getSidebarSelectedKey();

  // PouchDB sidebar menu items
  const sidebarItems = [
    {
      key: 'db-info',
      icon: <InfoCircleOutlined />,
      label: 'Database Info',
      onClick: () => navigate('/db-admin/info')
    },
    {
      key: 'db-indexes',
      icon: <TableOutlined />,
      label: 'Indexes',
      onClick: () => navigate('/db-admin/indexes')
    },
    {
      key: 'db-documents',
      icon: <FileSearchOutlined />,
      label: 'All Documents',
      onClick: () => navigate('/db-admin/documents')
    },
    {
      key: 'db-query',
      icon: <CodeOutlined />,
      label: 'Query Editor',
      onClick: () => navigate('/db-admin/query')
    }
  ];

  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[sidebarSelectedKey]}
      style={{ height: '100%', borderRight: 0 }}
      items={sidebarItems}
    />
  );
} 