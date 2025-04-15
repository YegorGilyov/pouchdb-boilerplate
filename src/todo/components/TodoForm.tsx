import React from 'react';
import { Form, Input, Button } from 'antd';
import { useTodos } from '../hooks/useTodos';

interface TodoFormProps {
  categoryId?: string;
}

export function TodoForm({ categoryId }: TodoFormProps): React.ReactElement {
  const { createTodo, loading } = useTodos();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { title: string }) => {
    try {
      // Validate that title is not empty (Ant Design form validation will handle this)
      // Create the todo
      await createTodo(values.title);
      
      // Reset the form
      form.resetFields();
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="horizontal"
      style={{ maxWidth: 600, minWidth: 400, margin: '0 auto' }}
    >
      <Form.Item
        name="title"
        rules={[{ required: true, message: 'Title cannot be empty' }]}
      >
        <Input
          placeholder="What needs to be done?"
          disabled={loading}
          size="large"
          autoFocus
        />
      </Form.Item>
      <Form.Item style={{ display: 'none' }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Add Todo
        </Button>
      </Form.Item>
    </Form>
  );
} 