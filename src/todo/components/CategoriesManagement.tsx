import React, { useState } from 'react';
import { Button, Table, Input, Modal, Form, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCategories } from '../hooks/useCategories';
import { CategoryDocument } from '../../shared/types';

const { Title } = Typography;

export function CategoriesManagement(): React.ReactElement {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDocument | null>(null);
  const [form] = Form.useForm();

  // Create category handlers
  const showCreateModal = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateCategory = async (values: { name: string }) => {
    try {
      await createCategory(values.name);
      setIsCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Edit category handlers
  const showEditModal = (category: CategoryDocument) => {
    setSelectedCategory(category);
    form.setFieldsValue({ name: category.name });
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (values: { name: string }) => {
    if (!selectedCategory) return;
    
    try {
      await updateCategory(selectedCategory, values.name);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Delete category handler
  const handleDeleteCategory = async (category: CategoryDocument) => {
    try {
      await deleteCategory(category);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CategoryDocument) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            type="text"
          />
          <Popconfirm
            title="Delete this category?"
            description="This will not delete the todos, only the category."
            onConfirm={() => handleDeleteCategory(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={4}>Categories</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Add Category
        </Button>
      </Space>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

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
          setSelectedCategory(null);
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
                setSelectedCategory(null);
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