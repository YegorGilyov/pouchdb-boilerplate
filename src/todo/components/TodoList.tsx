import React, { useMemo } from 'react';
import { Table, Checkbox, Typography, Tag, Space, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { TodoDocument } from '../../shared/types';
import { CategoriesPicker } from './CategoriesPicker';

const { Text } = Typography;

interface TodoListProps {
  categoryId?: string;
}

export function TodoList({ categoryId = 'all' }: TodoListProps): React.ReactElement {
  const { todos, loading, updateTodo, deleteTodo, addTodoToCategory, removeTodoFromCategory } = useTodos(categoryId);
  const { categories } = useCategories();

  // Structure data for tree table (grouped by completion status)
  const tableData = useMemo(() => {
    // Separate incomplete and complete todos
    const incompleteTodos = todos.filter(todo => !todo.completed);
    const completeTodos = todos.filter(todo => todo.completed);

    // Prepare tree data structure
    return [
      {
        key: 'incomplete',
        title: `Incomplete (${incompleteTodos.length})`,
        children: incompleteTodos.map(todo => ({
          key: todo._id,
          todo: todo
        }))
      },
      {
        key: 'complete',
        title: `Complete (${completeTodos.length})`,
        children: completeTodos.map(todo => ({
          key: todo._id,
          todo: todo
        }))
      }
    ];
  }, [todos]);

  const handleToggleComplete = (todo: TodoDocument) => {
    updateTodo(todo, { completed: !todo.completed });
  };

  const handleUpdateTitle = (todo: TodoDocument, newTitle: string) => {
    updateTodo(todo, { title: newTitle });
  };

  const handleDeleteTodo = (todo: TodoDocument) => {
    deleteTodo(todo);
  };

  const handleAddCategory = (todo: TodoDocument, category: { _id: string }) => {
    addTodoToCategory(todo, category._id);
  };

  const handleRemoveCategory = (todo: TodoDocument, categoryId: string) => {
    removeTodoFromCategory(todo, categoryId);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Table columns configuration
  const columns = [
    {
      title: '',
      dataIndex: 'todo',
      key: 'status',
      width: 50,
      fixed: 'left' as const,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        return (
          <Checkbox
            checked={todo.completed}
            onChange={() => handleToggleComplete(todo)}
          />
        );
      }
    },
    {
      title: 'To-Do',
      dataIndex: 'todo',
      key: 'title',
      width: 300,
      fixed: 'left' as const,
      render: (todo: TodoDocument, record: any) => {
        if (!todo) return record.title; // For group headers
        return (
          <Text
            ellipsis={{ tooltip: todo.title }}
            editable={{
              onChange: (newTitle) => handleUpdateTitle(todo, newTitle),
              tooltip: 'Click to edit'
            }}
            style={{ width: '100%', display: 'block' }}
            // Add strikethrough for completed todos
            delete={todo.completed}
          >
            {todo.title}
          </Text>
        );
      }
    },
    {
      title: 'Categories',
      dataIndex: 'todo',
      key: 'categories',
      width: 300,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        return (
          <Space size={[0, 4]} wrap>
            {todo.categoryIds.map(catId => (
              <Tag 
                key={catId}
                closable
                onClose={(e) => {
                  e.preventDefault();
                  handleRemoveCategory(todo, catId);
                }}
              >
                {getCategoryName(catId)}
              </Tag>
            ))}
            <CategoriesPicker
              categories={categories}
              assignedCategories={todo.categoryIds}
              onCategorySelect={(category) => handleAddCategory(todo, category)}
            />
          </Space>
        );
      }
    },
    {
      title: 'Created',
      dataIndex: 'todo',
      key: 'created',
      width: 120,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        // Format date (without time)
        return new Date(todo.createdAt).toLocaleDateString();
      }
    },
    {
      title: '',
      dataIndex: 'todo',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        return (
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTodo(todo)}
            />
          </Tooltip>
        );
      }
    }
  ];

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="key"
      loading={loading}
      pagination={false}
      size="small"
      expandable={{
        defaultExpandAllRows: true
      }}
      scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
      style={{ height: '100%' }}
      // For group header rows
      childrenColumnName="children"
      indentSize={0}
    />
  );
} 