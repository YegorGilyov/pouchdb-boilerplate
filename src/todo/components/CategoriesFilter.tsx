import { useState, useCallback } from 'react';
import { Menu, Button, Modal, Input, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCategories } from '../hooks/useCategories';
import { useTodos } from '../hooks/useTodos';
import { CategoryDocument, TodoDocument } from '../../shared/types';

interface CategoriesFilterProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoriesFilter({ 
  selectedCategory, 
  onCategorySelect 
}: CategoriesFilterProps): React.ReactElement {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { todos } = useTodos();

  // Calculate todo counts for each category
  const getTodosCount = useCallback((categoryId: string | null) => {
    if (categoryId === null) {
      // Count uncategorized todos
      return todos.filter((todo: TodoDocument) => todo.categoryIds.length === 0).length;
    } else if (categoryId === 'all') {
      // Count all todos
      return todos.length;
    } else {
      // Count todos in a specific category
      return todos.filter((todo: TodoDocument) => todo.categoryIds.includes(categoryId)).length;
    }
  }, [todos]);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryDocument | null>(null);
  const [form] = Form.useForm();

  // Create category handlers
  const showCreateModal = useCallback(() => {
    form.resetFields();
    setIsCreateModalOpen(true);
  }, [form]);

  const handleCreateCategory = useCallback(async (values: { name: string }) => {
    try {
      await createCategory(values.name);
      setIsCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [createCategory, form]);

  // Edit category handlers
  const showEditModal = useCallback((category: CategoryDocument) => {
    setCurrentCategory(category);
    form.setFieldsValue({ name: category.name });
    setIsEditModalOpen(true);
  }, [form]);

  const handleUpdateCategory = useCallback(async (values: { name: string }) => {
    if (!currentCategory) return;
    
    try {
      await updateCategory(currentCategory, values.name);
      setIsEditModalOpen(false);
      setCurrentCategory(null);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [currentCategory, updateCategory, form]);

  // Delete category handler
  const handleDeleteCategory = useCallback(async (category: CategoryDocument) => {
    try {
      await deleteCategory(category);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [deleteCategory]);

  const menuItems = [
    {
      key: 'all',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All ({getTodosCount('all')})</span>
        </div>
      ),
    },
    {
      key: 'uncategorized',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Uncategorized ({getTodosCount(null)})</span>
        </div>
      ),
    },
    ...categories.map((category: CategoryDocument) => ({
      key: category._id,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{category.name} ({getTodosCount(category._id)})</span>
          <div>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                showEditModal(category);
              }}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category);
              }}
            />
          </div>
        </div>
      ),
    }))
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px' }}>
        <Button
          icon={<PlusOutlined />}
          onClick={showCreateModal}
          block
        >
          Add Category
        </Button>
      </div>
      <div style={{ 
        height: 'calc(100vh - 154px)',
        overflow: 'auto',
      }}>
        <Menu
          mode="inline"
          selectedKeys={selectedCategory ? [selectedCategory] : []}
          onSelect={({ selectedKeys }) => onCategorySelect(selectedKeys[0])}
          style={{ border: 'none' }}
          items={menuItems}
        />
      </div>
      {/* Create Category Modal */}
      <Modal
        title="Create Category"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCategory}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter a category name' },
              { min: 2, message: 'Category name must be at least 2 characters' }
            ]}
          >
            <Input placeholder="Enter category name" autoFocus />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setCurrentCategory(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateCategory}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter a category name' },
              { min: 2, message: 'Category name must be at least 2 characters' }
            ]}
          >
            <Input placeholder="Enter category name" autoFocus />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button 
              onClick={() => {
                setIsEditModalOpen(false);
                setCurrentCategory(null);
              }} 
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 
