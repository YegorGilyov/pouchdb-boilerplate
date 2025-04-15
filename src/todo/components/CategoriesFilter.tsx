import React, { useState } from 'react';
import { List, Button, Modal, Input, Divider, Typography } from 'antd';
import { 
  FolderOutlined, 
  InboxOutlined, 
  AppstoreOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useCategories } from '../hooks/useCategories';
import { useTodos } from '../hooks/useTodos';
import { CategoryDocument } from '../../shared/types';

const { Text } = Typography;

interface CategoriesFilterProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

// Define the item type for type safety
type CategoryListItem = {
  key: string;
  icon: React.ReactNode;
  name: string;
  count: number;
  isStandard: boolean;
  category?: CategoryDocument;
};

export function CategoriesFilter({ 
  selectedCategory, 
  onCategorySelect 
}: CategoriesFilterProps): React.ReactElement {
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { todos } = useTodos();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedCategoryForAction, setSelectedCategoryForAction] = useState<CategoryDocument | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Handle opening create category modal
  const handleCreateCategory = () => {
    setCategoryName('');
    setErrorMessage('');
    setIsCreateModalOpen(true);
  };

  // Handle opening edit category modal
  const handleEditCategory = (category: CategoryDocument) => {
    setSelectedCategoryForAction(category);
    setCategoryName(category.name);
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  // Handle opening delete category modal
  const handleDeleteCategory = (category: CategoryDocument) => {
    setSelectedCategoryForAction(category);
    setIsDeleteModalOpen(true);
  };

  // Handle create category submission
  const handleCreateSubmit = async () => {
    try {
      setErrorMessage('');
      await createCategory(categoryName);
      setIsCreateModalOpen(false);
      setCategoryName('');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  // Handle edit category submission
  const handleEditSubmit = async () => {
    if (!selectedCategoryForAction) return;
    
    try {
      setErrorMessage('');
      await updateCategory(selectedCategoryForAction, categoryName);
      setIsEditModalOpen(false);
      setCategoryName('');
      setSelectedCategoryForAction(null);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  // Handle delete category submission
  const handleDeleteSubmit = async () => {
    if (!selectedCategoryForAction) return;
    
    try {
      await deleteCategory(selectedCategoryForAction);
      setIsDeleteModalOpen(false);
      setSelectedCategoryForAction(null);
      
      // If the deleted category was selected, switch to 'all'
      if (selectedCategory === selectedCategoryForAction._id) {
        onCategorySelect('all');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  // Prepare the list data - start with standard items
  const listData: CategoryListItem[] = [
    {
      key: 'all',
      icon: <AppstoreOutlined />,
      name: 'All',
      count: getCategoryCount('all'),
      isStandard: true
    },
    {
      key: 'uncategorized',
      icon: <InboxOutlined />,
      name: 'Uncategorized',
      count: getCategoryCount('uncategorized'),
      isStandard: true
    },
    // Add user categories
    ...categories.map(category => ({
      key: category._id,
      icon: <FolderOutlined />,
      name: category.name,
      count: getCategoryCount(category._id),
      isStandard: false,
      category
    }))
  ];

  return (
    <>
      {categoriesLoading && (
        <div style={{ padding: 16, textAlign: 'center' }}>Loading categories...</div>
      )}
      
      <div style={{ padding: '16px 16px 8px' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateCategory}
          block
        >
          New Category
        </Button>
      </div>
      
      <Divider style={{ margin: '0 0 8px 0' }} />
      
      <List
        size="small"
        style={{ height: 'calc(100% - 65px)', overflow: 'auto' }}
        dataSource={listData}
        renderItem={(item: CategoryListItem) => (
          <List.Item 
            key={item.key}
            style={{ 
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: selectedCategory === item.key ? '#e6f7ff' : 'transparent',
              display: 'flex',
              justifyContent: 'space-between'
            }}
            onClick={() => onCategorySelect(item.key)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
              <Text style={{ marginLeft: 8 }}>
                {item.name} ({item.count})
              </Text>
            </div>
            
            {!item.isStandard && item.category && (
              <div onClick={(e) => e.stopPropagation()}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditCategory(item.category!)}
                  style={{ marginRight: 4 }}
                />
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteCategory(item.category!)}
                  danger
                />
              </div>
            )}
          </List.Item>
        )}
      />

      {/* Create Category Modal */}
      <Modal
        title="Create New Category"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="Create"
        cancelText="Cancel"
      >
        <Input
          placeholder="Category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onPressEnter={handleCreateSubmit}
          autoFocus
        />
        {errorMessage && <div style={{ color: 'red', marginTop: 8 }}>{errorMessage}</div>}
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="Category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onPressEnter={handleEditSubmit}
          autoFocus
        />
        {errorMessage && <div style={{ color: 'red', marginTop: 8 }}>{errorMessage}</div>}
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        title="Delete Category"
        open={isDeleteModalOpen}
        onOk={handleDeleteSubmit}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete the category "{selectedCategoryForAction?.name}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
} 