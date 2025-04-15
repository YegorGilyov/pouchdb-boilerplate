import React from 'react';
import { Popover, List, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CategoryDocument } from '../../shared/types';

interface CategoriesPickerProps {
  categories: CategoryDocument[];
  assignedCategories: string[];
  onCategorySelect: (category: CategoryDocument) => void;
}

export function CategoriesPicker({ 
  categories, 
  assignedCategories, 
  onCategorySelect 
}: CategoriesPickerProps): React.ReactElement {
  // Filter out already assigned categories
  const availableCategories = categories.filter(
    category => !assignedCategories.includes(category._id)
  );

  // No categories to show
  if (availableCategories.length === 0) {
    return (
      <Button 
        type="text" 
        icon={<PlusOutlined />} 
        disabled 
        title="No more categories available"
      />
    );
  }

  const content = (
    <List
      size="small"
      dataSource={availableCategories}
      renderItem={(category) => (
        <List.Item 
          key={category._id}
          onClick={() => onCategorySelect(category)}
          style={{ cursor: 'pointer' }}
        >
          {category.name}
        </List.Item>
      )}
      style={{ maxHeight: '200px', overflow: 'auto', width: '150px' }}
    />
  );

  return (
    <Popover 
      content={content} 
      title="Add category" 
      trigger="click"
      placement="bottomRight"
    >
      <Button 
        type="text" 
        icon={<PlusOutlined />} 
        title="Add category" 
      />
    </Popover>
  );
} 