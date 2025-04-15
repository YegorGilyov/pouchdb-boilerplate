import React from 'react';
import { Menu } from 'antd';
import { FolderOutlined, InboxOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useCategories } from '../hooks/useCategories';
import { useTodos } from '../hooks/useTodos';

interface CategoriesFilterProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoriesFilter({ 
  selectedCategory, 
  onCategorySelect 
}: CategoriesFilterProps): React.ReactElement {
  const { categories, loading: categoriesLoading } = useCategories();
  const { todos } = useTodos();

  // Count todos for each category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') {
      return todos.length;
    } else if (categoryId === 'uncategorized') {
      return todos.filter(todo => todo.categoryIds.length === 0).length;
    } else {
      return todos.filter(todo => todo.categoryIds.includes(categoryId)).length;
    }
  };

  // Menu items for All and Uncategorized
  const standardItems = [
    {
      key: 'all',
      icon: <AppstoreOutlined />,
      label: `All (${getCategoryCount('all')})`
    },
    {
      key: 'uncategorized',
      icon: <InboxOutlined />,
      label: `Uncategorized (${getCategoryCount('uncategorized')})`
    }
  ];

  // Menu items for user-created categories
  const categoryItems = categories.map(category => ({
    key: category._id,
    icon: <FolderOutlined />,
    label: `${category.name} (${getCategoryCount(category._id)})`
  }));

  // Combine standard and user-created category items
  const menuItems = [...standardItems, ...categoryItems];

  return (
    <>
      {categoriesLoading && (
        <div style={{ padding: 16, textAlign: 'center' }}>Loading categories...</div>
      )}
      <Menu
        mode="vertical"
        selectedKeys={[selectedCategory]}
        items={menuItems}
        onClick={(e) => onCategorySelect(e.key)}
        style={{ height: '100%', overflow: 'auto' }}
      />
    </>
  );
} 